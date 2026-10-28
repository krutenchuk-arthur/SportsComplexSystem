export interface DashboardKpi {
  overallLoadPercentage: number;
  activeTrainingsToday: number;
  equipmentInService: number;
  equipmentOnMaintenance: number;
  openTicketsCount: number;
}

export type AlertSeverity = 'Warning' | 'Critical';

export interface Alert {
  severity: AlertSeverity;
  message: string;
  timestamp: string;
}
