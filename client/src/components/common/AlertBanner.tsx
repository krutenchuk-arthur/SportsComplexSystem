import { AlertTriangle, XCircle, UserCheck } from 'lucide-react';
import type { Conflict } from '../../types/schedule';
import type { Trainer } from '../../types/trainer';
import { SPECIALIZATION_LABELS } from '../../types/enums';

interface AlertBannerProps {
  conflicts: Conflict[];
  suggestedTrainer?: Trainer | null;
  onUseSuggested?: (trainerId: number) => void;
}

/**
 * Банер миттєвої візуальної валідації: показує колізії часу/локації/перевантаження
 * тренера та пропонує альтернативного тренера (.clinerules: instant visual validation).
 */
export default function AlertBanner({ conflicts, suggestedTrainer, onUseSuggested }: AlertBannerProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <XCircle size={20} className="text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">Виявлено конфлікти при створенні заняття:</p>
          <ul className="space-y-1">
            {conflicts.map((conflict, idx) => (
              <li key={idx} className="text-sm text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
                {conflict.message}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {suggestedTrainer && (
        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60 rounded-lg p-3 ml-8">
          <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <UserCheck size={16} className="text-emerald-700 dark:text-emerald-400" />
            <span>
              Вільний тренер: <strong>{suggestedTrainer.fullName}</strong> (
              {SPECIALIZATION_LABELS[suggestedTrainer.specialization]})
            </span>
          </div>
          {onUseSuggested && (
            <button
              onClick={() => onUseSuggested(suggestedTrainer.id)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
            >
              Призначити
            </button>
          )}
        </div>
      )}
    </div>
  );
}
