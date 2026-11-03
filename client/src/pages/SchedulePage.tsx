import { useState } from 'react';
import { addDays, addWeeks, format, startOfWeek } from 'date-fns';
import { uk } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import ScheduleGrid from '../components/schedule/ScheduleGrid';
import SlotFormModal from '../components/schedule/SlotFormModal';
import { useSchedule } from '../hooks/useSchedule';
import { useTrainers } from '../hooks/useTrainers';
import { useEquipment } from '../hooks/useEquipment';
import type { ScheduleSlot, ScheduleSlotCreateUpdate } from '../types/schedule';

export default function SchedulePage() {
  const { slots, locations, loading, createSlot, updateSlot, deleteSlot } = useSchedule();
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

  const visibleSlots = slots.filter(
    (s) =>
      (locationFilter === 'all' || s.locationId === locationFilter) &&
      (!onlyMine || ownTrainerId === null || s.trainerId === ownTrainerId)
  );

  const handleAdd = () => {
    setEditingSlot(null);
    setIsFormOpen(true);
  };

  const handleEdit = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setIsFormOpen(true);
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
    <div>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <PageHeader
          title="Диспетчер розкладу"
          subtitle="Тижнева сітка занять з автоматичною перевіркою колізій залу, тренера та обладнання"
        />
        <div className="flex items-center gap-3">
          {isTrainer && (
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
              <button
                type="button"
                role="switch"
                aria-checked={onlyMine}
                onClick={() => setOnlyMine((v) => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors ${onlyMine ? 'bg-orange-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
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
            className="px-3 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
          >
            <option value="all">Усі локації</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          {!readOnly && <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-colors"
          >
            <Plus size={16} />
            Нове заняття
          </button>}
        </div>
      </div>

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
            <span className="text-zinc-500 ml-2 text-xs">(тиждень)</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 min-h-[200px] animate-pulse">
              <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-16 mb-4" />
              <div className="space-y-2">
                <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
              </div>
            </div>
          ))}
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
        defaultDate={weekStart}
        lockedTrainerId={ownTrainerId}
        workDayStartHour={workDayStartHour}
        workDayEndHour={workDayEndHour}
      />
    </div>
  );
}
