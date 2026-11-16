import type { Trainer } from './trainer';

export type ConflictType =
  | 'LocationBusy'
  | 'TrainerBusy'
  | 'WeeklyHoursExceeded'
  | 'EquipmentNotOperational'
  | 'OutsideWorkingHours'
  | 'InvalidTimeRange'
  | 'CapacityExceeded';

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
  /** Кількість записаних учасників */
  bookedCount: number;
  /** Максимальна місткість локації */
  locationMaxCapacity: number;
  equipmentIds: number[];
  equipmentNames: string[];
}

export interface ScheduleSlotCreateUpdate {
  trainerId: number;
  locationId: number;
  startTime: string;
  endTime: string;
  title: string;
  bookedCount: number;
  equipmentIds: number[];
}

export interface CloneWeekResult {
  copiedCount: number;
  skippedCount: number;
  skippedReasons: string[];
}
