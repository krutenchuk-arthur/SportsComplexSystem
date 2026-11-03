import axiosClient from './axiosClient';
import type { DashboardKpi, Alert } from '../types/dashboard';

export const dashboardApi = {
  getKpi: async (): Promise<DashboardKpi> => {
    const { data } = await axiosClient.get('/dashboard/kpi');
    return data;
  },

  getAlerts: async (limit = 10): Promise<Alert[]> => {
    const { data } = await axiosClient.get('/dashboard/alerts', { params: { limit } });
    return data;
  },
};
