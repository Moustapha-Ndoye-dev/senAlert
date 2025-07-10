# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8a6c3912-522d-4591-8077-02e28997d49c

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
```

### Comptes de test créés

#### 👑 Super Administrateurs
- `superadmin_test` / `superadmin123`
- `admin_system_test` / `superadmin123`
- `directeur_test` / `superadmin123`

#### 👨‍💼 Administrateurs
- `admin_dakar_test` / `admin123`
- `admin_ong_test` / `admin123`
- `admin_eps_test` / `admin123`

#### 👥 Utilisateurs Population
- `+221701234567` / `TEST1234`
- `+221702345678` / `TEST5678`
- `+221703456789` / `TEST9012`

### Comptes existants corrigés
- `superadmin` / `superpass123`
- `admin_dakar` / `password123`
- `admin_ong` / `password456`
- `admin_eps` / `password789`

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8a6c3912-522d-4591-8077-02e28997d49c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8a6c3912-522d-4591-8077-02e28997d49c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide) 