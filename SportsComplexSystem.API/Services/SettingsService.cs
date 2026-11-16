using Microsoft.EntityFrameworkCore;
using SportsComplexSystem.API.Data;
using SportsComplexSystem.API.DTOs.Settings;
using SportsComplexSystem.API.Models;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Services;

public interface ISettingsService
{
    Task<SettingsDto> GetAsync();
    Task<SettingsDto> UpdateAsync(SettingsDto dto);
}

public class SettingsService : ISettingsService
{
    private readonly AppDbContext _context;
    private readonly IAuditService _audit;

    public SettingsService(AppDbContext context, IAuditService audit)
    {
        _context = context;
        _audit = audit;
    }

    public async Task<SettingsDto> GetAsync() => Map(await GetOrCreateAsync());

    public async Task<SettingsDto> UpdateAsync(SettingsDto dto)
    {
        var s = await GetOrCreateAsync();
        s.ComplexName = dto.ComplexName.Trim();
        s.WorkDayStartHour = dto.WorkDayStartHour;
        s.WorkDayEndHour = dto.WorkDayEndHour;
        s.DefaultMaxWeeklyHours = dto.DefaultMaxWeeklyHours;
        s.DefaultMaintenanceThreshold = dto.DefaultMaintenanceThreshold;
        s.WarningWearPercentage = dto.WarningWearPercentage;
        await _context.SaveChangesAsync();

        await _audit.RecordAsync("Оновлення налаштувань комплексу", "Settings",
            $"«{s.ComplexName}» · робочі години {s.WorkDayStartHour:00}:00–{s.WorkDayEndHour:00}:00 · " +
            $"ліміт {s.DefaultMaxWeeklyHours} год · поріг ТО {s.DefaultMaintenanceThreshold} год");

        return Map(s);
    }

    private async Task<SystemSettings> GetOrCreateAsync()
    {
        var s = await _context.SystemSettings.OrderBy(x => x.Id).FirstOrDefaultAsync();
        if (s != null) return s;

        s = new SystemSettings();
        _context.SystemSettings.Add(s);
        await _context.SaveChangesAsync();
        return s;
    }

    private static SettingsDto Map(SystemSettings s) => new()
    {
        ComplexName = s.ComplexName,
        WorkDayStartHour = s.WorkDayStartHour,
        WorkDayEndHour = s.WorkDayEndHour,
        DefaultMaxWeeklyHours = s.DefaultMaxWeeklyHours,
        DefaultMaintenanceThreshold = s.DefaultMaintenanceThreshold,
        WarningWearPercentage = s.WarningWearPercentage
    };
}
