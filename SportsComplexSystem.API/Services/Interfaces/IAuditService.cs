using SportsComplexSystem.API.DTOs.Audit;

namespace SportsComplexSystem.API.Services.Interfaces;

/// <summary>
/// Журнал аудиту змін у системі (хто, що і коли змінив).
/// </summary>
public interface IAuditService
{
    /// <summary>
    /// Записує подію аудиту та повідомляє підключених клієнтів через SignalR.
    /// </summary>
    Task RecordAsync(string action, string entityType, string entitySummary);

    /// <summary>
    /// Останні події аудиту (від найновіших).
    /// </summary>
    Task<List<AuditLogDto>> GetRecentAsync(int limit = 25);
}
