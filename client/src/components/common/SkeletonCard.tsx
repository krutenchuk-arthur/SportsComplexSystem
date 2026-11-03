/**
 * Skeleton-лоадер для KPI-карток / карток (animate-pulse), щоб уникнути
 * показу "сирого" тексту на час завантаження даних.
 */
export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
        <div className="h-6 w-16 bg-zinc-100 dark:bg-zinc-800 rounded" />
      </div>
    </div>
  );
}
