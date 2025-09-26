-- Create admin audit log table
CREATE TABLE "public"."admin_audit_logs" (
    "log_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "admin_user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("log_id")
);

-- Create admin users table
CREATE TABLE "public"."admin_users" (
    "admin_user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "can_impersonate" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("admin_user_id")
);

-- Indexes for admin users
CREATE UNIQUE INDEX "admin_users_user_id_key" ON "public"."admin_users"("user_id");
CREATE INDEX "idx_admin_users_created_at" ON "public"."admin_users"("created_at");

-- Indexes for audit logs
CREATE INDEX "idx_admin_audit_admin_user" ON "public"."admin_audit_logs"("admin_user_id");
CREATE INDEX "idx_admin_audit_created_at" ON "public"."admin_audit_logs"("created_at");

-- Foreign keys
ALTER TABLE "public"."admin_audit_logs"
  ADD CONSTRAINT "admin_audit_logs_admin_user_id_fkey"
  FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("user_id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."admin_users"
  ADD CONSTRAINT "admin_users_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id")
  ON DELETE CASCADE ON UPDATE NO ACTION;
