// apps/backend/src/services/stripe.service.ts

import Stripe from "stripe";
import { PoolClient } from "pg";
import {
  AdminDashboardMetrics,
  CreditPurchase,
} from "@repo/common-types";
import { calculatePanelsFromDollars } from "@repo/utils";
import pool from "../database";
import {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_SUCCESS_URL,
  STRIPE_CANCEL_URL,
} from "../config";

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2023-10-16";

export interface CheckoutSessionResult {
  checkoutSessionId: string;
  checkoutUrl: string;
}

export class StripeService {
  private readonly stripe: Stripe;

  constructor(stripeClient?: Stripe) {
    if (!STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key is not configured");
    }

    this.stripe =
      stripeClient ?? new Stripe(STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION });
  }

  async createCreditPurchaseCheckout(
    userId: string,
    dollars: number
  ): Promise<CheckoutSessionResult> {
    const normalizedAmount = Math.round(dollars);
    const panels = calculatePanelsFromDollars(normalizedAmount);

    if (!userId) {
      throw new Error("User id is required to create checkout session");
    }

    if (panels <= 0) {
      throw new Error("Amount must be at least the minimum panel bundle");
    }

    const amountCents = normalizedAmount * 100;

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: STRIPE_SUCCESS_URL,
      cancel_url: STRIPE_CANCEL_URL,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: `${panels} Panel Credits`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        internalUserId: userId,
        panels: String(panels),
        amountDollars: String(normalizedAmount),
      },
    });

    if (!session.url) {
      throw new Error("Stripe session did not return a redirect URL");
    }

    return {
      checkoutSessionId: session.id,
      checkoutUrl: session.url,
    };
  }

  async handleWebhookEvent(payload: Buffer | string, signature?: string): Promise<boolean> {
    if (!signature) {
      throw new Error("Missing Stripe signature header");
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error("Stripe signature verification failed", error);
      throw error;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const inserted = await this.insertStripeEvent(client, event);
      if (!inserted) {
        await client.query("COMMIT");
        return false;
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.recordCheckoutSession(client, session, event.id);
      }

      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Failed to process Stripe webhook event", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async addCreditsToUser(userId: string, panels: number): Promise<CreditPurchase | null> {
    if (!userId || panels <= 0) {
      return null;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const purchase = await this.addCreditsWithClient(client, userId, panels, null, null);
      await client.query("COMMIT");
      return purchase;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Failed to add credits to user", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async decrementPanelBalance(userId: string, amount: number = 1): Promise<boolean> {
    if (!userId || amount <= 0) {
      return false;
    }

    const result = await pool.query(
      `UPDATE user_credits
       SET panel_balance = panel_balance - $1,
           updated_at = NOW()
       WHERE user_id = $2 AND panel_balance >= $1` ,
      [amount, userId]
    );

    return result.rowCount ? result.rowCount > 0 : false;
  }

  async createRefund(
    stripeChargeId: string,
    reason?: string | null
  ): Promise<Stripe.Response<Stripe.Refund>> {
    if (!stripeChargeId) {
      throw new Error("Stripe charge id is required for refunds");
    }

    return this.stripe.refunds.create({
      charge: stripeChargeId,
      metadata: reason ? { reason } : undefined,
    });
  }

  async loadDashboardMetrics(): Promise<AdminDashboardMetrics> {
    const [usersResult, purchasingResult, revenueResult, panelsResult, lowBalanceResult] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM users"),
      pool.query("SELECT COUNT(DISTINCT user_id)::int AS count FROM credit_purchases"),
      pool.query(
        `SELECT COALESCE(SUM(amount_dollars), 0)::numeric AS total,
                COALESCE(AVG(amount_dollars), 0)::numeric AS average
         FROM credit_purchases`
      ),
      pool.query("SELECT COALESCE(SUM(credits_consumed), 0)::int AS total FROM panel_usage_log"),
      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM user_credits
         WHERE panel_balance <= 5`
      ),
    ]);

    const totalUsers = Number(usersResult.rows[0]?.count ?? 0);
    const purchasingUsers = Number(purchasingResult.rows[0]?.count ?? 0);
    const totalRevenue = Number(revenueResult.rows[0]?.total ?? 0);
    const averagePurchaseValue = Number(revenueResult.rows[0]?.average ?? 0);
    const totalPanelsCreated = Number(panelsResult.rows[0]?.total ?? 0);
    const usersWithLowBalance = Number(lowBalanceResult.rows[0]?.count ?? 0);

    return {
      userMetrics: {
        totalUsers,
        purchasingUsers,
        freeUsers: Math.max(totalUsers - purchasingUsers, 0),
      },
      revenueMetrics: {
        totalRevenue,
        averagePurchaseValue,
      },
      usageMetrics: {
        totalPanelsCreated,
        usersWithLowBalance,
      },
    };
  }

  private async insertStripeEvent(client: PoolClient, event: Stripe.Event): Promise<boolean> {
    const metadata = event.data?.object ?? null;

    const result = await client.query(
      `INSERT INTO stripe_events (stripe_event_id, event_type, metadata)
       VALUES ($1, $2, $3)
       ON CONFLICT (stripe_event_id) DO NOTHING`,
      [event.id, event.type, metadata]
    );

    return result.rowCount ? result.rowCount > 0 : false;
  }

  private async recordCheckoutSession(
    client: PoolClient,
    session: Stripe.Checkout.Session,
    eventId: string
  ): Promise<void> {
    const internalUserId =
      session.metadata?.internalUserId || session.metadata?.userId || undefined;

    if (!internalUserId) {
      console.warn("Checkout session missing internal userId", session.id);
      return;
    }

    const amountCents = session.amount_total ?? 0;
    const amountDollars = Math.round(amountCents) / 100;
    const amountWhole = Math.round(amountDollars);
    const panels = calculatePanelsFromDollars(amountWhole);

    if (panels <= 0) {
      console.warn("Checkout session amount did not map to a panel bundle", session.id);
      return;
    }

    const stripeChargeId =
      (typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id) || session.id;

    await this.addCreditsWithClient(
      client,
      internalUserId,
      panels,
      stripeChargeId,
      amountWhole
    );

    await client.query(
      `UPDATE stripe_events
       SET related_charge_id = $1
       WHERE stripe_event_id = $2`,
      [stripeChargeId, eventId]
    );
  }

  private async addCreditsWithClient(
    client: PoolClient,
    userId: string,
    panels: number,
    stripeChargeId: string | null,
    amountDollars: number | null
  ): Promise<CreditPurchase | null> {
    if (panels <= 0) return null;

    await client.query(
      `INSERT INTO user_credits (user_id, panel_balance)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE
       SET panel_balance = user_credits.panel_balance + EXCLUDED.panel_balance,
           updated_at = NOW()` ,
      [userId, panels]
    );

    const result = await client.query<CreditPurchase>(
      `INSERT INTO credit_purchases (user_id, stripe_charge_id, amount_dollars, panels_purchased)
       VALUES ($1, $2, $3, $4)
       RETURNING purchase_id, user_id, stripe_charge_id, amount_dollars, panels_purchased, created_at` ,
      [userId, stripeChargeId, amountDollars ?? 0, panels]
    );

    return result.rows[0] ?? null;
  }
}

export const stripeService = new StripeService();