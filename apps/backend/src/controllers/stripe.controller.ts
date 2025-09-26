import { Request, Response } from "express";
import { stripeService } from "../services/stripe.service";

export class StripeController {
  async handleWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers["stripe-signature"] as string | undefined;
    try {
      const processed = await stripeService.handleWebhookEvent(req.body, signature);
      if (!processed) {
        res.status(202).json({ status: "ignored" });
        return;
      }
      res.status(200).json({ status: "processed" });
    } catch (error) {
      console.error("Stripe webhook processing failed:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  }
}

export const stripeController = new StripeController();
