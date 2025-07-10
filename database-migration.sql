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