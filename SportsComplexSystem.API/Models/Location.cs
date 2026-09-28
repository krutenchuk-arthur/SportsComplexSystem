using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.Models;

/// <summary>
/// Локація (зала/зона) спортивного комплексу.
/// </summary>
public class Location
{
    public int Id { get; set; }
    
    public required string Name { get; set; }
    
    public LocationType Type { get; set; }
    
    // Navigation
    public ICollection<ScheduleSlot> ScheduleSlots { get; set; } = new List<ScheduleSlot>();
    public ICollection<Equipment> Equipment { get; set; } = new List<Equipment>();
}
