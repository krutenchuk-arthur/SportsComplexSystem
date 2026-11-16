import { useState, useEffect, useCallback } from 'react';
import { auditApi } from '../api/auditApi';
import type { AuditLogEntry } from '../types/audit';

/** Завантажує останні події журналу аудиту (Admin-only ендпоінт). */
export function useAuditLog(limit = 40) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const data = await auditApi.getRecent(limit);
      setEntries(data);
    } catch (err) {
      setError('Не вдалося завантажити журнал аудиту.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, error, refresh };
}
