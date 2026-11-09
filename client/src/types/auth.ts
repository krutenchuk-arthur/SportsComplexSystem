import type { SpecializationType } from './enums';

export type UserRole = 'Admin' | 'Trainer' | 'Technician';

export const ROLE_LABELS: Record<UserRole, string> = {
  Admin: 'Адміністратор',
  Trainer: 'Тренер',
  Technician: 'Технік',
};

export interface User {
  id: number;
  username: string | null;
  email: string;
  fullName: string;
  role: UserRole;
  trainerId: number | null;
  trainerSpecialization: SpecializationType | null;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface SystemSettings {
  complexName: string;
  workDayStartHour: number;
  workDayEndHour: number;
  defaultMaxWeeklyHours: number;
  defaultMaintenanceThreshold: number;
  warningWearPercentage: number;
}
