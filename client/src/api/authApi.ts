import axiosClient from './axiosClient';
import type { LoginResponse, SystemSettings, User } from '../types/auth';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await axiosClient.get('/auth/me');
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await axiosClient.post('/auth/change-password', { currentPassword, newPassword });
  },
};

export const settingsApi = {
  get: async (): Promise<SystemSettings> => {
    const { data } = await axiosClient.get('/settings');
    return data;
  },

  update: async (dto: SystemSettings): Promise<SystemSettings> => {
    const { data } = await axiosClient.put('/settings', dto);
    return data;
  },
};

/** Завантажує CSV як blob і зберігає під заданою назвою (кирилиця в імені файлу). */
async function downloadCsv(url: string, fileName: string) {
  const { data } = await axiosClient.get(url, { responseType: 'blob' });
  const href = URL.createObjectURL(data as Blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

export const reportsApi = {
  trainersWorkload: () =>
    downloadCsv('/reports/trainers-workload.csv', 'Табель_завантаженості_персоналу.csv'),
  maintenanceLog: () =>
    downloadCsv('/reports/maintenance-log.csv', 'Журнал_ТО_та_зносу_інвентарю.csv'),
};
