namespace SportsComplexSystem.API.DTOs.Dashboard;

public class DashboardKpiDto
{
    /// <summary>
    /// Загальна завантаженість тренерів (%): сума AssignedHours / сума MaxWeeklyHours * 100.
    /// </summary>
    public double OverallLoadPercentage { get; set; }

    public int ActiveTrainingsToday { get; set; }

    public int EquipmentInService { get; set; }

    public int EquipmentOnMaintenance { get; set; }

    public int OpenTicketsCount { get; set; }
}
