// apps/backend/src/routes/admin.ts

import express from "express";
import { API_ROUTES } from "@repo/common-types";
import { authenticateToken, requireAdminRole } from "../middleware/auth.middleware";
import { adminController } from "../controllers/admin.controller";
import { adminRateLimiter } from "../middleware/rate-limit.middleware";

const router = express.Router();
const { ADMIN } = API_ROUTES;
const adminPath = (path: string): string => path.replace(ADMIN.BASE, "") || "/";

router.use(express.json());
router.use(adminRateLimiter);

router.get(
	adminPath(ADMIN.DASHBOARD),
	authenticateToken,
	requireAdminRole(),
	adminController.getDashboard.bind(adminController)
);

router.get(
	adminPath(ADMIN.USERS.BASE),
	authenticateToken,
	requireAdminRole("manage_users"),
	adminController.getUsers.bind(adminController)
);

router.get(
	adminPath(ADMIN.USERS.BY_ID(":id")),
	authenticateToken,
	requireAdminRole("manage_users"),
	adminController.getUserById.bind(adminController)
);

router.post(
	adminPath(ADMIN.USERS.IMPERSONATE(":id")),
	authenticateToken,
	requireAdminRole("impersonate"),
	adminController.impersonateUser.bind(adminController)
);

router.get(
	adminPath(ADMIN.USERS.CREDITS(":id")),
	authenticateToken,
	requireAdminRole("manage_billing"),
	adminController.getUserCredits.bind(adminController)
);

router.post(
	adminPath(ADMIN.USERS.CREDITS(":id")),
	authenticateToken,
	requireAdminRole("manage_billing"),
	adminController.grantUserCredits.bind(adminController)
);

router.get(
	adminPath(ADMIN.BILLING.PURCHASES),
	authenticateToken,
	requireAdminRole("manage_billing"),
	adminController.getPurchaseHistory.bind(adminController)
);

router.get(
	adminPath(ADMIN.BILLING.EXPORT),
	authenticateToken,
	requireAdminRole("manage_billing"),
	adminController.exportPurchaseHistory.bind(adminController)
);

router.post(
	adminPath(ADMIN.BILLING.REFUND),
	authenticateToken,
	requireAdminRole("manage_billing"),
	adminController.processRefund.bind(adminController)
);

router.get(
	adminPath(ADMIN.AUDIT_LOGS),
	authenticateToken,
	requireAdminRole("view_audit_logs"),
	adminController.getAuditLogs.bind(adminController)
);

router.get(
	adminPath(ADMIN.ANALYTICS_OVERVIEW),
	authenticateToken,
	requireAdminRole("manage_billing"),
	adminController.getAnalyticsOverview.bind(adminController)
);

router.post(
	adminPath(ADMIN.SECURITY.MFA_SETUP),
	authenticateToken,
	requireAdminRole(),
	adminController.setupMfa.bind(adminController)
);

router.post(
	adminPath(ADMIN.SECURITY.MFA_VERIFY),
	authenticateToken,
	requireAdminRole(),
	adminController.verifyMfa.bind(adminController)
);

router.delete(
	adminPath(ADMIN.SECURITY.MFA_DISABLE),
	authenticateToken,
	requireAdminRole(),
	adminController.disableMfa.bind(adminController)
);

export default router;
