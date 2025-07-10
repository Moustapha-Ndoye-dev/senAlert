# Configuration Supabase Storage pour SenAlert

Ce guide explique comment configurer Supabase Storage pour stocker les photos et fichiers audio des signalements.

## 🚀 Étapes de configuration

### 1. Activer Storage dans Supabase

1. Connectez-vous à votre dashboard Supabase
2. Allez dans **Storage** dans le menu de gauche
3. Cliquez sur **"Enable Storage"** si ce n'est pas déjà fait

### 2. Créer les buckets de stockage

Exécutez le fichier `supabase-storage-setup.sql` dans l'éditeur SQL de Supabase :

```sql
-- Copiez et exécutez le contenu du fichier supabase-storage-setup.sql
```

Ou créez manuellement les buckets :

#### Bucket pour les photos (`report-photos`)
- **Nom** : `report-photos`
- **Public** : ✅ Oui
- **Taille max** : 5MB
- **Types autorisés** : `image/jpeg`, `image/png`, `image/webp`, `image/heic`

#### Bucket pour les fichiers audio (`report-audio`)
- **Nom** : `report-audio`
- **Public** : ✅ Oui
- **Taille max** : 10MB
- **Types autorisés** : `audio/wav`, `audio/mp3`, `audio/m4a`, `audio/ogg`, `audio/webm`

### 3. Configurer les politiques de sécurité

#### Politiques pour les photos
```sql
-- Upload public (pour signalements anonymes)
CREATE POLICY "Photos publiques - upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'report-photos' AND
  auth.role() = 'anon'
);

-- Lecture publique
CREATE POLICY "Photos publiques - lecture" ON storage.objects
FOR SELECT USING (
  bucket_id = 'report-photos'
);

-- Suppression par les admins
CREATE POLICY "Photos - suppression admin" ON storage.objects
FOR DELETE USING (
  bucket_id = 'report-photos' AND
  auth.role() = 'authenticated'
);
```

#### Politiques pour les fichiers audio
```sql
-- Upload public (pour signalements anonymes)
CREATE POLICY "Audio public - upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'report-audio' AND
  auth.role() = 'anon'
);

-- Lecture publique
CREATE POLICY "Audio public - lecture" ON storage.objects
FOR SELECT USING (
  bucket_id = 'report-audio'
);

-- Suppression par les admins
CREATE POLICY "Audio - suppression admin" ON storage.objects
FOR DELETE USING (
  bucket_id = 'report-audio' AND
  auth.role() = 'authenticated'
);
```

### 4. Vérifier la configuration

1. Testez l'upload d'une photo via le formulaire de signalement
2. Vérifiez que les fichiers apparaissent dans le bucket Storage
3. Testez l'affichage des médias dans les pages de consultation

## 📁 Structure des fichiers

Les fichiers sont organisés comme suit :

```
report-photos/
├── {report-id}/
│   ├── photo_1234567890.jpg
│   └── photo_1234567891.png

report-audio/
├── {report-id}/
│   ├── audio_1234567890.wav
│   └── audio_1234567891.mp3
```

## 🔧 Fonctionnalités implémentées

### Upload automatique
- ✅ Photos (JPEG, PNG, WebP, HEIC)
- ✅ Audio (WAV, MP3, M4A, OGG, WebM)
- ✅ Compression automatique des images
- ✅ Validation des types de fichiers

### Affichage
- ✅ Composant MediaViewer moderne
- ✅ Modal pour les photos
- ✅ Lecteur audio intégré
- ✅ Boutons de téléchargement

### Gestion
- ✅ Nettoyage automatique des fichiers orphelins
- ✅ Suppression des fichiers lors de la suppression d'un signalement
- ✅ Statistiques de stockage

## 🛠️ Utilisation dans le code

### Upload de fichiers
```typescript
// Dans ReportPage.tsx
const report = await reportService.createWithFiles(
  reportData,
  selectedImage, // File | undefined
  audioFile     // File | undefined
);
```

### Affichage des médias
```typescript
// Dans n'importe quelle page
import { MediaViewer } from '../components/MediaViewer';

<MediaViewer 
  photoUrl={report.photo_url} 
  audioUrl={report.audio_url}
  className="mt-4"
/>
```

## 🔒 Sécurité

- **Upload anonyme** : Permis pour les signalements anonymes
- **Lecture publique** : Les médias sont accessibles à tous
- **Suppression sécurisée** : Seuls les admins peuvent supprimer
- **Validation** : Types de fichiers et tailles limités
- **Nettoyage** : Suppression automatique des fichiers orphelins

## 📊 Monitoring

### Statistiques de stockage
```sql
-- Obtenir les statistiques
SELECT * FROM get_storage_stats();
```

### Nettoyage manuel
```sql
-- Nettoyer les fichiers orphelins
SELECT cleanup_orphaned_files();
```

## 🚨 Dépannage

### Erreur d'upload
- Vérifiez que les buckets existent
- Vérifiez les politiques de sécurité
- Vérifiez la taille et le type de fichier

### Erreur d'affichage
- Vérifiez que l'URL est correcte
- Vérifiez les politiques de lecture
- Vérifiez que le fichier existe dans le bucket

### Performance
- Les images sont automatiquement optimisées
- Utilisez des formats modernes (WebP pour les images)
- Limitez la taille des fichiers audio

## 📈 Optimisations futures

- [ ] Compression automatique des images
- [ ] Conversion automatique en WebP
- [ ] CDN pour les fichiers statiques
- [ ] Cache intelligent des médias
- [ ] Upload en arrière-plan
- [ ] Prévisualisation avant upload 