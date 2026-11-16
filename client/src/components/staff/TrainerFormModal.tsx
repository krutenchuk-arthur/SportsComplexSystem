import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import type { Trainer, TrainerCreateUpdate } from '../../types/trainer';
import { SPECIALIZATION_LABELS, type SpecializationType } from '../../types/enums';

interface TrainerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: TrainerCreateUpdate) => Promise<void>;
  trainer?: Trainer | null;
}

const SPECIALIZATIONS = Object.keys(SPECIALIZATION_LABELS) as SpecializationType[];

export default function TrainerFormModal({ isOpen, onClose, onSubmit, trainer }: TrainerFormModalProps) {
  const { settings } = useAuth();
  const [fullName, setFullName] = useState('');
  const [specialization, setSpecialization] = useState<SpecializationType>('StrengthTraining');
  const [maxWeeklyHours, setMaxWeeklyHours] = useState(40);
  const [hourlyRate, setHourlyRate] = useState(450);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (trainer) {
      setFullName(trainer.fullName);
      setSpecialization(trainer.specialization);
      setMaxWeeklyHours(trainer.maxWeeklyHours);
      setHourlyRate(trainer.hourlyRate);
      setPhoneNumber(trainer.phoneNumber || '');
    } else {
      setFullName('');
      setSpecialization('StrengthTraining');
      setMaxWeeklyHours(settings?.defaultMaxWeeklyHours ?? 40);
      setHourlyRate(450);
      setPhoneNumber('');
    }
  }, [trainer, isOpen, settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ fullName, specialization, maxWeeklyHours, hourlyRate, phoneNumber: phoneNumber || null });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={trainer ? 'Редагувати тренера' : 'Новий тренер'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">ПІБ</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-600"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Спеціалізація</label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value as SpecializationType)}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-600"
          >
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>{SPECIALIZATION_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Ліміт годин на тиждень</label>
          <input
            type="number"
            required
            min={1}
            max={168}
            value={maxWeeklyHours}
            onChange={(e) => setMaxWeeklyHours(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-rose-600"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Ставка, грн/год</label>
          <input
            type="number"
            required
            min={0}
            step={50}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-rose-600"
          />
          <p className="mt-1 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            Фонд оплати = години × ставка
          </p>
        </div>

        <div>
          <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Телефон</label>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+380..."
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-rose-600"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-rose-600 dark:bg-rose-500 hover:bg-rose-700 text-white font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
