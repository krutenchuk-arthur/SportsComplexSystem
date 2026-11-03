import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import type { DashboardKpi, Alert } from '../types/dashboard';

export function useDashboard() {
  const [kpi, setKpi] = useState<DashboardKpi | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiData, alertsData] = await Promise.all([
        dashboardApi.getKpi(),
        dashboardApi.getAlerts(10),
      ]);
      setKpi(kpiData);
      setAlerts(alertsData);
    } catch (err) {
      setError('Не вдалося завантажити дані дашборду.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { kpi, alerts, loading, error, refresh };
}
