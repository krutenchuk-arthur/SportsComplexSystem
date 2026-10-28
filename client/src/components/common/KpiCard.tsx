import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accentColor?: string;
  hint?: string;
}

/**
 * KPI-плитка: тонка рамка, мітка зверху, числове значення моноширинним шрифтом.
 */
export default function KpiCard({ icon: Icon, label, value, accentColor = 'text-orange-600 dark:text-orange-500', hint }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</p>
        <Icon size={16} className={accentColor} />
      </div>
      <p className="text-3xl font-semibold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 leading-none">{value}</p>
      {hint && <p className="mt-2 text-xs font-mono text-zinc-500">{hint}</p>}
    </div>
  );
}
