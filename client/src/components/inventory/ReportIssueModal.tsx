import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, AlertOctagon } from 'lucide-react';
import Modal from '../common/Modal';
import { getApiErrorMessage } from '../../api/axiosClient';
import type { Equipment } from '../../types/equipment';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment[];
  onSubmit: (equipmentId: number, description: string) => Promise<void>;
}

const inputClass =
  'w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-600';

/**
 * Швидке створення заявки на ТО ("Повідомити про поломку") для тренера.
 */
export default function ReportIssueModal({ isOpen, onClose, equipment, onSubmit }: ReportIssueModalProps) {
  const [equipmentId, setEquipmentId] = useState(0);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setEquipmentId(equipment[0]?.id ?? 0);
    setDescription('');
    setError(null);
  }, [isOpen, equipment]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!equipmentId) return setError('Оберіть обладнання.');
    if (description.trim().length < 5) return setError('Опишіть несправність (від 5 символів).');
    setSaving(true);
    setError(null);
    try {
      await onSubmit(equipmentId, description.trim());
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося створити заявку.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Повідомити про поломку">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="ri-eq" className="block text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Обладнання</label>
          <select id="ri-eq" value={equipmentId} onChange={(e) => setEquipmentId(Number(e.target.value))} className={inputClass}>
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.inventoryNumber} · {eq.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ri-desc" className="block text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Опис несправності</label>
          <textarea id="ri-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Що сталося, коли помітили…" className={inputClass} />
        </div>
        {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            Скасувати
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-md bg-rose-600 dark:bg-rose-500 hover:bg-rose-700 text-white text-sm font-medium disabled:opacity-60">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <AlertOctagon size={14} />}
            Створити заявку
          </button>
        </div>
      </form>
    </Modal>
  );
}
