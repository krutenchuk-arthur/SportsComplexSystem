import { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import Modal from '../common/Modal';
import ProgressBar from '../common/ProgressBar';
import type { Equipment } from '../../types/equipment';

interface AddUsageHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, hours: number) => Promise<void>;
  equipment: Equipment | null;
}

/**
 * Нарахування годин напрацювання. Якщо після нарахування перевищено поріг ТО —
 * бекенд автоматично створює заявку на обслуговування та переводить обладнання
 * у статус «Потребує ТО» (п.3 вимог).
 */
export default function AddUsageHoursModal({ isOpen, onClose, onSubmit, equipment }: AddUsageHoursModalProps) {
  const [hours, setHours] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setHours(1);
  }, [isOpen]);

  if (!equipment) return null;

  const projected = equipment.currentUsageHours + hours;
  const willTriggerMaintenance = projected >= equipment.maintenanceThresholdHours;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(equipment.id, hours);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Нарахування годин використання">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
          <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">{equipment.name}</p>
          <p className="text-xs font-mono text-rose-600 dark:text-rose-500 mt-0.5">{equipment.inventoryNumber}</p>
          <div className="mt-3">
            <ProgressBar
              value={equipment.currentUsageHours}
              max={equipment.maintenanceThresholdHours}
              showText
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Додати годин</label>
          <input
            type="number"
            step="0.5"
            min={0.5}
            required
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
          />
        </div>

        {willTriggerMaintenance && (
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-3">
            <Wrench size={16} className="text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Після нарахування ({projected.toFixed(1)} год) буде перевищено поріг ТО{' '}
              {equipment.maintenanceThresholdHours} год — автоматично створиться заявка на обслуговування.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Скасувати
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-rose-600 dark:bg-rose-500 hover:bg-rose-700 text-white font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? 'Збереження...' : 'Нарахувати'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
