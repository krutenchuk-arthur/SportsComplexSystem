using Microsoft.EntityFrameworkCore;
using SportsComplexSystem.API.Data;
using SportsComplexSystem.API.DTOs.Equipment;
using SportsComplexSystem.API.Models;
using SportsComplexSystem.API.Models.Enums;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Services;

public class EquipmentService : IEquipmentService
{
    private readonly AppDbContext _context;
    private readonly ISettingsService _settings;

    public EquipmentService(AppDbContext context, ISettingsService settings)
    {
        _context = context;
        _settings = settings;
    }

    public async Task<List<EquipmentDto>> GetAllAsync(int? locationId = null, EquipmentStatus? status = null)
    {
        var query = _context.Equipment.Include(e => e.Location).AsQueryable();

        if (locationId.HasValue)
            query = query.Where(e => e.LocationId == locationId.Value);

        if (status.HasValue)
            query = query.Where(e => e.Status == status.Value);

        var items = await query.ToListAsync();
        return items.Select(MapToDto).ToList();
    }

    public async Task<EquipmentDto?> GetByIdAsync(int id)
    {
        var item = await _context.Equipment.Include(e => e.Location).FirstOrDefaultAsync(e => e.Id == id);
        return item == null ? null : MapToDto(item);
    }

    public async Task<EquipmentDto> CreateAsync(EquipmentCreateUpdateDto dto)
    {
        // 0 = «взяти базовий поріг ТО із налаштувань комплексу»
        var thresholdHours = dto.MaintenanceThresholdHours > 0
            ? dto.MaintenanceThresholdHours
            : (await _settings.GetAsync()).DefaultMaintenanceThreshold;

        var equipment = new Equipment
        {
            InventoryNumber = dto.InventoryNumber,
            Name = dto.Name,
            LocationId = dto.LocationId,
            CurrentUsageHours = dto.CurrentUsageHours,
            MaintenanceThresholdHours = thresholdHours,
            Status = EquipmentStatus.Operational
        };

        _context.Equipment.Add(equipment);
        await _context.SaveChangesAsync();

        await _context.Entry(equipment).Reference(e => e.Location).LoadAsync();
        return MapToDto(equipment);
    }

    public async Task<EquipmentDto?> UpdateAsync(int id, EquipmentCreateUpdateDto dto)
    {
        var equipment = await _context.Equipment.Include(e => e.Location).FirstOrDefaultAsync(e => e.Id == id);
        if (equipment == null) return null;

        equipment.InventoryNumber = dto.InventoryNumber;
        equipment.Name = dto.Name;
        equipment.LocationId = dto.LocationId;
        equipment.CurrentUsageHours = dto.CurrentUsageHours;
        equipment.MaintenanceThresholdHours = dto.MaintenanceThresholdHours > 0
            ? dto.MaintenanceThresholdHours
            : equipment.MaintenanceThresholdHours;

        await _context.SaveChangesAsync();
        await _context.Entry(equipment).Reference(e => e.Location).LoadAsync();
        return MapToDto(equipment);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var equipment = await _context.Equipment.FindAsync(id);
        if (equipment == null) return false;

        _context.Equipment.Remove(equipment);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<EquipmentDto?> AddUsageHoursAsync(int id, double hours)
    {
        var equipment = await _context.Equipment.Include(e => e.Location).FirstOrDefaultAsync(e => e.Id == id);
        if (equipment == null) return null;

        equipment.CurrentUsageHours += hours;

        if (equipment.CurrentUsageHours >= equipment.MaintenanceThresholdHours &&
            equipment.Status == EquipmentStatus.Operational)
        {
            equipment.Status = EquipmentStatus.MaintenanceRequired;

            _context.MaintenanceTickets.Add(new MaintenanceTicket
            {
                EquipmentId = equipment.Id,
                Status = TicketStatus.Open,
                Description = $"Перевищено ліміт напрацювання {equipment.MaintenanceThresholdHours:0.#} год " +
                               $"(поточне напрацювання: {equipment.CurrentUsageHours:0.#} год).",
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        return MapToDto(equipment);
    }

    private static EquipmentDto MapToDto(Equipment e)
    {
        var wear = e.MaintenanceThresholdHours > 0
            ? (e.CurrentUsageHours / e.MaintenanceThresholdHours) * 100
            : 0;

        return new EquipmentDto
        {
            Id = e.Id,
            InventoryNumber = e.InventoryNumber,
            Name = e.Name,
            LocationId = e.LocationId,
            LocationName = e.Location?.Name ?? string.Empty,
            CurrentUsageHours = e.CurrentUsageHours,
            MaintenanceThresholdHours = e.MaintenanceThresholdHours,
            Status = e.Status,
            WearPercentage = wear
        };
    }
}
