// backend/src/routes/index.ts

import express from "express";
import comicRoutes from "./comics";
import userRoutes from "./user";
import adminRoutes from "./admin";
import billingRoutes from "./billing";
import webhookRoutes from "./webhooks";
import impersonationRoutes from "./impersonation";
import favoritesRoutes from "./favorites";

const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/billing", billingRoutes);
router.use("/impersonation", impersonationRoutes);
router.use("/", comicRoutes);
router.use("/", userRoutes);
router.use("/webhooks", webhookRoutes);
router.use("/", favoritesRoutes);

router.get("/", (req, res) => {
	res.json({ message: "API is running!" });
});

export default router;