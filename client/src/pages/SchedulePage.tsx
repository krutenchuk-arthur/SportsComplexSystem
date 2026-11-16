import { useState } from 'react';
import { addDays, addWeeks, format, startOfWeek } from 'date-fns';
import { uk } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import ScheduleGrid from '../components/schedule/ScheduleGrid';
import SlotFormModal from '../components/schedule/SlotFormModal';
import { useSchedule } from '../hooks/useSchedule';
import { useTrainers } from '../hooks/useTrainers';
import { useEquipment } from '../hooks/useEquipment';
import { scheduleApi } from '../api/scheduleApi';
import { getApiErrorMessage } from '../api/axiosClient';
import { buildScheduleIcs, downloadTextFile } from '../utils/icsExport';
import type {
  ScheduleSlot,
  ScheduleSlotCreateUpdate,
  CloneWeekResult,
} from '../types/schedule';

export default function SchedulePage() {
  const { slots, locations, loading, refresh, createSlot, updateSlot, deleteSlot } = useSchedule();
  const { trainers } = useTrainers();
  const { equipment } = useEquipment();

  const { user, hasRole, settings } = useAuth();
  const workDayStartHour = settings?.workDayStartHour ?? 0;
  const workDayEndHour = settings?.workDayEndHour ?? 24;
  const isTrainer = hasRole('Trainer');
  const readOnly = !hasRole('Admin', 'Trainer');
  const ownTrainerId = isTrainer ? user?.trainerId ?? null : null;
  const [onlyMine, setOnlyMine] = useState(isTrainer);
  const canManage = (slot: ScheduleSlot) => !readOnly && (!isTrainer || slot.trainerId === ownTrainerId);

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [locationFilter, setLocationFilter] = useState<number | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [prefillDate, setPrefillDate] = useState<Date | undefined>(undefined);
  const [prefillStartHour, setPrefillStartHour] = useState<number | undefined>(undefined);
  const [cloning, setCloning] = useState(false);
  const [cloneResult, setCloneResult] = useState<CloneWeekResult | null>(null);
  const [cloneError, setCloneError] = useState<string | null>(null);

  const visibleSlots = slots.filter(
    (s) =>
      (locationFilter === 'all' || s.locationId === locationFilter) &&
      (!onlyMine || ownTrainerId === null || s.trainerId === ownTrainerId)
  );

  const handleAdd = () => {
    setEditingSlot(null);
    setPrefillDate(undefined);
    setPrefillStartHour(undefined);
    setIsFormOpen(true);
  };

  /** Клік по вільному вікну в сітці — форма одразу з потрібною датою та годиною */
  const handleCreateAt = (day: Date, startHour: number) => {
    setEditingSlot(null);
    setPrefillDate(day);
    setPrefillStartHour(startHour);
    setIsFormOpen(true);
  };

  const handleEdit = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setPrefillDate(undefined);
    setPrefillStartHour(undefined);
    setIsFormOpen(true);
  };

  const handleExportIcs = () => {
    if (visibleSlots.length === 0) return;
    const content = buildScheduleIcs(visibleSlots);
    downloadTextFile(`schedule-week-${format(weekStart, 'yyyy-MM-dd')}.ics`, content, 'text/calendar');
  };

  const handleCloneWeek = async () => {
    const nextWeekLabel = format(addWeeks(weekStart, 1), 'dd.MM.yyyy');
    if (!confirm(`Клонувати заняття цього тижня на ${nextWeekLabel}?`)) return;

    setCloning(true);
    setCloneError(null);
    setCloneResult(null);

    try {
      const result = await scheduleApi.cloneWeek(
        format(weekStart, 'yyyy-MM-dd'),
        ownTrainerId ?? undefined
      );
      setCloneResult(result);
      await refresh();
      if (result.copiedCount > 0) setWeekStart(addWeeks(weekStart, 1));
    } catch (err) {
      setCloneError(getApiErrorMessage(err, 'Не вдалося клонувати тиждень.'));
    } finally {
      setCloning(false);
    }
  };

  const handleDelete = async (slot: ScheduleSlot) => {
    if (confirm(`Видалити заняття «${slot.title}»?`)) {
      await deleteSlot(slot.id);
    }
  };

  const handleSubmit = async (dto: ScheduleSlotCreateUpdate) => {
    if (editingSlot) {
      await updateSlot(editingSlot.id, dto);
    } else {
      await createSlot(dto);
    }
    // Переходимо на тиждень створеного/зміненого заняття, щоб воно було видиме у сітці
    const slotWeek = startOfWeek(new Date(dto.startTime), { weekStartsOn: 1 });
    if (slotWeek.getTime() !== weekStart.getTime()) {
      setWeekStart(slotWeek);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <PageHeader
          title="Диспетчер розкладу"
          subtitle="Тижнева сітка занять з автоматичною перевіркою колізій залу, тренера та обладнання"
        />
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {isTrainer && (
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
              <button
                type="button"
                role="switch"
                aria-checked={onlyMine}
                onClick={() => setOnlyMine((v) => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors ${onlyMine ? 'bg-rose-600 dark:bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${onlyMine ? 'translate-x-4' : ''}`} />
              </button>
              Тільки мої заняття
            </label>
          )}
          {readOnly && (
            <span className="flex items-center gap-1.5 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              <Eye size={12} /> Read-only
            </span>
          )}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
          >
            <option value="all">Усі локації</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <button
            onClick={handleExportIcs}
            disabled={visibleSlots.length === 0}
            title="Експортувати видимі заняття тижня у формат .ics"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={15} />
            .ics
          </button>
          {!readOnly && (
            <button
              onClick={handleCloneWeek}
              disabled={cloning || visibleSlots.length === 0}
              title="Створити копії усіх занять тижня на наступний тиждень"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {cloning ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} />}
              Клонувати на наст. тиждень
            </button>
          )}
          {!readOnly && <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 dark:bg-rose-500 hover:bg-rose-700 text-white font-medium text-sm transition-colors"
          >
            <Plus size={16} />
            Нове заняття
          </button>}
        </div>
      </div>

      {cloneResult && (
        <div className="mb-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-500" />
              <div className="text-sm text-zinc-700 dark:text-zinc-300">
                <p>
                  Клонування завершено: перенесено{' '}
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{cloneResult.copiedCount}</span>,
                  пропущено{' '}
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{cloneResult.skippedCount}</span>.
                </p>
                {cloneResult.skippedReasons.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-zinc-500 dark:text-zinc-400 list-disc list-inside">
                    {cloneResult.skippedReasons.map((reason, i) => (
                      <li key={i} className="font-mono">{reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button
              onClick={() => setCloneResult(null)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              title="Закрити"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {cloneError && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 px-4 py-3">
          <div className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{cloneError}</span>
          </div>
          <button
            onClick={() => setCloneError(null)}
            className="p-1 rounded text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            title="Закрити"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3">
        <button
          onClick={() => setWeekStart((d) => addWeeks(d, -1))}
          className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="flex items-center gap-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          <span>
            {format(weekStart, 'dd.MM.yyyy', { locale: uk })} —{' '}
            {format(addDays(weekStart, 6), 'dd.MM.yyyy', { locale: uk })}
            <span className="text-zinc-500 ml-2 text-xs hidden sm:inline">(тиждень)</span>
          </span>
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-500">
            {String(workDayStartHour).padStart(2, '0')}:00–{String(workDayEndHour).padStart(2, '0')}:00
          </span>
        </span>
        <button
          onClick={() => setWeekStart((d) => addWeeks(d, 1))}
          className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {loading ? (
        <div className="w-full overflow-x-auto flex-1 min-h-0 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3 md:min-w-[840px] flex-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 min-h-[200px] animate-pulse">
                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-16 mb-4" />
                <div className="space-y-2">
                  <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                  <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ScheduleGrid
          slots={visibleSlots}
          weekStart={weekStart}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canManage={canManage}
          workDayStartHour={workDayStartHour}
          workDayEndHour={workDayEndHour}
          onCreateAt={readOnly ? undefined : handleCreateAt}
        />
      )}

      <SlotFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        trainers={trainers}
        locations={locations}
        equipment={equipment}
        slot={editingSlot}
        defaultDate={prefillDate ?? weekStart}
        defaultStartHour={prefillStartHour}
        lockedTrainerId={ownTrainerId}
        workDayStartHour={workDayStartHour}
        workDayEndHour={workDayEndHour}
      />
    </div>
  );
}
