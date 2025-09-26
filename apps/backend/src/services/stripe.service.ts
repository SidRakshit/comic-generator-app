// apps/backend/src/services/stripe.service.ts

import type { AdminDashboardMetrics, CreditPurchase } from "@repo/common-types";
import { calculatePanelsFromDollars } from "@repo/utils";

export interface StripeEventPayload {
  id: string;
  type: string;
  data?: Record<string, unknown>;
}

export interface CheckoutSessionResult {
  checkoutSessionId: string;
  checkoutUrl: string;
}

export class StripeService {
  // Placeholder until Stripe SDK is wired in
  constructor(private readonly stripeClient: unknown = null) {}

  async createCreditPurchaseCheckout(
    userId: string,
    dollars: number
  ): Promise<CheckoutSessionResult> {
    const panels = calculatePanelsFromDollars(dollars);

    if (!this.stripeClient) {
      throw new Error("Stripe client is not configured");
    }

    // TODO: Implement Stripe Checkout session creation
    return {
      checkoutSessionId: "",
      checkoutUrl: "",
    };
  }

  async handleSuccessfulPurchaseWebhook(event: StripeEventPayload): Promise<void> {
    if (!this.stripeClient) {
      throw new Error("Stripe client is not configured");
    }

    // TODO: Handle webhook and persist credit purchase
  }

  async addCreditsToUser(userId: string, panels: number): Promise<CreditPurchase | null> {
    if (!userId || panels <= 0) {
      return null;
    }

    // TODO: Implement credit increment mutation
    return null;
  }

  async decrementPanelBalance(userId: string, amount: number = 1): Promise<boolean> {
    if (!userId || amount <= 0) {
      return false;
    }

    // TODO: Implement balance decrement mutation
    return false;
  }

  async loadDashboardMetrics(): Promise<AdminDashboardMetrics> {
    // TODO: Aggregate metrics once billing tables are populated
    return {
      userMetrics: {
        totalUsers: 0,
        purchasingUsers: 0,
        freeUsers: 0,
      },
      revenueMetrics: {
        totalRevenue: 0,
        averagePurchaseValue: 0,
      },
      usageMetrics: {
        totalPanelsCreated: 0,
        usersWithLowBalance: 0,
      },
    };
  }
}

export const stripeService = new StripeService();
