import axiosClient from './axiosClient';
import type { Equipment, EquipmentCreateUpdate } from '../types/equipment';
import type { EquipmentStatus } from '../types/enums';

export const equipmentApi = {
  getAll: async (locationId?: number, status?: EquipmentStatus): Promise<Equipment[]> => {
    const { data } = await axiosClient.get('/equipment', {
      params: { locationId, status },
    });
    return data;
  },

  getById: async (id: number): Promise<Equipment> => {
    const { data } = await axiosClient.get(`/equipment/${id}`);
    return data;
  },

  create: async (dto: EquipmentCreateUpdate): Promise<Equipment> => {
    const { data } = await axiosClient.post('/equipment', dto);
    return data;
  },

  update: async (id: number, dto: EquipmentCreateUpdate): Promise<Equipment> => {
    const { data } = await axiosClient.put(`/equipment/${id}`, dto);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/equipment/${id}`);
  },

  addUsageHours: async (id: number, hours: number): Promise<Equipment> => {
    const { data } = await axiosClient.post(`/equipment/${id}/usage`, { hours });
    return data;
  },
};
