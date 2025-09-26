// apps/backend/src/routes/admin.ts

import express from "express";
import { authenticateToken, requireAdminRole } from "../middleware/auth.middleware";
import { adminController } from "../controllers/admin.controller";
import { adminRateLimiter } from "../middleware/rate-limit.middleware";

const router = express.Router();

router.use(express.json());
router.use(adminRateLimiter);

router.get(
  "/dashboard",
  authenticateToken,
  requireAdminRole(),
  adminController.getDashboard.bind(adminController)
);

router.get(
  "/users",
  authenticateToken,
  requireAdminRole("manage_users"),
  adminController.getUsers.bind(adminController)
);

router.get(
  "/users/:id",
  authenticateToken,
  requireAdminRole("manage_users"),
  adminController.getUserById.bind(adminController)
);

router.post(
  "/users/:id/impersonate",
  authenticateToken,
  requireAdminRole("impersonate"),
  adminController.impersonateUser.bind(adminController)
);

router.get(
  "/users/:id/credits",
  authenticateToken,
  requireAdminRole("manage_billing"),
  adminController.getUserCredits.bind(adminController)
);

router.post(
  "/users/:id/credits",
  authenticateToken,
  requireAdminRole("manage_billing"),
  adminController.grantUserCredits.bind(adminController)
);

router.get(
  "/billing/purchases",
  authenticateToken,
  requireAdminRole("manage_billing"),
  adminController.getPurchaseHistory.bind(adminController)
);

router.get(
  "/billing/purchases/export",
  authenticateToken,
  requireAdminRole("manage_billing"),
  adminController.exportPurchaseHistory.bind(adminController)
);

router.post(
  "/billing/refund",
  authenticateToken,
  requireAdminRole("manage_billing"),
  adminController.processRefund.bind(adminController)
);

router.get(
  "/audit-logs",
  authenticateToken,
  requireAdminRole("view_audit_logs"),
  adminController.getAuditLogs.bind(adminController)
);

router.get(
  "/analytics/overview",
  authenticateToken,
  requireAdminRole("manage_billing"),
  adminController.getAnalyticsOverview.bind(adminController)
);

router.post(
  "/security/mfa/setup",
  authenticateToken,
  requireAdminRole(),
  adminController.setupMfa.bind(adminController)
);

router.post(
  "/security/mfa/verify",
  authenticateToken,
  requireAdminRole(),
  adminController.verifyMfa.bind(adminController)
);

router.delete(
  "/security/mfa",
  authenticateToken,
  requireAdminRole(),
  adminController.disableMfa.bind(adminController)
);

export default router;
