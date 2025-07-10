-- Configuration Supabase Storage pour SenAlert
-- Buckets pour stocker les photos et audio des signalements

-- 1. Créer le bucket pour les photos des signalements
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-photos',
  'report-photos',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- 2. Créer le bucket pour les fichiers audio des signalements
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-audio',
  'report-audio',
  true,
  10485760, -- 10MB max
  ARRAY['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg', 'audio/webm']
);

-- 3. Politiques de sécurité pour le bucket des photos
-- Permettre l'upload de photos pour tous les utilisateurs (signalements anonymes)
CREATE POLICY "Photos publiques - upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'report-photos' AND
  auth.role() = 'anon'
);

-- Permettre la lecture des photos pour tous
CREATE POLICY "Photos publiques - lecture" ON storage.objects
FOR SELECT USING (
  bucket_id = 'report-photos'
);

-- Permettre la suppression des photos par les admins
CREATE POLICY "Photos - suppression admin" ON storage.objects
FOR DELETE USING (
  bucket_id = 'report-photos' AND
  auth.role() = 'authenticated'
);

-- 4. Politiques de sécurité pour le bucket des fichiers audio
-- Permettre l'upload d'audio pour tous les utilisateurs (signalements anonymes)
CREATE POLICY "Audio public - upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'report-audio' AND
  auth.role() = 'anon'
);

-- Permettre la lecture des fichiers audio pour tous
CREATE POLICY "Audio public - lecture" ON storage.objects
FOR SELECT USING (
  bucket_id = 'report-audio'
);

-- Permettre la suppression des fichiers audio par les admins
CREATE POLICY "Audio - suppression admin" ON storage.objects
FOR DELETE USING (
  bucket_id = 'report-audio' AND
  auth.role() = 'authenticated'
);

-- 5. Fonction pour nettoyer automatiquement les fichiers orphelins
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS void AS $$
BEGIN
  -- Supprimer les photos orphelines (plus de 30 jours sans signalement associé)
  DELETE FROM storage.objects 
  WHERE bucket_id = 'report-photos' 
    AND created_at < NOW() - INTERVAL '30 days'
    AND name NOT IN (
      SELECT photo_url FROM reports 
      WHERE photo_url IS NOT NULL 
        AND created_at > NOW() - INTERVAL '30 days'
    );
    
  -- Supprimer les fichiers audio orphelins (plus de 30 jours sans signalement associé)
  DELETE FROM storage.objects 
  WHERE bucket_id = 'report-audio' 
    AND created_at < NOW() - INTERVAL '30 days'
    AND name NOT IN (
      SELECT audio_url FROM reports 
      WHERE audio_url IS NOT NULL 
        AND created_at > NOW() - INTERVAL '30 days'
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Déclencheur pour nettoyer les fichiers quand un signalement est supprimé
CREATE OR REPLACE FUNCTION cleanup_report_files()
RETURNS TRIGGER AS $$
BEGIN
  -- Supprimer la photo si elle existe
  IF OLD.photo_url IS NOT NULL THEN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'report-photos' 
      AND name = OLD.photo_url;
  END IF;
  
  -- Supprimer l'audio s'il existe
  IF OLD.audio_url IS NOT NULL THEN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'report-audio' 
      AND name = OLD.audio_url;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Créer le déclencheur
CREATE TRIGGER cleanup_files_on_report_delete
  BEFORE DELETE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_report_files();

-- 7. Fonction pour obtenir les statistiques de stockage
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE (
  bucket_name TEXT,
  file_count BIGINT,
  total_size BIGINT,
  avg_file_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.name as bucket_name,
    COUNT(o.id) as file_count,
    COALESCE(SUM(o.metadata->>'size')::BIGINT, 0) as total_size,
    COALESCE(AVG(o.metadata->>'size')::BIGINT, 0) as avg_file_size
  FROM storage.buckets b
  LEFT JOIN storage.objects o ON b.id = o.bucket_id
  WHERE b.name IN ('report-photos', 'report-audio')
  GROUP BY b.id, b.name;
END;
$$ LANGUAGE plpgsql; 