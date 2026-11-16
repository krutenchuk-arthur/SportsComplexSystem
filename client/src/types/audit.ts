/** Запис журналу аудиту (ендпоінт GET /api/audit, тільки для Admin). */
export interface AuditLogEntry {
  id: number;
  /** ISO-рядок у UTC (без суфікса Z) */
  timestamp: string;
  userEmail: string;
  userRole: string;
  action: string;
  entityType: string;
  entitySummary: string;
}
