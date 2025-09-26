// Domain types for administrative features

import type { User } from './user';

export type AdminRole =
  | 'super_admin'
  | 'content_moderator'
  | 'support_agent'
  | 'billing_specialist';

export type AdminPermission =
  | 'manage_admins'
  | 'manage_users'
  | 'manage_content'
  | 'manage_billing'
  | 'impersonate'
  | 'view_audit_logs';

export interface AdminUser extends User {
  roles: AdminRole[];
  permissions: AdminPermission[];
  isAdmin: boolean;
  canImpersonate: boolean;
}

export interface AdminDashboardMetrics {
  userMetrics: {
    totalUsers: number;
    purchasingUsers: number;
    freeUsers: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    averagePurchaseValue: number;
  };
  usageMetrics: {
    totalPanelsCreated: number;
    usersWithLowBalance: number;
  };
}

export interface AdminDashboardResponse extends AdminDashboardMetrics {
  generated_at: string;
}

export interface AdminAuditLogEntry {
  log_id: string;
  actor_admin_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}
