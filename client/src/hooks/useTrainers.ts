import { useState, useEffect, useCallback } from 'react';
import { trainersApi } from '../api/trainersApi';
import type { Trainer, TrainerCreateUpdate } from '../types/trainer';

export function useTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trainersApi.getAll();
      setTrainers(data);
    } catch (err) {
      setError('Не вдалося завантажити список тренерів.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTrainer = async (dto: TrainerCreateUpdate) => {
    await trainersApi.create(dto);
    await refresh();
  };

  const updateTrainer = async (id: number, dto: TrainerCreateUpdate) => {
    await trainersApi.update(id, dto);
    await refresh();
  };

  const deleteTrainer = async (id: number) => {
    await trainersApi.delete(id);
    await refresh();
  };

  return { trainers, loading, error, refresh, createTrainer, updateTrainer, deleteTrainer };
}
