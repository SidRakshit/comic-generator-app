// apps/backend/src/controllers/admin.controller.ts

import { Request, Response } from "express";
import type { AuthenticatedRequestFields } from "@repo/common-types";
import { stripeService } from "../services/stripe.service";
import { adminService } from "../services/admin.service";
import { recordAdminAuditLog } from "../utils/audit";
import { FRONTEND_URL } from "../config";
import { createImpersonationToken } from "../utils/impersonation";
import { encryptSecret, decryptSecret } from "../utils/encryption";
import { authenticator } from "otplib";

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
    try {
      const users = await adminService.listUsers(req.query.search as string | undefined);
      res.json(users);
    } catch (error) {
      console.error("Failed to fetch admin users", error);
      res.status(500).json({ error: "Failed to load users" });
    }
  }

  async getUserById(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "view_user", "user", {
      resourceId: req.params?.id,
    });
    try {
      const user = await adminService.getUserById(req.params.id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error("Failed to fetch user", error);
      res.status(500).json({ error: "Failed to load user" });
    }
  }

  async impersonateUser(req: AdminRequest, res: Response): Promise<void> {
    const adminUserId = req.internalUserId;
    const targetUserId = req.params?.id;

    await recordAdminAuditLog(adminUserId, "initiate_impersonation", "user", {
      resourceId: targetUserId,
    });

    if (!adminUserId || !targetUserId) {
      res.status(400).json({ error: "Missing administrator or target user context" });
      return;
    }

    try {
      const targetUser = await adminService.getUserById(targetUserId);
      if (!targetUser) {
        res.status(404).json({ error: "Target user not found" });
        return;
      }

      const tokenResult = await createImpersonationToken(adminUserId, targetUserId, {
        metadata: {
          adminEmail: req.user?.email ?? null,
          targetEmail: targetUser.email ?? null,
        },
      });

      const frontendBase = FRONTEND_URL.replace(/\/$/, "");
      const redirectUrl = `${frontendBase}/impersonate?token=${encodeURIComponent(tokenResult.token)}`;

      res.status(201).json({
        impersonationToken: tokenResult.token,
        expiresAt: tokenResult.expiresAt.toISOString(),
        frontendUrl: frontendBase,
        redirectUrl,
      });
    } catch (error) {
      console.error("Failed to create impersonation token", error);
      res.status(500).json({ error: "Failed to issue impersonation token" });
    }
  }

  async getUserCredits(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "view_user_credits", "user", {
      resourceId: req.params?.id,
    });
    try {
      const credits = await adminService.getUserCredits(req.params.id);
      if (!credits) {
        res.status(404).json({ error: "User credits not found" });
        return;
      }
      res.json(credits);
    } catch (error) {
      console.error("Failed to fetch user credits", error);
      res.status(500).json({ error: "Failed to load credits" });
    }
  }

  async grantUserCredits(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "grant_user_credits", "user", {
      resourceId: req.params?.id,
    });
    try {
      const panels = Number(req.body?.panels);
      if (!Number.isFinite(panels) || panels <= 0) {
        res.status(400).json({ error: "Panels must be a positive number" });
        return;
      }

      const purchase = await adminService.grantUserCredits(req.params.id, panels);
      res.status(201).json(purchase);
    } catch (error) {
      console.error("Failed to grant user credits", error);
      res.status(500).json({ error: "Failed to grant credits" });
    }
  }

  async getPurchaseHistory(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "list_purchases", "billing");
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const history = await adminService.getPurchaseHistory(limit ?? 200);
      res.json(history);
    } catch (error) {
      console.error("Failed to load purchase history", error);
      res.status(500).json({ error: "Failed to load purchase history" });
    }
  }

  async exportPurchaseHistory(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "export_purchase_history", "billing");
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 1000;
      const history = await adminService.getPurchaseHistory(limit);
      const header = [
        "purchase_id",
        "user_id",
        "user_email",
        "amount_dollars",
        "panels_purchased",
        "created_at",
        "stripe_charge_id",
        "status",
      ];

      const lines = history.map((row) =>
        [
          row.purchase_id,
          row.user_id,
          row.user_email ?? "",
          row.amount_dollars,
          row.panels_purchased,
          row.created_at,
          row.stripe_charge_id ?? "",
          row.status,
        ]
          .map((value) => {
            const str = typeof value === "number" ? value.toString() : value;
            if (str?.includes(",") || str?.includes("\"")) {
              return `"${str.replace(/\"/g, '""')}"`;
            }
            return str ?? "";
          })
          .join(",")
      );

      const csv = [header.join(","), ...lines].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="purchase-history-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.status(200).send(csv);
    } catch (error) {
      console.error("Failed to export purchase history", error);
      res.status(500).json({ error: "Failed to export purchase history" });
    }
  }

  async processRefund(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "process_refund", "billing");
    try {
      const stripeChargeId = req.body?.stripeChargeId as string | undefined;
      const reason = req.body?.reason as string | undefined;

      if (!stripeChargeId) {
        res.status(400).json({ error: "stripeChargeId is required" });
        return;
      }

      const refund = await adminService.processRefund(stripeChargeId, reason ?? null);
      res.status(202).json(refund);
    } catch (error) {
      console.error("Failed to process refund", error);
      res.status(500).json({ error: "Failed to process refund" });
    }
  }

  async getAuditLogs(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "view_audit_logs", "audit_log");
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const logs = await adminService.getAuditLogs(limit ?? 200);
      res.json(logs);
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
      res.status(500).json({ error: "Failed to load audit logs" });
    }
  }

  async getAnalyticsOverview(req: AdminRequest, res: Response): Promise<void> {
    await recordAdminAuditLog(req.internalUserId, "view_analytics", "analytics");
    try {
      const overview = await adminService.getAnalyticsOverview();
      res.json(overview);
    } catch (error) {
      console.error("Failed to fetch analytics overview", error);
      res.status(500).json({ error: "Failed to load analytics overview" });
    }
  }

  async setupMfa(req: AdminRequest, res: Response): Promise<void> {
    try {
      const adminUserId = req.internalUserId;
      if (!adminUserId) {
        res.status(401).json({ error: "Admin context missing" });
        return;
      }

      const secret = authenticator.generateSecret();
      const accountName = req.user?.email ?? adminUserId;
      const otpauthUrl = authenticator.keyuri(accountName, "Comic Creator Admin", secret);
      const encryptedSecret = encryptSecret(secret);

      await adminService.upsertMfaEnrollment(adminUserId, encryptedSecret, otpauthUrl);
      await recordAdminAuditLog(adminUserId, "mfa_setup_init", "admin_security");

      res.status(201).json({ secret, otpauthUrl });
    } catch (error) {
      console.error("Failed to initiate MFA setup", error);
      res.status(500).json({ error: "Failed to initiate MFA setup" });
    }
  }

  async verifyMfa(req: AdminRequest, res: Response): Promise<void> {
    try {
      const adminUserId = req.internalUserId;
      const code = req.body?.code as string | undefined;

      if (!adminUserId) {
        res.status(401).json({ error: "Admin context missing" });
        return;
      }

      if (!code) {
        res.status(400).json({ error: "MFA code is required" });
        return;
      }

      const enrollment = await adminService.getMfaEnrollment(adminUserId);
      if (!enrollment) {
        res.status(404).json({ error: "MFA enrollment not found" });
        return;
      }

      const secret = decryptSecret(enrollment.secret_encrypted);
      const isValid = authenticator.check(code, secret);
      if (!isValid) {
        res.status(400).json({ error: "Invalid MFA code" });
        return;
      }

      await adminService.markMfaVerified(adminUserId);
      await recordAdminAuditLog(adminUserId, "mfa_setup_complete", "admin_security");

      res.status(204).send();
    } catch (error) {
      console.error("Failed to verify MFA", error);
      res.status(500).json({ error: "Failed to verify MFA" });
    }
  }

  async disableMfa(req: AdminRequest, res: Response): Promise<void> {
    try {
      const adminUserId = req.internalUserId;
      if (!adminUserId) {
        res.status(401).json({ error: "Admin context missing" });
        return;
      }

      await adminService.deleteMfaEnrollment(adminUserId);
      await recordAdminAuditLog(adminUserId, "mfa_disabled", "admin_security");
      res.status(204).send();
    } catch (error) {
      console.error("Failed to disable MFA", error);
      res.status(500).json({ error: "Failed to disable MFA" });
    }
  }
}

export const adminController = new AdminController();
