// apps/backend/src/controllers/admin.controller.ts

import { Request, Response } from "express";
import type { AuthenticatedRequestFields } from "@repo/common-types";
import { stripeService } from "../services/stripe.service";
import { recordAdminAuditLog } from "../utils/audit";

export type AdminRequest = Request & AuthenticatedRequestFields;

export class AdminController {
  async getDashboard(req: AdminRequest, res: Response): Promise<void> {
    try {
      const metrics = await stripeService.loadDashboardMetrics();
      await recordAdminAuditLog(req.internalUserId, "view_dashboard", "admin_dashboard");
      res.status(200).json(metrics);
    } catch (error) {
      console.error("Failed to load admin dashboard metrics:", error);
      res.status(500).json({ error: "Failed to load dashboard metrics." });
    }
  }

  async getUsers(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "list_users", "user");
    res.status(501).json({ error: "Not implemented" });
  }

  async getUserById(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "view_user", "user", {
      resourceId: req.params?.id,
    });
    res.status(501).json({ error: "Not implemented" });
  }

  async impersonateUser(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "attempt_impersonation", "user", {
      resourceId: req.params?.id,
    });
    res.status(501).json({ error: "Not implemented" });
  }

  async getUserCredits(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "view_user_credits", "user", {
      resourceId: req.params?.id,
    });
    res.status(501).json({ error: "Not implemented" });
  }

  async grantUserCredits(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "grant_user_credits", "user", {
      resourceId: req.params?.id,
    });
    res.status(501).json({ error: "Not implemented" });
  }

  async getPurchaseHistory(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "list_purchases", "billing");
    res.status(501).json({ error: "Not implemented" });
  }

  async processRefund(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "process_refund", "billing");
    res.status(501).json({ error: "Not implemented" });
  }

  async getAuditLogs(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "view_audit_logs", "audit_log");
    res.status(501).json({ error: "Not implemented" });
  }
}

export const adminController = new AdminController();
