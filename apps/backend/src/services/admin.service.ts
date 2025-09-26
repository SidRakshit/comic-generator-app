import { CreditPurchase } from "@repo/common-types";
import pool from "../database";
import { stripeService } from "./stripe.service";
import { AdminAnalyticsOverview } from "@repo/common-types";

export interface AdminUserListItem {
  user_id: string;
  email: string | null;
  username: string | null;
  panel_balance: number;
  total_spent: number;
  last_purchase: string | null;
  roles: string[];
  permissions: string[];
}

export interface UserCreditsSummary {
  user_id: string;
  panel_balance: number;
  last_purchased_at: string | null;
}

export interface PurchaseHistoryItem {
  purchase_id: string;
  user_id: string;
  user_email: string | null;
  amount_dollars: number;
  panels_purchased: number;
  created_at: string;
  stripe_charge_id: string | null;
  status: string;
}

export interface AuditLogEntry {
  log_id: string;
  admin_user_id: string;
  admin_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  created_at: string;
}

class AdminService {
  async listUsers(search?: string): Promise<AdminUserListItem[]> {
    const values: unknown[] = [];
    let whereClause = "";

    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      whereClause = "WHERE LOWER(u.email) LIKE $1 OR LOWER(u.username) LIKE $1";
    }

    const query = `
      SELECT
        u.user_id,
        u.email,
        u.username,
        COALESCE(uc.panel_balance, 0) AS panel_balance,
        COALESCE(SUM(cp.amount_dollars), 0) AS total_spent,
        MAX(cp.created_at) AS last_purchase,
        COALESCE(au.roles, ARRAY[]::TEXT[]) AS roles,
        COALESCE(au.permissions, ARRAY[]::TEXT[]) AS permissions
      FROM users u
      LEFT JOIN user_credits uc ON uc.user_id = u.user_id
      LEFT JOIN credit_purchases cp ON cp.user_id = u.user_id
      LEFT JOIN admin_users au ON au.user_id = u.user_id
      ${whereClause}
      GROUP BY u.user_id, uc.panel_balance, au.roles, au.permissions
      ORDER BY MAX(cp.created_at) DESC NULLS LAST, u.created_at DESC
      LIMIT 200;
    `;

    const result = await pool.query(query, values);

