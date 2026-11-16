namespace SportsComplexSystem.API.Models;

/// <summary>
/// Запис журналу аудиту дій користувачів системи.
/// </summary>
public class AuditLog
{
    public int Id { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Email користувача, який виконав дію (або "system" для фонових операцій).
    /// </summary>
    public string UserEmail { get; set; } = string.Empty;

    /// <summary>
    /// Роль користувача на момент виконання дії.
    /// </summary>
    public string UserRole { get; set; } = string.Empty;

    /// <summary>
    /// Опис дії (наприклад, "Створення заняття").
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Тип сутності (ScheduleSlot, MaintenanceTicket, Settings тощо).
    /// </summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>
    /// Короткий людиночитний опис зміненої сутності.
    /// </summary>
    public string EntitySummary { get; set; } = string.Empty;
}
