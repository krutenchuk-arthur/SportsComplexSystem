import { getStatusColors } from '../../utils/statusColors';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showText?: boolean;
  unit?: string;
}

/**
 * Інженерна шкала: прямокутний трек, значення моноширинним шрифтом.
 */
export default function ProgressBar({ value, max, label, showText = true, unit = 'год' }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const colors = getStatusColors(max > 0 ? (value / max) * 100 : 0);

  return (
    <div className="w-full">
      {(label || showText) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>}
          {showText && (
            <span className="text-xs font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
              {value.toFixed(1)} / {max} {unit}
            </span>
          )}
        </div>
      )}
      <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-sm overflow-hidden">
        <div
          className={`h-full ${colors.bar} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
