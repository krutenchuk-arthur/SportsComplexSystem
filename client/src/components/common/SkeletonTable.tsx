interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

/**
 * Skeleton-лоадер для таблиць (animate-pulse).
 */
export default function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <div className="animate-pulse">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="flex gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0"
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div key={colIdx} className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
