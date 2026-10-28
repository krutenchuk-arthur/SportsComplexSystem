/**
 * Клієнтська попередня перевірка перетину двох часових інтервалів.
 * Використовується для миттєвого UX-фідбеку перед звертанням до API.
 */
export function timeRangesOverlap(
  startA: Date | string,
  endA: Date | string,
  startB: Date | string,
  endB: Date | string
): boolean {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  return sA < eB && sB < eA;
}
