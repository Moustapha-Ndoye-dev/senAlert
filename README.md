# senAlert

Projet de gestion d'alertes sanitaires au Sénégal.

## 🔧 Correction de l'Authentification

### Problème
Les mots de passe sont stockés en clair dans la base de données, mais le code utilise bcrypt pour les vérifier.

### Solution
Exécutez ce script SQL dans votre base de données Supabase :

```sql
-- Activer pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Corriger les mots de passe existants
UPDATE superadmin 
SET password_hash = crypt(password_hash, gen_salt('bf')) 
WHERE password_hash NOT LIKE '$2b$%';

UPDATE admin 
SET password_hash = crypt(password_hash, gen_salt('bf')) 
WHERE password_hash NOT LIKE '$2b$%';

-- Créer des comptes de test
INSERT INTO organizations (name, type, email, phone, address, city, status, created_at, approved_at) VALUES
('Mairie de Dakar - Test', 'mairie', 'test@mairiedakar.sn', '+221338123456', 'Place de l''Indépendance, Dakar', 'Dakar', 'approved', NOW(), NOW()),
('ONG Environnement Plus - Test', 'ong', 'test@environnementplus.sn', '+221338654321', 'Route de Ouakam, Dakar', 'Dakar', 'approved', NOW(), NOW()),
('Entreprise Propre Sénégal - Test', 'prive', 'test@eps.sn', '+221338789012', 'Zone Industrielle, Thiès', 'Thiès', 'approved', NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO superadmin (username, password_hash, email, name, permissions, status, created_at, last_login) VALUES
('superadmin_test', crypt('superadmin123', gen_salt('bf')), 'superadmin.test@senalert.sn', 'Amadou Cissé - Test', ARRAY['manage_all', 'manage_admins', 'view_all_statistics'], 'active', NOW(), NOW()),
('admin_system_test', crypt('superadmin123', gen_salt('bf')), 'system.test@senalert.sn', 'Fatou Ndiaye - Test', ARRAY['manage_all', 'system_config'], 'active', NOW(), NOW()),
('directeur_test', crypt('superadmin123', gen_salt('bf')), 'directeur.test@senalert.sn', 'Moussa Diallo - Test', ARRAY['manage_all', 'view_all_statistics'], 'active', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

INSERT INTO admin (username, password_hash, email, name, organization_id, permissions, status, created_at, last_login) VALUES
('admin_dakar_test', crypt('admin123', gen_salt('bf')), 'admin.test@mairiedakar.sn', 'Moussa Ndiaye - Test', (SELECT id FROM organizations WHERE name = 'Mairie de Dakar - Test'), ARRAY['manage_reports', 'view_statistics'], 'active', NOW(), NOW()),
('admin_ong_test', crypt('admin123', gen_salt('bf')), 'admin.test@environnementplus.sn', 'Mariama Sow - Test', (SELECT id FROM organizations WHERE name = 'ONG Environnement Plus - Test'), ARRAY['manage_reports'], 'active', NOW(), NOW()),
('admin_eps_test', crypt('admin123', gen_salt('bf')), 'admin.test@eps.sn', 'Ibrahima Fall - Test', (SELECT id FROM organizations WHERE name = 'Entreprise Propre Sénégal - Test'), ARRAY['manage_reports', 'view_statistics'], 'active', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

INSERT INTO population (phone, auth_code, name, status, created_at, last_activity) VALUES
('+221701234567', 'TEST1234', 'Mamadou Diallo - Test', 'active', NOW(), NOW()),
('+221702345678', 'TEST5678', 'Fatou Sall - Test', 'active', NOW(), NOW()),
('+221703456789', 'TEST9012', 'Ousmane Ba - Test', 'active', NOW(), NOW())
ON CONFLICT (phone) DO NOTHING;
