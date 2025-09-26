INSERT INTO admin_users (user_id, roles, permissions, can_impersonate)
VALUES (
  :user_id,
  ARRAY['super_admin'],
  ARRAY['manage_admins','manage_users','manage_content','manage_billing','impersonate','view_audit_logs'],
  TRUE
)
ON CONFLICT (user_id) DO NOTHING;
