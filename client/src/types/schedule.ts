import type { Trainer } from './trainer';

export type ConflictType =
  | 'LocationBusy'
  | 'TrainerBusy'
  | 'WeeklyHoursExceeded'
  | 'EquipmentNotOperational'
  | 'OutsideWorkingHours'
  | 'InvalidTimeRange';

export interface Conflict {
  type: ConflictType;
  message: string;
}

export interface ScheduleValidationResult {
  isValid: boolean;
  conflicts: Conflict[];
  suggestedTrainer: Trainer | null;
}

export interface ScheduleSlot {
  id: number;
  trainerId: number;
  trainerName: string;
  locationId: number;
  locationName: string;
  startTime: string;
  endTime: string;
  title: string;
  equipmentIds: number[];
  equipmentNames: string[];
}

export interface ScheduleSlotCreateUpdate {
  trainerId: number;
  locationId: number;
  startTime: string;
  endTime: string;
  title: string;
  equipmentIds: number[];
}

export interface CloneWeekResult {
  copiedCount: number;
  skippedCount: number;
  skippedReasons: string[];
}
