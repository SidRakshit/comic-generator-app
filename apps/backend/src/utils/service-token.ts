import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { ADMIN_SERVICE_TOKEN, ADMIN_SERVICE_TOKEN_HASH } from "../config";

const KEY_LENGTH = 64;

function constantTimeEqualHex(lhsHex: string, rhsHex: string): boolean {
  const lhs = Buffer.from(lhsHex, "hex");
  const rhs = Buffer.from(rhsHex, "hex");

  if (lhs.length !== rhs.length) {
    return false;
  }

  return timingSafeEqual(lhs, rhs);
}

export interface ServiceTokenVerificationResult {
  valid: boolean;
  reason?: string;
}

export function verifyServiceToken(providedToken?: string | null): ServiceTokenVerificationResult {
  if (!providedToken) {
    return { valid: false, reason: "missing" };
  }

  if (ADMIN_SERVICE_TOKEN && providedToken === ADMIN_SERVICE_TOKEN) {
    return { valid: true };
  }

  if (!ADMIN_SERVICE_TOKEN_HASH) {
    return { valid: false, reason: "no-hash-configured" };
  }

  const [salt, hash] = ADMIN_SERVICE_TOKEN_HASH.split(":");
  if (!salt || !hash) {
    return { valid: false, reason: "invalid-hash-format" };
  }

  const derived = scryptSync(providedToken, Buffer.from(salt, "hex"), KEY_LENGTH).toString("hex");
  const valid = constantTimeEqualHex(derived, hash);
  return { valid };
}

export function generateServiceToken(): { token: string; salt: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(token, Buffer.from(salt, "hex"), KEY_LENGTH).toString("hex");

  return { token, salt, hash: derived };
}
