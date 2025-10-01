import express from "express";
import { API_ROUTES } from "@repo/common-types";
import { authenticateToken } from "../middleware/auth.middleware";
import { billingController } from "../controllers/billing.controller";

const router = express.Router();
const { BILLING } = API_ROUTES;
const billingPath = (path: string): string => path.replace(BILLING.BASE, "") || "/";

router.use(express.json());

router.post(
	billingPath(BILLING.CHECKOUT),
	authenticateToken,
	billingController.createCheckoutSession.bind(billingController)
);

export default router;
