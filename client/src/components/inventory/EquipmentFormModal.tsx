import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import type { Equipment, EquipmentCreateUpdate } from '../../types/equipment';
import type { Location } from '../../types/location';

interface EquipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: EquipmentCreateUpdate) => Promise<void>;
  locations: Location[];
  equipment?: Equipment | null;
}

export default function EquipmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  locations,
  equipment,
}: EquipmentFormModalProps) {
  const [inventoryNumber, setInventoryNumber] = useState('');
  const [name, setName] = useState('');
  const [locationId, setLocationId] = useState(0);
  const [currentUsageHours, setCurrentUsageHours] = useState(0);
  const [maintenanceThresholdHours, setMaintenanceThresholdHours] = useState(200);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { settings } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    if (equipment) {
      setInventoryNumber(equipment.inventoryNumber);
      setName(equipment.name);
      setLocationId(equipment.locationId);
      setCurrentUsageHours(equipment.currentUsageHours);
      setMaintenanceThresholdHours(equipment.maintenanceThresholdHours);
    } else {
      setInventoryNumber('');
      setName('');
      setLocationId(locations[0]?.id ?? 0);
      setCurrentUsageHours(0);
      setMaintenanceThresholdHours(settings?.defaultMaintenanceThreshold ?? 200);
    }
    setError(null);
  }, [isOpen, equipment, locations, settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        inventoryNumber,
        name,
        locationId,
        currentUsageHours,
        maintenanceThresholdHours,
      });
      onClose();
    } catch {
      setError('Не вдалося зберегти обладнання. Інвентарний номер має бути унікальним.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={equipment ? 'Редагувати обладнання' : 'Нове обладнання'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Інвентарний номер</label>
          <input
            required
            value={inventoryNumber}
            onChange={(e) => setInventoryNumber(e.target.value)}
            placeholder="INV-001"
            className={`${inputClass} font-mono`}
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Назва</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Локація</label>
          <select value={locationId} onChange={(e) => setLocationId(Number(e.target.value))} className={inputClass}>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Напрацювання, год</label>
            <input
              type="number"
              step="0.5"
              min={0}
              required
              value={currentUsageHours}
              onChange={(e) => setCurrentUsageHours(Number(e.target.value))}
              className={`${inputClass} font-mono`}
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Поріг ТО, год</label>
            <input
              type="number"
              step="0.5"
              min={1}
              required
              value={maintenanceThresholdHours}
              onChange={(e) => setMaintenanceThresholdHours(Number(e.target.value))}
              className={`${inputClass} font-mono`}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3">{error}</p>
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
            {submitting ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
