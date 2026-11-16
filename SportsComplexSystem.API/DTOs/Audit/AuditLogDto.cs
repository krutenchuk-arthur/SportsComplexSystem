namespace SportsComplexSystem.API.DTOs.Audit;

/// <summary>
/// Запис журналу аудиту для стрічки подій на дашборді.
/// </summary>
public class AuditLogDto
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntitySummary { get; set; } = string.Empty;
}
