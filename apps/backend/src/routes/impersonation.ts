import express from "express";
import { verifyImpersonationToken } from "../utils/impersonation";
import { impersonationExchangeLimiter } from "../middleware/rate-limit.middleware";

const router = express.Router();

router.use(express.json());

router.post("/exchange", impersonationExchangeLimiter, async (req, res) => {
  try {
    const rawToken = req.body?.token as string | undefined;
    const verification = await verifyImpersonationToken(rawToken, {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string | undefined,
    });

    if (!verification.valid || !verification.targetUserId) {
      res.status(401).json({ error: "Invalid or expired impersonation token" });
      return;
    }

    res.json({
      impersonationToken: rawToken,
      targetUserId: verification.targetUserId,
      adminUserId: verification.adminUserId ?? null,
      expiresAt: verification.expiresAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Failed to validate impersonation token", error);
    res.status(500).json({ error: "Failed to validate impersonation token" });
  }
});

export default router;
