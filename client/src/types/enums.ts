export type SpecializationType = 'StrengthTraining' | 'Cardio' | 'CrossFit' | 'Swimming' | 'Yoga';

export const SPECIALIZATION_LABELS: Record<SpecializationType, string> = {
  StrengthTraining: 'Силовий тренінг',
  Cardio: 'Кардіо',
  CrossFit: 'Кроссфіт',
  Swimming: 'Плавання',
  Yoga: 'Йога',
};

export type LocationType = 'GymHall' | 'GroupHall' | 'CardioZone' | 'Pool';

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  GymHall: 'Тренажерна зала',
  GroupHall: 'Зала групових занять',
  CardioZone: 'Кардіо-зона',
  Pool: 'Басейн',
};

export type EquipmentStatus = 'Operational' | 'MaintenanceRequired' | 'UnderRepair';

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  Operational: 'Працює',
  MaintenanceRequired: 'Потребує ТО',
  UnderRepair: 'На ремонті',
};

export type TicketStatus = 'Open' | 'InProgress' | 'Completed';

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  Open: 'Відкрита',
  InProgress: 'В роботі',
  Completed: 'Завершена',
};

export type LoadStatus = 'Optimal' | 'Warning' | 'Critical';
