import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import pool from "../database";

const KEY_LENGTH = 64;
const DEFAULT_TTL_MINUTES = 15;

interface TokenRecord {
  token_id: string;
  admin_user_id: string;
  target_user_id: string;
  token_hash: string;
  expires_at: Date;
  metadata: Record<string, unknown> | null;
}

export interface CreateImpersonationTokenResult {
  token: string;
  tokenId: string;
  expiresAt: Date;
}

export interface CreateImpersonationOptions {
  ttlMinutes?: number;
  metadata?: Record<string, unknown> | null;
}

export interface VerifyImpersonationResult {
  valid: boolean;
  adminUserId?: string;
  targetUserId?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown> | null;
  reason?: string;
}

export interface VerificationContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

function deriveHash(token: string, saltHex: string): string {
  return scryptSync(token, Buffer.from(saltHex, "hex"), KEY_LENGTH).toString("hex");
}

function constantTimeEqualHex(lhsHex: string, rhsHex: string): boolean {
  const lhs = Buffer.from(lhsHex, "hex");
  const rhs = Buffer.from(rhsHex, "hex");
  if (lhs.length !== rhs.length) {
    return false;
  }
  return timingSafeEqual(lhs, rhs);
}

export async function createImpersonationToken(
  adminUserId: string,
  targetUserId: string,
  options: CreateImpersonationOptions = {}
): Promise<CreateImpersonationTokenResult> {
  const ttlMinutes = options.ttlMinutes ?? DEFAULT_TTL_MINUTES;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  const tokenId = randomUUID();
  const secret = randomBytes(32).toString("base64url");
  const salt = randomBytes(16).toString("hex");
  const hash = deriveHash(secret, salt);
  const storedHash = `${salt}:${hash}`;

  await pool.query(
    `INSERT INTO admin_impersonation_tokens (token_id, admin_user_id, target_user_id, token_hash, expires_at, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)` ,
    [
      tokenId,
      adminUserId,
      targetUserId,
      storedHash,
      expiresAt,
      options.metadata ?? null,
    ]
  );

  return {
    token: `${tokenId}.${secret}`,
    tokenId,
    expiresAt,
  };
}

export async function verifyImpersonationToken(
  rawToken: string | null | undefined,
  context: VerificationContext = {}
): Promise<VerifyImpersonationResult> {
  if (!rawToken) {
    return { valid: false, reason: "missing" };
  }

  const [tokenId, secret] = rawToken.split(".");
  if (!tokenId || !secret) {
    return { valid: false, reason: "invalid-format" };
  }

  const result = await pool.query<TokenRecord>(
    `SELECT token_id, admin_user_id, target_user_id, token_hash, expires_at, metadata
     FROM admin_impersonation_tokens
     WHERE token_id = $1` ,
    [tokenId]
  );

  if (result.rows.length === 0) {
    return { valid: false, reason: "not-found" };
  }

  const record = result.rows[0];
  const now = new Date();
  if (record.expires_at.getTime() < now.getTime()) {
    return { valid: false, reason: "expired" };
  }

  const [salt, hash] = record.token_hash.split(":");
  if (!salt || !hash) {
    return { valid: false, reason: "invalid-hash" };
  }

  const derived = deriveHash(secret, salt);
  if (!constantTimeEqualHex(derived, hash)) {
    return { valid: false, reason: "mismatch" };
  }

  await pool.query(
    `UPDATE admin_impersonation_tokens
     SET last_used_at = NOW(),
         redeemed_ip = COALESCE(redeemed_ip, $2::inet),
         redeemed_user_agent = COALESCE(redeemed_user_agent, $3)
     WHERE token_id = $1` ,
    [tokenId, context.ipAddress ?? null, context.userAgent ?? null]
  );

  return {
    valid: true,
    adminUserId: record.admin_user_id,
    targetUserId: record.target_user_id,
    expiresAt: record.expires_at,
    metadata: record.metadata,
  };
}
