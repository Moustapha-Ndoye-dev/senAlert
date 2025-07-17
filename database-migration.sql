-- Migration pour supporter les signalements anonymes
-- À exécuter sur la base de données existante

-- 1. Rendre population_id optionnel dans la table reports
ALTER TABLE reports ALTER COLUMN population_id DROP NOT NULL;

-- 2. Ajouter les champs pour les signalements anonymes
ALTER TABLE reports ADD COLUMN IF NOT EXISTS anonymous_code TEXT UNIQUE;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS anonymous_name TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS anonymous_phone TEXT;

-- 3. Rendre population_id optionnel dans la table notifications
ALTER TABLE notifications ALTER COLUMN population_id DROP NOT NULL;

-- 4. Créer un index sur anonymous_code pour les performances
CREATE INDEX IF NOT EXISTS idx_reports_anonymous_code ON reports(anonymous_code);

-- 5. Créer un index sur population_id pour les performances
CREATE INDEX IF NOT EXISTS idx_reports_population_id ON reports(population_id);

-- 6. Créer un index sur status pour les performances
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Ajout table des catégories pour gestion dynamique
CREATE TABLE IF NOT EXISTS categorie (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT UNIQUE NOT NULL
);

-- Remplir avec les catégories existantes
INSERT INTO categorie (nom) VALUES
  ('voirie'),
  ('eclairage'),
  ('proprete'),
  ('mobilier'),
  ('autre')
ON CONFLICT DO NOTHING;

-- Table de liaison catégorie <-> organisation
CREATE TABLE IF NOT EXISTS categorie_organization (
  categorie_id uuid REFERENCES categorie(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  PRIMARY KEY (categorie_id, organization_id)
);

-- Table unique pour les logs système (actions, sécurité, erreurs, etc.)
CREATE TABLE IF NOT EXISTS system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid, -- admin, superadmin, ou null (pour le système)
  actor_type TEXT, -- 'admin', 'superadmin', 'system'
  level TEXT NOT NULL, -- 'info', 'warning', 'error', 'success'
  category TEXT, -- 'security', 'system', 'reports', 'organizations', etc.
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_system_logs_actor_id ON system_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC); 