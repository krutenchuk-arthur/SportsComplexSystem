import { AlertTriangle, AlertCircle } from 'lucide-react';
import type { Alert } from '../../types/dashboard';
import { formatDateTime } from '../../utils/formatters';

interface AlertsFeedProps {
  alerts: Alert[];
  loading: boolean;
}

/**
 * Швидкий список критичних сповіщень на дашборді.
 */
export default function AlertsFeed({ alerts, loading }: AlertsFeedProps) {
  if (loading) {
    return (
      <div className="h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-6 animate-pulse space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-6 text-center text-sm text-zinc-500">
        Наразі критичних сповіщень немає.
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4 shrink-0">Критичні сповіщення</h3>
      <ul className="space-y-3 xl:flex-1 xl:min-h-0 xl:overflow-y-auto">
        {alerts.map((alert, idx) => {
          const isCritical = alert.severity === 'Critical';
          const Icon = isCritical ? AlertCircle : AlertTriangle;
          const colorClass = isCritical ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400';
          const bgClass = isCritical ? 'bg-red-50 dark:bg-red-500/10' : 'bg-amber-500/10';

          return (
            <li key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${bgClass}`}>
              <Icon size={16} className={`${colorClass} shrink-0 mt-0.5`} />
              <div>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">{alert.message}</p>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">{formatDateTime(alert.timestamp)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
