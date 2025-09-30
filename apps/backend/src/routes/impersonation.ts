import express from "express";
import { API_ROUTES } from "@repo/common-types";
import { verifyImpersonationToken } from "../utils/impersonation";
import { impersonationExchangeLimiter } from "../middleware/rate-limit.middleware";

const router = express.Router();
const { IMPERSONATION } = API_ROUTES;
const impersonationPath = (path: string): string => path.replace(IMPERSONATION.BASE, "") || "/";

router.use(express.json());

router.post(impersonationPath(IMPERSONATION.EXCHANGE), impersonationExchangeLimiter, async (req, res) => {
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
