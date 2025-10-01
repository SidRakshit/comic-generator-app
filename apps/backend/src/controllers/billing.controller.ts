import { Request, Response } from "express";
import type { AuthenticatedRequestFields } from "@repo/common-types";
import { stripeService } from "../services/stripe.service";
import { recordAdminAuditLog } from "../utils/audit";

export type BillingRequest = Request & AuthenticatedRequestFields;

export class BillingController {
  async createCheckoutSession(req: BillingRequest, res: Response): Promise<void> {
    try {
      const internalUserId = req.internalUserId;
      if (!internalUserId) {
        res.status(401).json({ error: "User context missing" });
        return;
      }

      const amount = Number(req.body?.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        res.status(400).json({ error: "Amount must be a positive number" });
        return;
      }

      const session = await stripeService.createCreditPurchaseCheckout(internalUserId, amount);
      res.status(201).json(session);
    } catch (error) {
      console.error("Failed to create Stripe checkout session", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  }

  async refundCharge(req: BillingRequest, res: Response): Promise<void> {
    const internalUserId = req.internalUserId;
    await recordAdminAuditLog(internalUserId, "user_refund_request", "billing");
    res.status(501).json({ error: "Direct refund requests are handled by admins." });
  }
}

export const billingController = new BillingController();
