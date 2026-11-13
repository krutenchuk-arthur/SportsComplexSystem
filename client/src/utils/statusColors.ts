/**
 * Кольорові токени згідно з .clinerules для статусів завантаженості/зносу.
 * Optimal (<75%): emerald, Warning (75-99.9%): amber, Critical (>=100%): rose.
 */
export type StatusLevel = 'optimal' | 'warning' | 'critical';

export function getStatusLevel(percentage: number): StatusLevel {
  if (percentage >= 100) return 'critical';
  if (percentage >= 75) return 'warning';
  return 'optimal';
}

interface StatusColorSet {
  badgeBg: string;
  text: string;
  bar: string;
  border: string;
}

const STATUS_COLORS: Record<StatusLevel, StatusColorSet> = {
  optimal: {
    badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    bar: 'bg-emerald-600 dark:bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-500/30',
  },
  warning: {
    badgeBg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    bar: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-500/30',
  },
  critical: {
    badgeBg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    bar: 'bg-red-600 dark:bg-red-500',
    border: 'border-red-200 dark:border-red-500/30',
  },
};

export function getStatusColors(percentage: number): StatusColorSet {
  return STATUS_COLORS[getStatusLevel(percentage)];
}

export function getStatusColorsByLevel(level: StatusLevel): StatusColorSet {
  return STATUS_COLORS[level];
}

/** Мапінг статусу обладнання на рівень кольору. */
export function equipmentStatusToLevel(status: string): StatusLevel {
  if (status === 'Operational') return 'optimal';
  if (status === 'MaintenanceRequired') return 'warning';
  return 'critical'; // UnderRepair
}

/** Мапінг LoadStatus тренера (з бекенду) на рівень кольору. */
export function loadStatusToLevel(status: string): StatusLevel {
  if (status === 'Optimal') return 'optimal';
  if (status === 'Warning') return 'warning';
  return 'critical';
}
