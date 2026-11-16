import { useEffect, useMemo, useState } from 'react';
import { addDays, format, startOfWeek, isSameDay } from 'date-fns';
import { uk } from 'date-fns/locale';
import { MapPin, User, Dumbbell, Pencil, Trash2, Plus } from 'lucide-react';
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
  /** Клік по вільному часовому вікну — створити заняття з цієї години */
  onCreateAt?: (day: Date, startHour: number) => void;
}

type GridEntry =
  | { kind: 'slot'; slot: ScheduleSlot }
  | { kind: 'gap'; start: number; end: number };

const toHours = (iso: string) => {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
};

const formatHour = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Тижнева сітка розкладу: 7 колонок (Пн–Нд), картки занять відсортовані за часом.
 * Порожні вікна в межах робочих годин доступні для швидкого створення заняття.
 */
export default function ScheduleGrid({
  slots,
  weekStart,
  onEdit,
  onDelete,
  canManage = () => true,
  workDayStartHour = 0,
  workDayEndHour = 24,
  onCreateAt,
}: ScheduleGridProps) {
  const weekStartDate = useMemo(() => startOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart]);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i)),
    [weekStartDate]
  );

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const nowHours = now.getHours() + now.getMinutes() / 60;
  const showNowMarker = nowHours >= workDayStartHour && nowHours < workDayEndHour;

  /** Хронологічна стрічка «заняття + вільні вікна» для кожної колонки тижня */
  const timelineByDay = useMemo<GridEntry[][]>(() => {
    return days.map((day) => {
      const daySlots = slots
        .filter((slot) => isSameDay(new Date(slot.startTime), day))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      const entries: GridEntry[] = [];
      let cursor = workDayStartHour;

      for (const slot of daySlots) {
        const start = toHours(slot.startTime);
        const end = toHours(slot.endTime);

        if (start > cursor && cursor < workDayEndHour) {
          const gapEnd = Math.min(start, workDayEndHour);
          if (gapEnd - cursor >= 1) entries.push({ kind: 'gap', start: cursor, end: gapEnd });
        }

        entries.push({ kind: 'slot', slot });
        cursor = Math.max(cursor, Math.min(end, workDayEndHour));
      }

      if (cursor < workDayEndHour) {
        entries.push({ kind: 'gap', start: cursor, end: workDayEndHour });
      }

      return entries;
    });
  }, [days, slots, workDayStartHour, workDayEndHour]);

  const isOutsideWorkingHours = (slot: ScheduleSlot) => {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    return startHour < workDayStartHour || endHour > workDayEndHour;
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3 md:min-w-[840px]">
      {days.map((day, idx) => (
        <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 min-h-[200px]">
          <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
              {format(day, 'EEEEEE', { locale: uk })}
            </span>
            <span className="text-xs font-mono text-zinc-500">{format(day, 'dd.MM')}</span>
          </div>

          {isSameDay(day, now) && showNowMarker && (
            <div className="flex items-center gap-1.5 mb-2" aria-label="Поточний час">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="flex-1 h-px bg-red-500/70" />
              <span className="font-mono text-[9px] font-medium text-red-600 dark:text-red-400">
                {format(now, 'HH:mm')}
              </span>
            </div>
          )}

          <div className="space-y-2">
            {timelineByDay[idx].length === 0 && (
              <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center py-4">Немає занять</p>
            )}

            {timelineByDay[idx].map((entry, entryIdx) => {
              if (entry.kind === 'gap') {
                const suggestedStart = Math.min(
                  Math.max(Math.ceil(entry.start), workDayStartHour),
                  Math.max(workDayStartHour, workDayEndHour - 1)
                );
                const canCreateHere = !!onCreateAt && suggestedStart + 1 <= entry.end;

                return (
                  <button
                    key={`gap-${entryIdx}`}
                    type="button"
                    disabled={!canCreateHere}
                    onClick={() => onCreateAt?.(day, suggestedStart)}
                    title={canCreateHere ? 'Створити заняття у цьому вікні' : 'Вікно закоротке для заняття'}
                    className={`w-full flex items-center justify-center gap-1 rounded-md border border-dashed px-1.5 py-2 font-mono text-[10px] transition-colors ${
                      canCreateHere
                        ? 'border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-rose-600 dark:hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/5'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 cursor-default'
                    }`}
                  >
                    <Plus size={10} /> {formatHour(entry.start)}–{formatHour(entry.end)}
                  </button>
                );
              }

              const slot = entry.slot;
              return (
              <div
                key={slot.id}
                className="group bg-zinc-50 dark:bg-zinc-800/50 border-l-2 border-rose-600 rounded-lg p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-snug">{slot.title}</p>
                  {canManage(slot) && <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => onEdit(slot)}
                      className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500"
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
                  <p className="text-[11px] font-mono text-rose-600 dark:text-rose-500">
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
              );
            })}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
