-- ================================================
-- EMPIRE FINANCE — Schema Supabase
-- Exécute ce script dans l'éditeur SQL de Supabase
-- Dashboard > SQL Editor > New Query > coller > Run
-- ================================================

-- Table des dépenses
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL DEFAULT 'divers',
  note TEXT DEFAULT '',
  date TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table de l'épargne
CREATE TABLE IF NOT EXISTS savings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  amount NUMERIC NOT NULL,
  goal TEXT DEFAULT 'general',
  note TEXT DEFAULT '',
  date TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des investissements BRVM
CREATE TABLE IF NOT EXISTS brvm (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  amount NUMERIC NOT NULL,
  ticker TEXT DEFAULT '',
  note TEXT DEFAULT '',
  date TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les requêtes par date
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_savings_date ON savings(date);
CREATE INDEX IF NOT EXISTS idx_brvm_date ON brvm(date);

-- ================================================
-- SÉCURITÉ RLS (Row Level Security)
-- Puisque c'est ton app perso, on autorise tout
-- avec la clé anon. Pour plus de sécurité plus tard,
-- tu pourras ajouter l'auth Supabase.
-- ================================================

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE brvm ENABLE ROW LEVEL SECURITY;

-- Politique: tout autoriser avec la clé anon (usage personnel)
CREATE POLICY "Allow all for anon" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON savings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON brvm FOR ALL USING (true) WITH CHECK (true);
