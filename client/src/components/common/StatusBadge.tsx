import { getStatusColors, getStatusColorsByLevel, type StatusLevel } from '../../utils/statusColors';

interface StatusBadgeProps {
  label: string;
  percentage?: number;
  level?: StatusLevel;
}

/**
 * Статусна бірка: моноширинна, прямокутна, з тонкою рамкою (Swiss Industrial).
 */
export default function StatusBadge({ label, percentage, level }: StatusBadgeProps) {
  const colors = level ? getStatusColorsByLevel(level) : getStatusColors(percentage ?? 0);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border font-mono text-[11px] font-medium uppercase tracking-wide ${colors.badgeBg} ${colors.text} ${colors.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-sm ${colors.bar}`} />
      {label}
    </span>
  );
}
