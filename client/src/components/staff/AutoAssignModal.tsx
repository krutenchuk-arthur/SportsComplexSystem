import { useState } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import Modal from '../common/Modal';
import { trainersApi } from '../../api/trainersApi';
import type { AutoAssignResult } from '../../types/trainer';
import { SPECIALIZATION_LABELS, type SpecializationType } from '../../types/enums';

interface AutoAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPECIALIZATIONS = Object.keys(SPECIALIZATION_LABELS) as SpecializationType[];

/**
 * Модуль "Автопідбір вільного тренера": повертає найбільш розвантаженого
 * тренера потрібної спеціалізації без колізій у розкладі.
 */
export default function AutoAssignModal({ isOpen, onClose }: AutoAssignModalProps) {
  const [specialization, setSpecialization] = useState<SpecializationType>('StrengthTraining');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [result, setResult] = useState<AutoAssignResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setResult(null);
    try {
      const startIso = `${date}T${startTime}:00`;
      const endIso = `${date}T${endTime}:00`;
      const data = await trainersApi.autoAssign(specialization, startIso, endIso);
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Автопідбір вільного тренера">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Спеціалізація</label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value as SpecializationType)}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-600"
          >
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>{SPECIALIZATION_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Дата</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Початок</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Кінець</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors disabled:opacity-50"
        >
          <Search size={16} />
          {loading ? 'Пошук...' : 'Знайти вільного тренера'}
        </button>

        {result && (
          <div
            className={`rounded-lg p-4 flex items-start gap-3 ${
              result.found ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30'
            }`}
          >
            {result.found ? (
              <UserCheck size={20} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <UserX size={20} className="text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              {result.found && result.trainer ? (
                <>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{result.trainer.fullName}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Поточна завантаженість: {result.trainer.assignedHours.toFixed(1)} / {result.trainer.maxWeeklyHours} год
                  </p>
                </>
              ) : (
                <p className="text-sm text-red-700 dark:text-red-400">{result.message}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
