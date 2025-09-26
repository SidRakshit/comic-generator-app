CREATE TABLE IF NOT EXISTS admin_mfa_enrollments (
    admin_user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    secret_encrypted TEXT NOT NULL,
    otpauth_url TEXT NOT NULL,
    backup_codes TEXT[] DEFAULT ARRAY[]::TEXT[],
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_mfa_verified ON admin_mfa_enrollments (verified_at);
