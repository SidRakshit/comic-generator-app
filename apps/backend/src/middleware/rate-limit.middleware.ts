import rateLimit from "express-rate-limit";

export const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many admin requests. Slow down." },
});

export const impersonationExchangeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many impersonation attempts. Try again later." },
});
