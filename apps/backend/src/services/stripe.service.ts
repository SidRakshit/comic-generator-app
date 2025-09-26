// apps/backend/src/services/stripe.service.ts

import { AdminDashboardMetrics, CreditPurchase } from "@repo/common-types";
import { calculatePanelsFromDollars } from "@repo/utils";
import pool from "../database";
import { PoolClient } from "pg";

export interface StripeWebhookEvent<T = unknown> {
  id: string;
  type: string;
  data?: {
    object?: T;
  };
}

interface CheckoutSessionLike {
  id: string;
  metadata?: Record<string, string | undefined>;
  amount_total?: number | null;
  payment_intent?: string | null;
}

export interface CheckoutSessionResult {
  checkoutSessionId: string;
  checkoutUrl: string;
}

export class StripeService {
  constructor(private readonly stripeClient: unknown = null) {}

  async createCreditPurchaseCheckout(
    _userId: string,
    _dollars: number
  ): Promise<CheckoutSessionResult> {
    if (!this.stripeClient) {
      throw new Error("Stripe client is not configured");
    }

    // Actual Checkout creation will be implemented once Stripe SDK is wired in
    return {
      checkoutSessionId: "",
      checkoutUrl: "",
    };
  }

  async handleWebhookEvent(event: StripeWebhookEvent): Promise<boolean> {
    if (!event?.id || !event?.type) {
      console.warn("Stripe webhook missing required fields", event);
      return false;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const inserted = await this.insertStripeEvent(client, event);
      if (!inserted) {
        await client.query("COMMIT");
        return false; // already processed
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data?.object as CheckoutSessionLike | undefined;
        if (session) {
          await this.recordCheckoutSession(client, session, event.id);
        }
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
       WHERE user_id = $2 AND panel_balance >= $1
       RETURNING panel_balance` ,
      [amount, userId]
    );

    return result.rowCount > 0;
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

  private async insertStripeEvent(client: PoolClient, event: StripeWebhookEvent): Promise<boolean> {
    const result = await client.query(
      `INSERT INTO stripe_events (stripe_event_id, event_type, metadata)
       VALUES ($1, $2, $3)
       ON CONFLICT (stripe_event_id) DO NOTHING`,
      [event.id, event.type, event.data ?? null]
    );

    return result.rowCount > 0;
  }

  private async recordCheckoutSession(
    client: PoolClient,
    session: CheckoutSessionLike,
    eventId: string
  ): Promise<void> {
    const internalUserId = session.metadata?.internalUserId || session.metadata?.userId;
    if (!internalUserId) {
      console.warn("Checkout session missing internal user id", session);
      return;
    }

    const amountCents = session.amount_total ?? 0;
    const amountDollars = Math.round(amountCents) / 100;
    const amountDollarsInt = Math.round(amountDollars);
    const panels = calculatePanelsFromDollars(amountDollarsInt);

    if (panels <= 0) {
      console.warn("Checkout session amount too low to grant panels", session);
      return;
    }

    const stripeChargeId = session.payment_intent ?? session.id;

    await this.addCreditsWithClient(
      client,
      internalUserId,
      panels,
      stripeChargeId,
      amountDollarsInt
    );

    await client.query(
      `UPDATE stripe_events
       SET related_charge_id = $1
       WHERE stripe_event_id = $2`,
      [stripeChargeId, eventId]
    );

    return;
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
