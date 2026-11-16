import { useState, useEffect, useCallback } from 'react';
import { maintenanceApi } from '../api/maintenanceApi';
import type { MaintenanceTicket } from '../types/maintenance';
import type { TicketStatus } from '../types/enums';

export function useMaintenance() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceApi.getAll();
      setTickets(data);
    } catch (err) {
      setError('Не вдалося завантажити заявки на ТО.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateStatus = async (id: number, status: TicketStatus, repairCost?: number | null) => {
    await maintenanceApi.updateStatus(id, status, repairCost);
    await refresh();
  };

  return { tickets, loading, error, refresh, updateStatus };
}
