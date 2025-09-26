import express from "express";
import { stripeController } from "../controllers/stripe.controller";

const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeController.handleWebhook.bind(stripeController)
);

export default router;
