export interface DashboardKpi {
  overallLoadPercentage: number;
  activeTrainingsToday: number;
  equipmentInService: number;
  equipmentOnMaintenance: number;
  openTicketsCount: number;
  /** Прогноз фонду оплати праці на поточний тиждень: Σ(години × ставка), грн */
  weeklyPayrollEstimate: number;
  /** Сумарна вартість виконаних ремонтів за всіма заявками ТО, грн */
  totalMaintenanceCost: number;
}

export type AlertSeverity = 'Warning' | 'Critical';

export interface Alert {
  severity: AlertSeverity;
  message: string;
  timestamp: string;
}
