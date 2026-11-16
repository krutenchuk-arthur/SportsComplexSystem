using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SportsComplexSystem.API.Data;
using SportsComplexSystem.API.DTOs.Audit;
using SportsComplexSystem.API.Hubs;
using SportsComplexSystem.API.Models;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Services;

public class AuditService : IAuditService
{
    /// <summary>
    /// Назва клієнтської події SignalR, на яку підписані React-сторінки.
    /// </summary>
    public const string DataChangedEvent = "DataChanged";

    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IHubContext<ComplexHub> _hub;

    public AuditService(AppDbContext context, IHttpContextAccessor httpContextAccessor, IHubContext<ComplexHub> hub)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
        _hub = hub;
    }

    public async Task RecordAsync(string action, string entityType, string entitySummary)
    {
        var user = _httpContextAccessor.HttpContext?.User;

        _context.AuditLogs.Add(new AuditLog
        {
            Timestamp = DateTime.UtcNow,
            UserEmail = user?.FindFirstValue(ClaimTypes.Email)
                        ?? user?.FindFirstValue("email")
                        ?? "system",
            UserRole = user?.FindFirstValue(ClaimTypes.Role) ?? "System",
            Action = action,
            EntityType = entityType,
            EntitySummary = entitySummary
        });

        await _context.SaveChangesAsync();
        await _hub.Clients.All.SendAsync(DataChangedEvent, entityType);
    }

    public async Task<List<AuditLogDto>> GetRecentAsync(int limit = 25)
    {
        limit = Math.Clamp(limit, 1, 200);

        return await _context.AuditLogs
            .OrderByDescending(a => a.Timestamp)
            .ThenByDescending(a => a.Id)
            .Take(limit)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                Timestamp = a.Timestamp,
                UserEmail = a.UserEmail,
                UserRole = a.UserRole,
                Action = a.Action,
                EntityType = a.EntityType,
                EntitySummary = a.EntitySummary
            })
            .ToListAsync();
    }
}
