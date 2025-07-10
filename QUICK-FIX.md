# 🚨 ERREUR : Configuration Supabase manquante

## ❌ Problème actuel
```
POST https://your-project.supabase.co/rest/v1/reports?select=* net::ERR_NAME_NOT_RESOLVED
```

## ✅ Solution rapide

### Option 1 : Script automatique (recommandé)
```bash
npm run setup-env
```
Suivez les instructions à l'écran.

### Option 2 : Configuration manuelle

1. **Créez le fichier `.env.local`** à la racine du projet :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

2. **Obtenez vos clés Supabase** :
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet
   - Settings > API
   - Copiez "Project URL" et "anon public"

3. **Redémarrez le serveur** :
```bash
npm run dev
```

## 🔍 Vérification

Ouvrez la console du navigateur (F12) et vérifiez :
- ✅ Supabase URL: `https://votre-projet.supabase.co`
- ✅ Supabase Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 📚 Plus d'informations

- Voir `ENV-SETUP.md` pour le guide complet
- Voir `SETUP-STORAGE.md` pour configurer le stockage des fichiers 