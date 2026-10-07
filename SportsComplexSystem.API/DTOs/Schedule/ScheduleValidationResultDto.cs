using SportsComplexSystem.API.DTOs.Trainers;

namespace SportsComplexSystem.API.DTOs.Schedule;

/// <summary>
/// Тип конфлікту при перевірці розкладу.
/// </summary>
public enum ConflictType
{
    LocationBusy,
    TrainerBusy,
    WeeklyHoursExceeded,
    EquipmentNotOperational,
    OutsideWorkingHours,
    InvalidTimeRange
}

public class ConflictDto
{
    public ConflictType Type { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Результат валідації слоту розкладу (dry-run або перед збереженням).
/// </summary>
public class ScheduleValidationResultDto
{
    public bool IsValid { get; set; }
    public List<ConflictDto> Conflicts { get; set; } = new();

    /// <summary>
    /// Запропонований альтернативний тренер, якщо виявлено конфлікт TrainerBusy/WeeklyHoursExceeded.
    /// </summary>
    public TrainerDto? SuggestedTrainer { get; set; }
}
