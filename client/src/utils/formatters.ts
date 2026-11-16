import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'dd.MM.yyyy HH:mm', { locale: uk });
}

export function formatTime(iso: string): string {
  return format(parseISO(iso), 'HH:mm', { locale: uk });
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'dd.MM.yyyy', { locale: uk });
}

export function formatWeekday(iso: string): string {
  return format(parseISO(iso), 'EEEEEE', { locale: uk });
}

export function formatHours(hours: number): string {
  return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
}

const moneyFormatter = new Intl.NumberFormat('uk-UA', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Грошова метрика у гривнях: 1 850,5 ₴ */
export function formatMoney(value: number): string {
  return `${moneyFormatter.format(value)} ₴`;
}

/**
 * Бекенд віддає аудит у UTC без суфікса Z — нормалізуємо перед парсингом,
 * щоб стрічка подій не зсувалася на часовий пояс клієнта.
 */
export function parseUtcIso(iso: string): Date {
  const hasZone = /[zZ]$|[+-]\d{2}:\d{2}$/.test(iso);
  return parseISO(hasZone ? iso : `${iso}Z`);
}

/** Дата-час події аудиту у локальному часі. */
export function formatAuditTimestamp(iso: string): string {
  return format(parseUtcIso(iso), 'dd.MM.yyyy HH:mm', { locale: uk });
}
