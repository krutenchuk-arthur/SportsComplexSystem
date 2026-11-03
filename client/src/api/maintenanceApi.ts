import axiosClient from './axiosClient';
import type { MaintenanceTicket } from '../types/maintenance';
import type { TicketStatus } from '../types/enums';

export const maintenanceApi = {
  getAll: async (status?: TicketStatus): Promise<MaintenanceTicket[]> => {
    const { data } = await axiosClient.get('/maintenance/tickets', {
      params: { status },
    });
    return data;
  },

  getById: async (id: number): Promise<MaintenanceTicket> => {
    const { data } = await axiosClient.get(`/maintenance/tickets/${id}`);
    return data;
  },

  create: async (equipmentId: number, description: string): Promise<MaintenanceTicket> => {
    const { data } = await axiosClient.post('/maintenance/tickets', { equipmentId, description });
    return data;
  },

  updateStatus: async (id: number, status: TicketStatus): Promise<MaintenanceTicket> => {
    const { data } = await axiosClient.patch(`/maintenance/tickets/${id}/status`, { status });
    return data;
  },
};
