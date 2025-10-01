import express from "express";
import { API_ROUTES } from "@repo/common-types";
import { stripeController } from "../controllers/stripe.controller";

const router = express.Router();
const { WEBHOOKS } = API_ROUTES;
const webhookPath = (path: string): string => path.replace(WEBHOOKS.BASE, "") || "/";

router.post(
	webhookPath(WEBHOOKS.STRIPE),
	express.raw({ type: "application/json" }),
	stripeController.handleWebhook.bind(stripeController)
);

export default router;
