-- =============================================
-- FinFlow — Complete Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CATEGORIES
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  icon          TEXT NOT NULL DEFAULT '💰',
  color         TEXT NOT NULL DEFAULT '#00f5d4',
  is_wealth_building BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (name, icon, color, is_wealth_building) VALUES
  ('Rent',           '🏠', '#7b2fff', false),
  ('Mess/Food',      '🍱', '#ff9500', false),
  ('Daily Needs',    '🛒', '#00b4d8', false),
  ('Tech/Gaming',    '🎮', '#00f5d4', false),
  ('Skincare',       '✨', '#ff006e', false),
  ('Family Support', '❤️',  '#06d6a0', true),
  ('SIP/Investments','📈', '#ffb703', true),
  ('Transport',      '🚗', '#90e0ef', false),
  ('Entertainment',  '🎬', '#e040fb', false),
  ('Health',         '💊', '#4caf50', false),
  ('Utilities',      '⚡', '#ff7043', false),
  ('Other',          '📦', '#78909c', false)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- TRANSACTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  amount           DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  date             DATE NOT NULL DEFAULT CURRENT_DATE,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_name    TEXT NOT NULL,
  payment_method   TEXT NOT NULL CHECK (payment_method IN ('UPI','Cash','Card','Bank Transfer','EMI')),
  note             TEXT,
  is_setup_cost    BOOLEAN DEFAULT FALSE,
  is_wealth_building BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_date     ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(category_name);
CREATE INDEX IF NOT EXISTS idx_tx_wealth   ON transactions(is_wealth_building);
CREATE INDEX IF NOT EXISTS idx_tx_setup    ON transactions(is_setup_cost);

-- =============================================
-- REMITTANCES  (Family Safety Net)
-- =============================================
CREATE TABLE IF NOT EXISTS remittances (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  amount         DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  recipient      TEXT NOT NULL DEFAULT 'Family',
  note           TEXT,
  payment_method TEXT NOT NULL DEFAULT 'Bank Transfer',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rem_date ON remittances(date DESC);

-- =============================================
-- BUDGETS  (monthly targets)
-- =============================================
CREATE TABLE IF NOT EXISTS budgets (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  month           TEXT NOT NULL UNIQUE,     -- 'YYYY-MM'
  monthly_income  DECIMAL(12,2) NOT NULL DEFAULT 80000,
  wants_budget    DECIMAL(12,2) NOT NULL DEFAULT 20000,
  needs_budget    DECIMAL(12,2) NOT NULL DEFAULT 30000,
  savings_target  DECIMAL(12,2) NOT NULL DEFAULT 30000,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION _set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_tx_updated_at ON transactions;
CREATE TRIGGER trg_tx_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE PROCEDURE _set_updated_at();

-- =============================================
-- HELPER VIEW — monthly_summary
-- =============================================
CREATE OR REPLACE VIEW monthly_summary AS
SELECT
  DATE_TRUNC('month', date)::DATE                                  AS month,
  COUNT(*)                                                         AS tx_count,
  SUM(amount)                                                      AS total_spent,
  SUM(CASE WHEN NOT is_setup_cost  THEN amount ELSE 0 END)        AS true_burn,
  SUM(CASE WHEN is_wealth_building THEN amount ELSE 0 END)        AS wealth_total,
  SUM(CASE WHEN is_setup_cost      THEN amount ELSE 0 END)        AS setup_costs,
  SUM(CASE WHEN category_name = 'Family Support'   THEN amount ELSE 0 END) AS family_support,
  SUM(CASE WHEN category_name = 'SIP/Investments'  THEN amount ELSE 0 END) AS investments
FROM transactions
GROUP BY 1
ORDER BY 1 DESC;

-- =============================================
-- NOTE: Enable RLS when you add auth
-- ALTER TABLE transactions   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE remittances    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE budgets        ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
-- =============================================
