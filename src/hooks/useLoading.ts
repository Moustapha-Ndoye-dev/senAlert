import { useState, useCallback } from 'react';

export function useLoading() {
  const [loading, setLoading] = useState(false);

  // Utilitaire pour exécuter une promesse avec gestion auto du loading
  const withLoading = useCallback(async (fn: () => Promise<any>) => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, setLoading, withLoading };
} 