import type { ScheduleSlot } from '../types/schedule';

/**
 * Екранує значення за RFC 5545 (iCalendar): слеш, кома, крапка з комою, переноси рядків.
 */
const escapeIcsText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

/** UTC-мітка iCalendar: 20240131T120000Z (без залежності від локального часу) */
const toIcsUtc = (value: string | Date) => {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
};

/**
 * Формує вміст .ics-файлу (VCALENDAR / VEVENT) для переданих занять.
 * Файл сумісний з Google Calendar, Outlook та Apple Calendar.
 */
export const buildScheduleIcs = (slots: ScheduleSlot[]): string => {
  const stamp = toIcsUtc(new Date());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SportsComplexSystem//Schedule//UK',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const slot of slots) {
    const descriptionParts = [
      `Тренер: ${slot.trainerName}`,
      slot.equipmentNames.length > 0 ? `Інвентар: ${slot.equipmentNames.join(', ')}` : null,
    ].filter(Boolean) as string[];

    lines.push(
      'BEGIN:VEVENT',
      `UID:slot-${slot.id}@sportscomplex.local`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toIcsUtc(slot.startTime)}`,
      `DTEND:${toIcsUtc(slot.endTime)}`,
      `SUMMARY:${escapeIcsText(slot.title)}`,
      `LOCATION:${escapeIcsText(slot.locationName)}`,
      `DESCRIPTION:${escapeIcsText(descriptionParts.join('; '))}`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};

/** Завантажує текстовий файл у браузері (Blob + тимчасове посилання) */
export const downloadTextFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
