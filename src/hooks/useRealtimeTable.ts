import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook pour écouter les changements en temps réel sur une table Supabase.
 * @param table Nom de la table (string)
 * @param onChange Fonction à appeler lors d'un changement (insert, update, delete)
 */
export function useRealtimeTable(table: string, onChange: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => { onChange(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onChange]);
} 