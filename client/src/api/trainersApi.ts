import axiosClient from './axiosClient';
import type { Trainer, TrainerCreateUpdate, AutoAssignResult } from '../types/trainer';
import type { SpecializationType } from '../types/enums';

export const trainersApi = {
  getAll: async (): Promise<Trainer[]> => {
    const { data } = await axiosClient.get('/trainers');
    return data;
  },

  getById: async (id: number): Promise<Trainer> => {
    const { data } = await axiosClient.get(`/trainers/${id}`);
    return data;
  },

  create: async (dto: TrainerCreateUpdate): Promise<Trainer> => {
    const { data } = await axiosClient.post('/trainers', dto);
    return data;
  },

  update: async (id: number, dto: TrainerCreateUpdate): Promise<Trainer> => {
    const { data} = await axiosClient.put(`/trainers/${id}`, dto);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/trainers/${id}`);
  },

  autoAssign: async (
    specialization: SpecializationType,
    startTime: string,
    endTime: string
  ): Promise<AutoAssignResult> => {
    const { data } = await axiosClient.get('/trainers/auto-assign', {
      params: { specialization, startTime, endTime },
    });
    return data;
  },
};
