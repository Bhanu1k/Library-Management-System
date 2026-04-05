-- ============================================================
-- Library Management System — Schema Migrations

-- ============================================================

-- ── users upgrades ───────────────────────────────────────────
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS email           VARCHAR(150);
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS full_name       VARCHAR(100);
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS phone           VARCHAR(20);
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500);
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS active          BOOLEAN;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS member_id       BIGINT;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS created_at      TIMESTAMP;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMP;

UPDATE users SET active     = TRUE              WHERE active     IS NULL;
UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

ALTER TABLE IF EXISTS users ALTER COLUMN active     SET DEFAULT TRUE;
ALTER TABLE IF EXISTS users ALTER COLUMN active     SET NOT NULL;
ALTER TABLE IF EXISTS users ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS users ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE IF EXISTS users ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS users ALTER COLUMN updated_at SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_users_email ON users (email) WHERE email IS NOT NULL;

-- ── loans upgrades ───────────────────────────────────────────
ALTER TABLE IF EXISTS loans ADD COLUMN IF NOT EXISTS fine_paid          BOOLEAN;
ALTER TABLE IF EXISTS loans ADD COLUMN IF NOT EXISTS fine_paid_at       TIMESTAMP;
ALTER TABLE IF EXISTS loans ADD COLUMN IF NOT EXISTS fine_waived        BOOLEAN;
ALTER TABLE IF EXISTS loans ADD COLUMN IF NOT EXISTS fine_waived_at     TIMESTAMP;
ALTER TABLE IF EXISTS loans ADD COLUMN IF NOT EXISTS fine_waived_reason VARCHAR(300);

UPDATE loans SET fine_paid   = FALSE WHERE fine_paid   IS NULL;
UPDATE loans SET fine_waived = FALSE WHERE fine_waived IS NULL;

ALTER TABLE IF EXISTS loans ALTER COLUMN fine_paid   SET DEFAULT FALSE;
ALTER TABLE IF EXISTS loans ALTER COLUMN fine_waived SET DEFAULT FALSE;

-- ── members upgrades ─────────────────────────────────────────
ALTER TABLE IF EXISTS members ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE IF EXISTS members ADD COLUMN IF NOT EXISTS status VARCHAR(20);

UPDATE members SET status = 'ACTIVE' WHERE status IS NULL;
ALTER TABLE IF EXISTS members ALTER COLUMN status SET DEFAULT 'ACTIVE';
ALTER TABLE IF EXISTS members ALTER COLUMN status SET NOT NULL;
