-- ============================================================
-- Custom magic link tokens for trainer login
-- ============================================================

CREATE TABLE login_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_login_tokens_token ON login_tokens(token);
CREATE INDEX idx_login_tokens_email ON login_tokens(email);
