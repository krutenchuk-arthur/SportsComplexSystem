using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.DTOs.Equipment;

public class EquipmentDto
{
    public int Id { get; set; }
    public string InventoryNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int LocationId { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public double CurrentUsageHours { get; set; }
    public double MaintenanceThresholdHours { get; set; }
    public EquipmentStatus Status { get; set; }

    /// <summary>
    /// Відсоток зносу: CurrentUsageHours / MaintenanceThresholdHours * 100.
    /// </summary>
    public double WearPercentage { get; set; }
}
