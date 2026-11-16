import type { Trainer } from '../../types/trainer';
import { SPECIALIZATION_LABELS } from '../../types/enums';
import ProgressBar from '../common/ProgressBar';
import SkeletonTable from '../common/SkeletonTable';

interface WorkloadOverviewProps {
  trainers: Trainer[];
  loading: boolean;
}

/**
 * Візуальна шкала розподілу навантаження персоналу
 * (хто перевантажений, а хто недовантажений).
 */
export default function WorkloadOverview({ trainers, loading }: WorkloadOverviewProps) {
  if (loading) {
    return <SkeletonTable rows={5} columns={1} />;
  }

  const sorted = [...trainers].sort((a, b) => b.loadPercentage - a.loadPercentage);

  return (
    <div className="h-full min-h-0 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4 shrink-0">Розподіл навантаження персоналу</h3>
      <div className="space-y-4 xl:flex-1 xl:min-h-0 xl:overflow-y-auto">
        {sorted.map((trainer) => (
          <div key={trainer.id}>
            <ProgressBar
              value={trainer.assignedHours}
              max={trainer.maxWeeklyHours}
              label={`${trainer.fullName} · ${SPECIALIZATION_LABELS[trainer.specialization]}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
