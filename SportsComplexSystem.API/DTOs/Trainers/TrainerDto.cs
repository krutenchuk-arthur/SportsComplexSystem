using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.DTOs.Trainers;

/// <summary>
/// DTO тренера з обчисленими показниками завантаженості.
/// </summary>
public class TrainerDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public SpecializationType Specialization { get; set; }
    public int MaxWeeklyHours { get; set; }
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Фактично призначені години за поточний тиждень (обчислюється сервісом).
    /// </summary>
    public double AssignedHours { get; set; }

    /// <summary>
    /// Коефіцієнт завантаженості у відсотках: AssignedHours / MaxWeeklyHours * 100.
    /// </summary>
    public double LoadPercentage { get; set; }

    public LoadStatus LoadStatus { get; set; }
}
