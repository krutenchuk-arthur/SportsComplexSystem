using SportsComplexSystem.API.DTOs.Schedule;

namespace SportsComplexSystem.API.Services;

/// <summary>
/// Виключення, що кидається при спробі створити/оновити слот розкладу з конфліктами.
/// Контролер мапить його у 409 Conflict з результатом валідації.
/// </summary>
public class ScheduleConflictException : Exception
{
    public ScheduleValidationResultDto ValidationResult { get; }

    public ScheduleConflictException(ScheduleValidationResultDto validationResult)
        : base("Виявлено конфлікти при створенні/редагуванні слоту розкладу.")
    {
        ValidationResult = validationResult;
    }
}
