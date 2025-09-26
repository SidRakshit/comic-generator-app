-- Create table for admin impersonation tokens
CREATE TABLE IF NOT EXISTS admin_impersonation_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    redeemed_at TIMESTAMPTZ,
    redeemed_ip INET,
    redeemed_user_agent TEXT,
    metadata JSONB,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_impersonation_admin ON admin_impersonation_tokens (admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_impersonation_target ON admin_impersonation_tokens (target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_impersonation_expires ON admin_impersonation_tokens (expires_at);
