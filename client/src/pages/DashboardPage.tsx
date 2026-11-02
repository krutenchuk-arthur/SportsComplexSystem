import { useMemo } from 'react';
import { CalendarClock, Clock, Gauge, MapPin } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import KpiGrid from '../components/dashboard/KpiGrid';
import WorkloadOverview from '../components/dashboard/WorkloadOverview';
import AlertsFeed from '../components/dashboard/AlertsFeed';
import KpiCard from '../components/common/KpiCard';
import SkeletonCard from '../components/common/SkeletonCard';
import ProgressBar from '../components/common/ProgressBar';
import StatusBadge from '../components/common/StatusBadge';
import { useDashboard } from '../hooks/useDashboard';
import { useTrainers } from '../hooks/useTrainers';
import { useSchedule } from '../hooks/useSchedule';
import { useAuth } from '../context/AuthContext';
import { loadStatusToLevel } from '../utils/statusColors';
import { formatDateTime, formatTime } from '../utils/formatters';

function TrainerDashboard() {
  const { user } = useAuth();
  const { trainers, loading: trainersLoading } = useTrainers();
  const { slots, loading: slotsLoading } = useSchedule();

  const me = trainers.find((t) => t.id === user?.trainerId) ?? null;
  const upcoming = useMemo(() => {
    const now = Date.now();
    return slots
      .filter((s) => s.trainerId === user?.trainerId && new Date(s.endTime).getTime() >= now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 6);
  }, [slots, user?.trainerId]);

  if (!user?.trainerId) {
    return (
      <p className="text-sm text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6">
        Акаунт не прив'язаний до профілю тренера. Зверніться до адміністратора.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {trainersLoading || !me ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard icon={Clock} label="Призначено цього тижня" value={`${me.assignedHours.toFixed(1)} год`} hint={`ліміт ${me.maxWeeklyHours} год`} />
          <KpiCard icon={Gauge} label="Завантаженість" value={`${me.loadPercentage.toFixed(0)}%`} />
          <KpiCard icon={CalendarClock} label="Найближчих занять" value={upcoming.length} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Тижневе навантаження</h3>
            {me && <StatusBadge label={me.loadStatus} level={loadStatusToLevel(me.loadStatus)} />}
          </div>
          {me ? (
            <ProgressBar value={me.assignedHours} max={me.maxWeeklyHours} label={me.fullName} />
          ) : (
            <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          )}
        </section>

        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <h3 className="px-5 py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800">
            Найближчі тренування
          </h3>
          {slotsLoading ? (
            <div className="p-5 space-y-2 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded" />)}
            </div>
          ) : upcoming.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">Запланованих занять немає.</p>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {upcoming.map((s) => (
                <li key={s.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{s.title}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5"><MapPin size={11} /> {s.locationName}</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                    {formatDateTime(s.startTime).split(' ')[0]} · {formatTime(s.startTime)}–{formatTime(s.endTime)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function OperationsDashboard() {
  const { kpi, alerts, loading: dashboardLoading } = useDashboard();
  const { trainers, loading: trainersLoading } = useTrainers();

  return (
    <div className="space-y-6">
      <KpiGrid kpi={kpi} loading={dashboardLoading} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkloadOverview trainers={trainers} loading={trainersLoading} />
        <AlertsFeed alerts={alerts} loading={dashboardLoading} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { hasRole } = useAuth();
  const isTrainer = hasRole('Trainer');

  return (
    <div>
      <PageHeader
        title={isTrainer ? 'Мій дашборд' : 'Аналітичний дашборд'}
        subtitle={
          isTrainer
            ? 'Особистий прогрес годин за тиждень та найближчі тренування'
            : 'Загальний стан завантаженості персоналу та технічного обслуговування інвентарю'
        }
      />
      {isTrainer ? <TrainerDashboard /> : <OperationsDashboard />}
    </div>
  );
}
