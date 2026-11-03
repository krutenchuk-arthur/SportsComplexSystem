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
