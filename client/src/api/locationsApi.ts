import axiosClient from './axiosClient';
import type { Location } from '../types/location';

export const locationsApi = {
  getAll: async (): Promise<Location[]> => {
    const { data } = await axiosClient.get('/locations');
    return data;
  },

  getById: async (id: number): Promise<Location> => {
    const { data } = await axiosClient.get(`/locations/${id}`);
    return data;
  },
};
