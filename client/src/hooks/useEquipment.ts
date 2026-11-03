import { useState, useEffect, useCallback } from 'react';
import { equipmentApi } from '../api/equipmentApi';
import type { Equipment, EquipmentCreateUpdate } from '../types/equipment';

export function useEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await equipmentApi.getAll();
      setEquipment(data);
    } catch (err) {
      setError('Не вдалося завантажити реєстр обладнання.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createEquipment = async (dto: EquipmentCreateUpdate) => {
    await equipmentApi.create(dto);
    await refresh();
  };

  const updateEquipment = async (id: number, dto: EquipmentCreateUpdate) => {
    await equipmentApi.update(id, dto);
    await refresh();
  };

  const deleteEquipment = async (id: number) => {
    await equipmentApi.delete(id);
    await refresh();
  };

  const addUsageHours = async (id: number, hours: number) => {
    await equipmentApi.addUsageHours(id, hours);
    await refresh();
  };

  return { equipment, loading, error, refresh, createEquipment, updateEquipment, deleteEquipment, addUsageHours };
}