    return result.rows.map((row) => ({
      user_id: row.user_id,
      email: row.email,
      username: row.username,
      panel_balance: Number(row.panel_balance ?? 0),
      total_spent: Number(row.total_spent ?? 0),
      last_purchase: row.last_purchase ? new Date(row.last_purchase).toISOString() : null,
      roles: row.roles ?? [],
      permissions: row.permissions ?? [],
    }));
  }

  async getUserById(userId: string): Promise<AdminUserListItem | null> {
    const result = await pool.query(
      `SELECT
         u.user_id,
         u.email,
         u.username,
         COALESCE(uc.panel_balance, 0) AS panel_balance,
         COALESCE(SUM(cp.amount_dollars), 0) AS total_spent,
         MAX(cp.created_at) AS last_purchase,
         COALESCE(au.roles, ARRAY[]::TEXT[]) AS roles,
         COALESCE(au.permissions, ARRAY[]::TEXT[]) AS permissions
       FROM users u
       LEFT JOIN user_credits uc ON uc.user_id = u.user_id
       LEFT JOIN credit_purchases cp ON cp.user_id = u.user_id
       LEFT JOIN admin_users au ON au.user_id = u.user_id
       WHERE u.user_id = $1
       GROUP BY u.user_id, uc.panel_balance, au.roles, au.permissions`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      user_id: row.user_id,
      email: row.email,
      username: row.username,
      panel_balance: Number(row.panel_balance ?? 0),
      total_spent: Number(row.total_spent ?? 0),
      last_purchase: row.last_purchase ? new Date(row.last_purchase).toISOString() : null,
      roles: row.roles ?? [],
      permissions: row.permissions ?? [],
    };
  }

  async getUserCredits(userId: string): Promise<UserCreditsSummary | null> {
    const result = await pool.query(
      `SELECT user_id, panel_balance, last_purchased_at
       FROM user_credits
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      user_id: row.user_id,
      panel_balance: Number(row.panel_balance ?? 0),
      last_purchased_at: row.last_purchased_at
        ? new Date(row.last_purchased_at).toISOString()
        : null,
    };
  }

  async grantUserCredits(userId: string, panels: number): Promise<CreditPurchase | null> {
    return stripeService.addCreditsToUser(userId, panels);
  }

  async getPurchaseHistory(limit = 200): Promise<PurchaseHistoryItem[]> {
    const result = await pool.query(
      `SELECT
         cp.purchase_id,
         cp.user_id,
         u.email AS user_email,
         cp.amount_dollars,
         cp.panels_purchased,
         cp.created_at,
         cp.stripe_charge_id,
         'succeeded' AS status
       FROM credit_purchases cp
       LEFT JOIN users u ON u.user_id = cp.user_id
       ORDER BY cp.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map((row) => ({
      purchase_id: row.purchase_id,
      user_id: row.user_id,
      user_email: row.user_email,
      amount_dollars: Number(row.amount_dollars ?? 0),
      panels_purchased: Number(row.panels_purchased ?? 0),
      created_at: new Date(row.created_at).toISOString(),
      stripe_charge_id: row.stripe_charge_id,
      status: row.status,
    }));
  }

  async processRefund(stripeChargeId: string, reason?: string | null) {
    return stripeService.createRefund(stripeChargeId, reason ?? null);
  }

  async getAuditLogs(limit = 200): Promise<AuditLogEntry[]> {
    const result = await pool.query(
      `SELECT
         al.log_id,
         al.admin_user_id,
         u.email AS admin_email,
         al.action,
         al.resource_type,
         al.resource_id,
         al.created_at
       FROM admin_audit_logs al
       LEFT JOIN users u ON u.user_id = al.admin_user_id
       ORDER BY al.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map((row) => ({
      log_id: row.log_id,
      admin_user_id: row.admin_user_id,
      admin_email: row.admin_email,
      action: row.action,
      resource_type: row.resource_type,
      resource_id: row.resource_id,
      created_at: new Date(row.created_at).toISOString(),
    }));
  }

  async getAnalyticsOverview(): Promise<AdminAnalyticsOverview> {
    const [revenueByMonthResult, funnelResult, topPurchasersResult, usageByDayResult] = await Promise.all([
      pool.query(
        `SELECT TO_CHAR(created_at, 'YYYY-MM') AS month,
                SUM(amount_dollars) AS total
         FROM credit_purchases
         GROUP BY 1
         ORDER BY 1 ASC`
      ),
      pool.query(
        `SELECT 'total_users' AS stage, COUNT(*)::int AS count FROM users
         UNION ALL
         SELECT 'purchasing_users' AS stage, COUNT(DISTINCT user_id)::int FROM credit_purchases
         UNION ALL
         SELECT 'active_creators' AS stage, COUNT(DISTINCT user_id)::int FROM panel_usage_log`
      ),
      pool.query(
        `SELECT u.user_id,
                u.email,
                SUM(cp.amount_dollars) AS total_spent
         FROM credit_purchases cp
         LEFT JOIN users u ON u.user_id = cp.user_id
         GROUP BY u.user_id, u.email
         ORDER BY SUM(cp.amount_dollars) DESC
         LIMIT 10`
      ),
      pool.query(
        `SELECT TO_CHAR(created_at::date, 'YYYY-MM-DD') AS day,
                SUM(credits_consumed) AS panels
         FROM panel_usage_log
         GROUP BY created_at::date
         ORDER BY day ASC
         LIMIT 120`
      ),
    ]);

    return {
      revenueByMonth: revenueByMonthResult.rows.map((row) => ({
        month: row.month,
        total: Number(row.total ?? 0),
      })),
      conversionFunnel: funnelResult.rows.map((row) => ({
        stage: row.stage,
        count: Number(row.count ?? 0),
      })),
      topPurchasers: topPurchasersResult.rows.map((row) => ({
        user_id: row.user_id,
        email: row.email,
        total_spent: Number(row.total_spent ?? 0),
      })),
      panelUsageByDay: usageByDayResult.rows.map((row) => ({
        day: row.day,
        panels: Number(row.panels ?? 0),
      })),
    };
  }

  async upsertMfaEnrollment(adminUserId: string, secretEncrypted: string, otpauthUrl: string): Promise<void> {
    await pool.query(
      `INSERT INTO admin_mfa_enrollments (admin_user_id, secret_encrypted, otpauth_url, verified_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW())
       ON CONFLICT (admin_user_id) DO UPDATE
       SET secret_encrypted = EXCLUDED.secret_encrypted,
           otpauth_url = EXCLUDED.otpauth_url,
           verified_at = NULL,
           updated_at = NOW()` ,
      [adminUserId, secretEncrypted, otpauthUrl]
    );
  }

  async getMfaEnrollment(adminUserId: string): Promise<{ secret_encrypted: string; verified: boolean } | null> {
    const result = await pool.query<{ secret_encrypted: string; verified_at: Date | null }>(
      `SELECT secret_encrypted, verified_at
       FROM admin_mfa_enrollments
       WHERE admin_user_id = $1`,
      [adminUserId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      secret_encrypted: result.rows[0].secret_encrypted,
      verified: !!result.rows[0].verified_at,
    };
  }

  async markMfaVerified(adminUserId: string): Promise<void> {
    await pool.query(
      `UPDATE admin_mfa_enrollments
       SET verified_at = NOW(), updated_at = NOW()
       WHERE admin_user_id = $1`,
      [adminUserId]
    );
  }

  async deleteMfaEnrollment(adminUserId: string): Promise<void> {
    await pool.query(
      `DELETE FROM admin_mfa_enrollments WHERE admin_user_id = $1`,
      [adminUserId]
    );
  }
}

export const adminService = new AdminService();