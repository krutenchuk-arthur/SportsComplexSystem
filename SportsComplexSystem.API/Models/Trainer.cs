using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.Models;

/// <summary>
/// Тренер спортивного комплексу.
/// </summary>
public class Trainer
{
    public int Id { get; set; }
    
    public required string FullName { get; set; }
    
    public SpecializationType Specialization { get; set; }
    
    /// <summary>
    /// Максимальна кількість годин на тиждень (стандарт 40).
    /// </summary>
    public int MaxWeeklyHours { get; set; } = 40;
    
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Погодинна ставка тренера, грн/год (використовується для прогнозу ФОП).
    /// </summary>
    public decimal HourlyRate { get; set; } = 450m;
    
    // Navigation
    public ICollection<ScheduleSlot> ScheduleSlots { get; set; } = new List<ScheduleSlot>();
}
