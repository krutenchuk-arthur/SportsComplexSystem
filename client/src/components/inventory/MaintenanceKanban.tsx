import { Clock, Play, CheckCircle2 } from 'lucide-react';
import type { MaintenanceTicket } from '../../types/maintenance';
import type { TicketStatus } from '../../types/enums';
import { formatDateTime } from '../../utils/formatters';

interface MaintenanceKanbanProps {
  tickets: MaintenanceTicket[];
  /** Якщо не передано, дошка лише для перегляду */
  onUpdateStatus?: (id: number, status: TicketStatus) => void;
}

const COLUMNS: { status: TicketStatus; title: string; accent: string }[] = [
  { status: 'Open', title: 'Відкриті', accent: 'border-t-red-500' },
  { status: 'InProgress', title: 'В роботі', accent: 'border-t-amber-500' },
  { status: 'Completed', title: 'Завершені', accent: 'border-t-emerald-500' },
];

export default function MaintenanceKanban({ tickets, onUpdateStatus }: MaintenanceKanbanProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {COLUMNS.map((column) => {
        const columnTickets = tickets.filter((t) => t.status === column.status);
        return (
          <div
            key={column.status}
            className={`bg-white dark:bg-zinc-900 border-t-2 ${column.accent} border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 min-h-[180px]`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{column.title}</h4>
              <span className="text-xs font-mono text-zinc-500">{columnTickets.length}</span>
            </div>

            <div className="space-y-2">
              {columnTickets.length === 0 && (
                <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center py-4">Порожньо</p>
              )}

              {columnTickets.map((ticket) => (
                <div key={ticket.id} className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{ticket.equipmentName}</p>
                      <p className="text-xs font-mono text-rose-600 dark:text-rose-500">{ticket.equipmentInventoryNumber}</p>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">#{ticket.id}</span>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-snug">{ticket.description}</p>

                  <p className="text-[10px] font-mono text-zinc-500 mt-2 flex items-center gap-1">
                    <Clock size={10} /> {formatDateTime(ticket.createdAt)}
                  </p>

                  {onUpdateStatus && ticket.status === 'Open' && (
                    <button
                      onClick={() => onUpdateStatus(ticket.id, 'InProgress')}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-rose-600 dark:bg-rose-500 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
                    >
                      <Play size={12} /> Взяти в роботу
                    </button>
                  )}

                  {onUpdateStatus && ticket.status === 'InProgress' && (
                    <button
                      onClick={() => onUpdateStatus(ticket.id, 'Completed')}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
                    >
                      <CheckCircle2 size={12} /> Завершити ТО
                    </button>
                  )}

                  {ticket.status === 'Completed' && ticket.completedAt && (
                    <p className="mt-2 text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                      Завершено: {formatDateTime(ticket.completedAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
