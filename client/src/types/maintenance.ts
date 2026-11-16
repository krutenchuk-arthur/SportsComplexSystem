import type { TicketStatus } from './enums';

export interface MaintenanceTicket {
  id: number;
  equipmentId: number;
  equipmentInventoryNumber: string;
  equipmentName: string;
  status: TicketStatus;
  description: string;
  createdAt: string;
  completedAt?: string | null;
  /** Вартість ремонту, грн (заповнюється при закритті заявки) */
  repairCost: number | null;
}
