using System.ComponentModel.DataAnnotations;

namespace SportsComplexSystem.API.DTOs.Settings;

public class SettingsDto : IValidatableObject
{
    [Required, StringLength(120, MinimumLength = 2)]
    public string ComplexName { get; set; } = string.Empty;

    [Range(0, 23)]
    public int WorkDayStartHour { get; set; }

    [Range(1, 24)]
    public int WorkDayEndHour { get; set; }

    [Range(1, 80)]
    public int DefaultMaxWeeklyHours { get; set; }

    [Range(1, 100000)]
    public double DefaultMaintenanceThreshold { get; set; }

    [Range(1, 99)]
    public int WarningWearPercentage { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (WorkDayEndHour <= WorkDayStartHour)
            yield return new ValidationResult(
                "Кінець робочого дня має бути пізніше за початок.",
                new[] { nameof(WorkDayEndHour) });
    }
}
