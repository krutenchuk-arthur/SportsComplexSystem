import type { EquipmentStatus } from './enums';

export interface Equipment {
  id: number;
  inventoryNumber: string;
  name: string;
  locationId: number;
  locationName: string;
  currentUsageHours: number;
  maintenanceThresholdHours: number;
  status: EquipmentStatus;
  wearPercentage: number;
}

export interface EquipmentCreateUpdate {
  inventoryNumber: string;
  name: string;
  locationId: number;
  currentUsageHours: number;
  maintenanceThresholdHours: number;
}
