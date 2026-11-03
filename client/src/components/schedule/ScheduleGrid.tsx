import { useMemo } from 'react';
import { addDays, format, startOfWeek, isSameDay } from 'date-fns';
import { uk } from 'date-fns/locale';
import { MapPin, User, Dumbbell, Pencil, Trash2 } from 'lucide-react';
import type { ScheduleSlot } from '../../types/schedule';
import { formatTime } from '../../utils/formatters';

interface ScheduleGridProps {
  slots: ScheduleSlot[];
  weekStart: Date;
  onEdit: (slot: ScheduleSlot) => void;
  onDelete: (slot: ScheduleSlot) => void;
  /** Чи може поточний користувач редагувати слот */
  canManage?: (slot: ScheduleSlot) => boolean;
  /** Робочі години комплексу: слоти поза ними позначаються бейджем */
  workDayStartHour?: number;
  workDayEndHour?: number;
}

/**
 * Тижнева сітка розкладу: 7 колонок (Пн–Нд), картки занять відсортовані за часом.
 */
export default function ScheduleGrid({
  slots,
  weekStart,
  onEdit,
  onDelete,
  canManage = () => true,
  workDayStartHour = 0,
  workDayEndHour = 24,
}: ScheduleGridProps) {
  const weekStartDate = useMemo(() => startOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart]);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i)),
    [weekStartDate]
  );

  const slotsByDay = useMemo(() => {
    return days.map((day) =>
      slots
        .filter((slot) => isSameDay(new Date(slot.startTime), day))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    );
  }, [days, slots]);

  const isOutsideWorkingHours = (slot: ScheduleSlot) => {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    return startHour < workDayStartHour || endHour > workDayEndHour;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
      {days.map((day, idx) => (
        <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 min-h-[200px]">
          <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
              {format(day, 'EEEEEE', { locale: uk })}
            </span>
            <span className="text-xs font-mono text-zinc-500">{format(day, 'dd.MM')}</span>
          </div>

          <div className="space-y-2">
            {slotsByDay[idx].length === 0 && (
              <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center py-4">Немає занять</p>
            )}

            {slotsByDay[idx].map((slot) => (
              <div
                key={slot.id}
                className="group bg-zinc-50 dark:bg-zinc-800/50 border-l-2 border-orange-600 rounded-lg p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-snug">{slot.title}</p>
                  {canManage(slot) && <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => onEdit(slot)}
                      className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500"
                      title="Редагувати"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => onDelete(slot)}
                      className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Видалити"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>}
                </div>

                <div className="flex items-center justify-between gap-1 mt-1">
                  <p className="text-[11px] font-mono text-orange-600 dark:text-orange-500">
                    {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
                  </p>
                  {isOutsideWorkingHours(slot) && (
                    <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-amber-700 dark:text-amber-500 border border-amber-300 dark:border-amber-500/40 rounded px-1 py-px">
                      поза графіком
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                  <User size={10} /> {slot.trainerName}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <MapPin size={10} /> {slot.locationName}
                </p>
                {slot.equipmentNames.length > 0 && (
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-1">
                    <Dumbbell size={10} /> {slot.equipmentNames.length} обл.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
