import { useState, useEffect, useCallback } from 'react';
import { scheduleApi } from '../api/scheduleApi';
import { locationsApi } from '../api/locationsApi';
import type { ScheduleSlot, ScheduleSlotCreateUpdate } from '../types/schedule';
import type { Location } from '../types/location';

export function useSchedule() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [slotsData, locationsData] = await Promise.all([
        scheduleApi.getAll(),
        locationsApi.getAll(),
      ]);
      setSlots(slotsData);
      setLocations(locationsData);
    } catch (err) {
      setError('Не вдалося завантажити розклад.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createSlot = async (dto: ScheduleSlotCreateUpdate) => {
    const result = await scheduleApi.create(dto);
    await refresh();
    return result;
  };

  const updateSlot = async (id: number, dto: ScheduleSlotCreateUpdate) => {
    const result = await scheduleApi.update(id, dto);
    await refresh();
    return result;
  };

  const deleteSlot = async (id: number) => {
    await scheduleApi.delete(id);
    await refresh();
  };

  return { slots, locations, loading, error, refresh, createSlot, updateSlot, deleteSlot };
}
