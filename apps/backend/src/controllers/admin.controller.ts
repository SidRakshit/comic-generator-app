// apps/backend/src/controllers/admin.controller.ts

import { Request, Response } from "express";
import type { AuthenticatedRequestFields } from "@repo/common-types";
import { stripeService } from "../services/stripe.service";

export type AdminRequest = Request & AuthenticatedRequestFields;

export class AdminController {
  async getDashboard(req: AdminRequest, res: Response): Promise<void> {
    try {
      const metrics = await stripeService.loadDashboardMetrics();
      res.status(200).json(metrics);
    } catch (error) {
      console.error("Failed to load admin dashboard metrics:", error);
      res.status(500).json({ error: "Failed to load dashboard metrics." });
    }
  }

  async getUsers(_req: AdminRequest, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async getUserById(_req: AdminRequest, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async impersonateUser(_req: AdminRequest, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async getUserCredits(_req: AdminRequest, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async grantUserCredits(_req: AdminRequest, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async getPurchaseHistory(_req: AdminRequest, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async processRefund(_req: AdminRequest, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async getAuditLogs(_req: AdminRequest, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }
}

export const adminController = new AdminController();
