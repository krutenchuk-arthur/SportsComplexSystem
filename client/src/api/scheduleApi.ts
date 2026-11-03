import axiosClient from './axiosClient';
import type {
  ScheduleSlot,
  ScheduleSlotCreateUpdate,
  ScheduleValidationResult,
} from '../types/schedule';

export const scheduleApi = {
  getAll: async (
    from?: string,
    to?: string,
    locationId?: number,
    trainerId?: number
  ): Promise<ScheduleSlot[]> => {
    const { data } = await axiosClient.get('/schedule', {
      params: { from, to, locationId, trainerId },
    });
    return data;
  },

  getById: async (id: number): Promise<ScheduleSlot> => {
    const { data } = await axiosClient.get(`/schedule/${id}`);
    return data;
  },

  validate: async (dto: ScheduleSlotCreateUpdate): Promise<ScheduleValidationResult> => {
    const { data } = await axiosClient.post('/schedule/validate', dto);
    return data;
  },

  create: async (dto: ScheduleSlotCreateUpdate): Promise<ScheduleSlot> => {
    const { data } = await axiosClient.post('/schedule', dto);
    return data;
  },

  update: async (id: number, dto: ScheduleSlotCreateUpdate): Promise<ScheduleSlot> => {
    const { data } = await axiosClient.put(`/schedule/${id}`, dto);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/schedule/${id}`);
  },
};
