namespace SportsComplexSystem.API.Models;

/// <summary>
/// Глобальні параметри спорткомплексу (єдиний запис у БД).
/// </summary>
public class SystemSettings
{
    public int Id { get; set; }

    public string ComplexName { get; set; } = "Спорткомплекс";

    public int WorkDayStartHour { get; set; } = 8;

    public int WorkDayEndHour { get; set; } = 22;

    public int DefaultMaxWeeklyHours { get; set; } = 40;

    public double DefaultMaintenanceThreshold { get; set; } = 200;

    /// <summary>
    /// Відсоток зносу, з якого обладнання вважається таким, що потребує уваги.
    /// </summary>
    public int WarningWearPercentage { get; set; } = 80;
}
