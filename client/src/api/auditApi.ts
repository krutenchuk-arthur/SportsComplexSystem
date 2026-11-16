import axiosClient from './axiosClient';
import type { AuditLogEntry } from '../types/audit';

export const auditApi = {
  /** Останні події журналу аудиту (Admin-only на бекенді). */
  getRecent: async (limit = 25): Promise<AuditLogEntry[]> => {
    const { data } = await axiosClient.get('/audit', { params: { limit } });
    return data;
  },
};
