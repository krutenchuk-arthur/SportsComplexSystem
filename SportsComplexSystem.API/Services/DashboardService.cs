using Microsoft.EntityFrameworkCore;
using SportsComplexSystem.API.Data;
using SportsComplexSystem.API.DTOs.Dashboard;
using SportsComplexSystem.API.Models.Enums;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;
    private readonly ITrainerService _trainerService;

    public DashboardService(AppDbContext context, ITrainerService trainerService)
    {
        _context = context;
        _trainerService = trainerService;
    }

    public async Task<DashboardKpiDto> GetKpiAsync()
    {
        var trainers = await _trainerService.GetAllWithWorkloadAsync();

        var totalAssigned = trainers.Sum(t => t.AssignedHours);
        var totalMax = trainers.Sum(t => t.MaxWeeklyHours);
        var overallLoad = totalMax > 0 ? (totalAssigned / totalMax) * 100 : 0;

        var today = DateTime.UtcNow.Date;
        var activeTrainingsToday = await _context.ScheduleSlots
            .CountAsync(s => s.StartTime.Date == today);

        var equipmentInService = await _context.Equipment
            .CountAsync(e => e.Status == EquipmentStatus.Operational);

        var equipmentOnMaintenance = await _context.Equipment
            .CountAsync(e => e.Status == EquipmentStatus.MaintenanceRequired || e.Status == EquipmentStatus.UnderRepair);

        var openTicketsCount = await _context.MaintenanceTickets
            .CountAsync(t => t.Status == TicketStatus.Open);

        return new DashboardKpiDto
        {
            OverallLoadPercentage = overallLoad,
            ActiveTrainingsToday = activeTrainingsToday,
            EquipmentInService = equipmentInService,
            EquipmentOnMaintenance = equipmentOnMaintenance,
            OpenTicketsCount = openTicketsCount
        };
    }

    public async Task<List<AlertDto>> GetAlertsAsync(int limit = 10)
    {
        var alerts = new List<AlertDto>();

        // Відкриті заявки на ТО
        var openTickets = await _context.MaintenanceTickets
            .Include(t => t.Equipment)
            .Where(t => t.Status == TicketStatus.Open)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        foreach (var ticket in openTickets)
        {
            alerts.Add(new AlertDto
            {
                Severity = AlertSeverity.Critical,
                Message = $"{ticket.Equipment.Name} #{ticket.Equipment.InventoryNumber} перевищив ліміт напрацювання — створено заявку на ТО.",
                Timestamp = ticket.CreatedAt
            });
        }

        // Перевантажені тренери
        var trainers = await _trainerService.GetAllWithWorkloadAsync();
        var overloaded = trainers.Where(t => t.LoadPercentage >= 100);

        foreach (var trainer in overloaded)
        {
            alerts.Add(new AlertDto
            {
                Severity = AlertSeverity.Critical,
                Message = $"Тренер {trainer.FullName} перевантажений: {trainer.AssignedHours:0.#}/{trainer.MaxWeeklyHours} год на тиждень.",
                Timestamp = DateTime.UtcNow
            });
        }

        var warningTrainers = trainers.Where(t => t.LoadPercentage >= 75 && t.LoadPercentage < 100);
        foreach (var trainer in warningTrainers)
        {
            alerts.Add(new AlertDto
            {
                Severity = AlertSeverity.Warning,
                Message = $"Тренер {trainer.FullName} наближається до ліміту: {trainer.AssignedHours:0.#}/{trainer.MaxWeeklyHours} год на тиждень.",
                Timestamp = DateTime.UtcNow
            });
        }

        // Обладнання, що наближається до порогу ТО (поріг попередження з SystemSettings)
        var warningPct = await _context.SystemSettings.Select(s => s.WarningWearPercentage).FirstOrDefaultAsync();
        if (warningPct <= 0) warningPct = 80;

        var wearing = await _context.Equipment
            .Where(e => e.Status == EquipmentStatus.Operational && e.MaintenanceThresholdHours > 0)
            .ToListAsync();

        foreach (var e in wearing)
        {
            var wear = e.CurrentUsageHours / e.MaintenanceThresholdHours * 100;
            if (wear < warningPct || wear >= 100) continue;
            alerts.Add(new AlertDto
            {
                Severity = AlertSeverity.Warning,
                Message = $"{e.Name} #{e.InventoryNumber}: знос {wear:0}% (поріг попередження {warningPct}%).",
                Timestamp = DateTime.UtcNow
            });
        }

        return alerts
            .OrderByDescending(a => a.Severity)
            .ThenByDescending(a => a.Timestamp)
            .Take(limit)
            .ToList();
    }
}
