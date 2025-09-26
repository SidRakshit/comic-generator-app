import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { billingController } from "../controllers/billing.controller";

const router = express.Router();

router.use(express.json());

router.post(
  "/checkout",
  authenticateToken,
  billingController.createCheckoutSession.bind(billingController)
);

export default router;
