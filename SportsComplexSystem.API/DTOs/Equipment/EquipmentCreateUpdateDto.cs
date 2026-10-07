namespace SportsComplexSystem.API.DTOs.Equipment;

public class EquipmentCreateUpdateDto
{
    public string InventoryNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int LocationId { get; set; }
    public double CurrentUsageHours { get; set; }
    public double MaintenanceThresholdHours { get; set; } = 200;
}
