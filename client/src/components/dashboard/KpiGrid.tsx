import { Activity, CalendarCheck, Dumbbell, Receipt, Wallet, Wrench } from 'lucide-react';
import KpiCard from '../common/KpiCard';
import SkeletonCard from '../common/SkeletonCard';
import type { DashboardKpi } from '../../types/dashboard';
import { formatMoney } from '../../utils/formatters';

interface KpiGridProps {
  kpi: DashboardKpi | null;
  loading: boolean;
}

export default function KpiGrid({ kpi, loading }: KpiGridProps) {
  if (loading || !kpi) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
      <KpiCard
        icon={Wallet}
        label="Фонд оплати праці за тиждень"
        value={formatMoney(kpi.weeklyPayrollEstimate)}
        hint="Σ (призначені години × ставка тренера)"
        accentColor="text-emerald-600 dark:text-emerald-500"
      />
      <KpiCard
        icon={Receipt}
        label="Вартість виконаних ремонтів"
        value={formatMoney(kpi.totalMaintenanceCost)}
        hint="Σ вартості завершених заявок ТО"
        accentColor="text-emerald-600 dark:text-emerald-500"
      />
    </div>
  );
}

