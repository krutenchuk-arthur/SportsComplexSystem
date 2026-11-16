import type { SpecializationType, LoadStatus } from './enums';

export interface Trainer {
  id: number;
  fullName: string;
  specialization: SpecializationType;
  maxWeeklyHours: number;
  /** Погодинна ставка, грн/год */
  hourlyRate: number;
  phoneNumber?: string | null;
  assignedHours: number;
  loadPercentage: number;
  loadStatus: LoadStatus;
}

export interface TrainerCreateUpdate {
  fullName: string;
  specialization: SpecializationType;
  maxWeeklyHours: number;
  hourlyRate: number;
  phoneNumber?: string | null;
}

export interface AutoAssignResult {
  trainer: Trainer | null;
  found: boolean;
  message: string | null;
}
