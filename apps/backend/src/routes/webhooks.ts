import express from "express";
import { stripeController } from "../controllers/stripe.controller";

const router = express.Router();

router.post("/stripe", express.json(), stripeController.handleWebhook.bind(stripeController));

export default router;
