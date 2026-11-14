import { useState, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import Modal from '../common/Modal';
import AlertBanner from '../common/AlertBanner';
import { scheduleApi } from '../../api/scheduleApi';
import type { ScheduleSlot, ScheduleSlotCreateUpdate, Conflict } from '../../types/schedule';
import type { Trainer } from '../../types/trainer';
import type { Location } from '../../types/location';
import type { Equipment } from '../../types/equipment';

interface SlotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: ScheduleSlotCreateUpdate) => Promise<void>;
  trainers: Trainer[];
  locations: Location[];
  equipment: Equipment[];
  slot?: ScheduleSlot | null;
  defaultDate?: Date;
  /** Година початку за замовчуванням (клік по вільному вікну в сітці) */
  defaultStartHour?: number;
  /** Якщо задано, тренер зафіксований (роль Trainer створює лише власні слоти) */
  lockedTrainerId?: number | null;
  /** Робочі години комплексу з SystemSettings — межі для вибору часу */
  workDayStartHour?: number;
  workDayEndHour?: number;
}

export default function SlotFormModal({
  isOpen,
  onClose,
  onSubmit,
  trainers,
  locations,
  equipment,
  slot,
  defaultDate,
  defaultStartHour,
  lockedTrainerId,
  workDayStartHour = 0,
  workDayEndHour = 24,
}: SlotFormModalProps) {
  const [title, setTitle] = useState('');
  const [trainerId, setTrainerId] = useState<number>(0);
  const [locationId, setLocationId] = useState<number>(0);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [equipmentIds, setEquipmentIds] = useState<number[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [suggestedTrainer, setSuggestedTrainer] = useState<Trainer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) return;
    if (slot) {
      setTitle(slot.title);
      setTrainerId(slot.trainerId);
      setLocationId(slot.locationId);
      setDate(format(new Date(slot.startTime), 'yyyy-MM-dd'));
      setStartTime(format(new Date(slot.startTime), 'HH:mm'));
      setEndTime(format(new Date(slot.endTime), 'HH:mm'));
      setEquipmentIds(slot.equipmentIds);
    } else {
      setTitle('');
      setTrainerId(lockedTrainerId ?? trainers[0]?.id ?? 0);
      setLocationId(locations[0]?.id ?? 0);
      setDate(format(defaultDate ?? new Date(), 'yyyy-MM-dd'));
      const preferredHour = defaultStartHour ?? 9;
      const firstHour = Math.min(Math.max(preferredHour, workDayStartHour), Math.max(workDayStartHour, workDayEndHour - 1));
      setStartTime(`${String(firstHour).padStart(2, '0')}:00`);
      setEndTime(`${String(Math.min(firstHour + 1, workDayEndHour)).padStart(2, '0')}:00`);
      setEquipmentIds([]);
    }
    setConflicts([]);
    setSuggestedTrainer(null);
    setSubmitError(null);
  }, [isOpen, slot, trainers, locations, defaultDate, defaultStartHour, lockedTrainerId, workDayStartHour, workDayEndHour]);

  const dto = useMemo<ScheduleSlotCreateUpdate>(
    () => ({
      title,
      trainerId,
      locationId,
      startTime: `${date}T${startTime}:00`,
      endTime: `${date}T${endTime}:00`,
      equipmentIds,
    }),
    [title, trainerId, locationId, date, startTime, endTime, equipmentIds]
  );

  // Жива валідація конфліктів (debounce) — instant visual validation
  useEffect(() => {
    if (!isOpen || !trainerId || !locationId || !title) return;
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const result = await scheduleApi.validate(dto);
        setConflicts(result.conflicts);
        setSuggestedTrainer(result.suggestedTrainer);
      } catch {
        // валідація не критична для UX
      }
    }, 450);
    return () => window.clearTimeout(debounceRef.current);
  }, [dto, isOpen, trainerId, locationId, title]);

  const toggleEquipment = (id: number) => {
    setEquipmentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim()) return setSubmitError('Вкажіть назву заняття.');
    if (!trainerId || !locationId) return setSubmitError('Оберіть тренера та локацію.');
    if (endTime <= startTime) return setSubmitError('Час завершення має бути пізніше за час початку.');
    if (outsideWorkingHours)
      return setSubmitError(`Заняття поза робочими годинами комплексу (${minTime}–${maxTime}).`);

    setSubmitting(true);
    try {
      await onSubmit(dto);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { conflicts?: Conflict[] } } };
      if (axiosErr.response?.status === 409 && axiosErr.response.data?.conflicts) {
        setConflicts(axiosErr.response.data.conflicts);
      } else {
        setSubmitError('Не вдалося зберегти заняття. Перевірте введені дані.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600';

  const padHour = (h: number) => `${String(h).padStart(2, '0')}:00`;
  const minTime = padHour(workDayStartHour);
  const maxTime = padHour(workDayEndHour);
  const outsideWorkingHours = startTime < minTime || endTime > maxTime || endTime <= startTime;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={slot ? 'Редагувати заняття' : 'Нове заняття'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Назва заняття</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Тренер</label>
            <select value={trainerId} disabled={!!lockedTrainerId} onChange={(e) => setTrainerId(Number(e.target.value))} className={`${inputClass} disabled:opacity-60`}>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Локація</label>
            <select
              value={locationId}
              onChange={(e) => {
                const nextLocationId = Number(e.target.value);
                setLocationId(nextLocationId);
                setEquipmentIds((prev) =>
                  prev.filter((id) => equipment.find((item) => item.id === id)?.locationId === nextLocationId)
                );
              }}
              className={inputClass}
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Дата</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Початок</label>
            <input type="time" min={minTime} max={maxTime} value={startTime} onChange={(e) => setStartTime(e.target.value)} className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Кінець</label>
            <input type="time" min={minTime} max={maxTime} value={endTime} onChange={(e) => setEndTime(e.target.value)} className={`${inputClass} font-mono`} />
          </div>
        </div>

        <p className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
          <span>РОБОЧІ ГОДИНИ: {minTime}–{maxTime}</span>
          {outsideWorkingHours && <span className="text-rose-600 dark:text-rose-500">ПОЗА ГРАФІКОМ</span>}
        </p>

        <div>
          <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1.5">Обладнання</label>
          <div className="max-h-32 overflow-y-auto rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 p-2 grid grid-cols-2 gap-1">
            {equipment.filter((e) => e.locationId === locationId).length === 0 && (
              <p className="text-xs text-zinc-500 p-2 col-span-2">Немає обладнання для цієї локації</p>
            )}
            {equipment
              .filter((e) => e.locationId === locationId)
              .map((e) => (
                <label
                  key={e.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300"
                >
                  <input
                    type="checkbox"
                    checked={equipmentIds.includes(e.id)}
                    onChange={() => toggleEquipment(e.id)}
                    className="accent-rose-600"
                  />
                  <span className="font-mono text-zinc-500">{e.inventoryNumber}</span>
                  <span className="truncate">{e.name}</span>
                </label>
              ))}
          </div>
        </div>

        <AlertBanner
          conflicts={conflicts}
          suggestedTrainer={suggestedTrainer}
          onUseSuggested={(id) => setTrainerId(id)}
        />

        {submitError && (
          <p className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3">
            {submitError}
          </p>
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
