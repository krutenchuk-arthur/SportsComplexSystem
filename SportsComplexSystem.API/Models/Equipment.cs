using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.Models;

/// <summary>
/// Одиниця інвентарю/обладнання.
/// </summary>
public class Equipment
{
    public int Id { get; set; }
    
    /// <summary>
    /// Інвентарний номер (наприклад, INV-104).
    /// </summary>
    public required string InventoryNumber { get; set; }
    
    public required string Name { get; set; }
    
    public int LocationId { get; set; }
    public Location Location { get; set; } = null!;
    
    /// <summary>
    /// Поточне напрацювання годин (double для підтримки 1.5 год тощо).
    /// </summary>
    public double CurrentUsageHours { get; set; }
    
    /// <summary>
    /// Граничний поріг до ТО (double).
    /// </summary>
    public double MaintenanceThresholdHours { get; set; }
    
    public EquipmentStatus Status { get; set; } = EquipmentStatus.Operational;
    
    // Navigation
    public ICollection<MaintenanceTicket> MaintenanceTickets { get; set; } = new List<MaintenanceTicket>();
    public ICollection<ScheduleSlot> ScheduleSlots { get; set; } = new List<ScheduleSlot>();
}
