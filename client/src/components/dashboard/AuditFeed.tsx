import { History, RefreshCw } from 'lucide-react';
import { useAuditLog } from '../../hooks/useAuditLog';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';
import { formatAuditTimestamp } from '../../utils/formatters';

const ROLE_BADGE: Record<string, string> = {
  Admin: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-500 dark:border-rose-500/30',
  Trainer: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30',
  Technician: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  System: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
};

const FALLBACK_BADGE = 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';

interface AuditFeedProps {
  limit?: number;
}

/**
 * Стрічка журналу аудиту: початкове завантаження через REST + live-оновлення
 * через SignalR-подію DataChanged (без перезавантаження сторінки).
 */
export default function AuditFeed({ limit = 40 }: AuditFeedProps) {
  const { entries, loading, error, refresh } = useAuditLog(limit);
  useRealtimeUpdates(() => {
    void refresh();
  });

  return (
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="font-mono text-[10px] text-rose-600 dark:text-rose-500">D</span>
          <History size={15} className="text-rose-600 dark:text-rose-500" />
          Журнал аудиту
        </h3>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/40 font-mono text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
          <button
            type="button"
            onClick={() => void refresh()}
            title="Оновити журнал"
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="px-4 sm:px-5 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {loading && entries.length === 0 ? (
        <div className="p-4 sm:p-5 space-y-2 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="px-4 sm:px-5 py-6 text-sm text-zinc-500">Подій ще немає.</p>
      ) : (
        <ol className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-[560px] overflow-y-auto">
          {entries.map((entry) => (
            <li key={entry.id} className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4">
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-zinc-500 pt-0.5">
                {formatAuditTimestamp(entry.timestamp)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{entry.action}</span>
                  <span
                    className={`px-1.5 py-px rounded border font-mono text-[10px] font-semibold uppercase tracking-wider ${
                      ROLE_BADGE[entry.userRole] ?? FALLBACK_BADGE
                    }`}
                  >
                    {entry.userRole}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded px-1 py-px">
                    {entry.entityType}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 break-words">{entry.entitySummary}</p>
                <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
                  {entry.userEmail} · #{entry.id}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
