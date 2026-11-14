import { Activity, CalendarCheck, Dumbbell, Wrench } from 'lucide-react';
import KpiCard from '../common/KpiCard';
import SkeletonCard from '../common/SkeletonCard';
import type { DashboardKpi } from '../../types/dashboard';

interface KpiGridProps {
  kpi: DashboardKpi | null;
  loading: boolean;
}

export default function KpiGrid({ kpi, loading }: KpiGridProps) {
  if (loading || !kpi) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        icon={Activity}
        label="Загальна завантаженість тренерів"
        value={`${kpi.overallLoadPercentage.toFixed(1)}%`}
        accentColor="text-rose-600 dark:text-rose-500"
      />
      <KpiCard
        icon={CalendarCheck}
        label="Активні тренування сьогодні"
        value={kpi.activeTrainingsToday}
        accentColor="text-rose-600 dark:text-rose-500"
      />
      <KpiCard
        icon={Dumbbell}
        label="Інвентар у роботі / на ТО"
        value={`${kpi.equipmentInService} / ${kpi.equipmentOnMaintenance}`}
        accentColor="text-rose-600 dark:text-rose-500"
      />
      <KpiCard
        icon={Wrench}
        label="Відкриті заявки на ремонт"
        value={kpi.openTicketsCount}
        accentColor="text-rose-600 dark:text-rose-500"
      />
    </div>
  );
}
