import pool from "../database";

interface AuditOptions {
  resourceId?: string;
  metadata?: Record<string, unknown> | null;
}

/**
 * Records an administrative action in the audit log. Errors are logged but do not throw to avoid
 * interrupting primary request handling.
 */
export async function recordAdminAuditLog(
  adminUserId: string | undefined,
  action: string,
  resourceType: string,
  options: AuditOptions = {}
): Promise<void> {
  if (!adminUserId) return;

  try {
    await pool.query(
      `INSERT INTO admin_audit_logs (admin_user_id, action, resource_type, resource_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminUserId, action, resourceType, options.resourceId ?? null, options.metadata ?? null]
    );
  } catch (error) {
    console.warn("Failed to record admin audit log:", error);
  }
}
