// backend/src/routes/index.ts

import express from "express";
import { API_ROUTES } from "@repo/common-types";
import comicRoutes from "./comics";
import userRoutes from "./user";
import adminRoutes from "./admin";
import billingRoutes from "./billing";
import webhookRoutes from "./webhooks";
import impersonationRoutes from "./impersonation";
import favoritesRoutes from "./favorites";

const router = express.Router();

router.use(API_ROUTES.ADMIN.BASE, adminRoutes);
router.use(API_ROUTES.BILLING.BASE, billingRoutes);
router.use(API_ROUTES.IMPERSONATION.BASE, impersonationRoutes);
router.use(API_ROUTES.ROOT, comicRoutes);
router.use(API_ROUTES.ROOT, userRoutes);
router.use(API_ROUTES.WEBHOOKS.BASE, webhookRoutes);
router.use(API_ROUTES.ROOT, favoritesRoutes);

router.get(API_ROUTES.ROOT, (req, res) => {
	res.json({ message: "API is running!" });
});

export default router;
