import { useState, useEffect, useCallback } from 'react';
import { locationsApi } from '../api/locationsApi';
import type { Location } from '../types/location';

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await locationsApi.getAll();
      setLocations(data);
    } catch (err) {
      setError('Не вдалося завантажити перелік локацій.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { locations, loading, error, refresh };
}
