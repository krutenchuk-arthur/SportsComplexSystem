using Microsoft.EntityFrameworkCore;
using SportsComplexSystem.API.Data;
using SportsComplexSystem.API.DTOs.Maintenance;
using SportsComplexSystem.API.Models;
using SportsComplexSystem.API.Models.Enums;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Services;

public class MaintenanceService : IMaintenanceService
{
    private readonly AppDbContext _context;

    public MaintenanceService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<MaintenanceTicketDto>> GetAllAsync(TicketStatus? status = null)
    {
        var query = _context.MaintenanceTickets.Include(t => t.Equipment).AsQueryable();

        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        var items = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
        return items.Select(MapToDto).ToList();
    }

    public async Task<MaintenanceTicketDto?> GetByIdAsync(int id)
    {
        var ticket = await _context.MaintenanceTickets.Include(t => t.Equipment).FirstOrDefaultAsync(t => t.Id == id);
        return ticket == null ? null : MapToDto(ticket);
    }

    public async Task<MaintenanceTicketDto?> CreateAsync(CreateTicketDto dto)
    {
        var equipment = await _context.Equipment.FindAsync(dto.EquipmentId);
        if (equipment == null) return null;

        var ticket = new MaintenanceTicket
        {
            EquipmentId = equipment.Id,
            Equipment = equipment,
            Description = dto.Description.Trim(),
            Status = TicketStatus.Open,
            CreatedAt = DateTime.UtcNow
        };
        if (equipment.Status == EquipmentStatus.Operational)
            equipment.Status = EquipmentStatus.MaintenanceRequired;

        _context.MaintenanceTickets.Add(ticket);
        await _context.SaveChangesAsync();
        return MapToDto(ticket);
    }

    public async Task<MaintenanceTicketDto?> UpdateStatusAsync(int id, TicketStatus newStatus)
    {
        var ticket = await _context.MaintenanceTickets.Include(t => t.Equipment).FirstOrDefaultAsync(t => t.Id == id);
        if (ticket == null) return null;

        // Дозволені переходи лише вперед: Open -> InProgress -> Completed
        var allowed = ticket.Status switch
        {
            TicketStatus.Open => newStatus == TicketStatus.InProgress,
            TicketStatus.InProgress => newStatus == TicketStatus.Completed,
            _ => false
        };

        if (!allowed)
        {
            throw new InvalidOperationException(
                $"Неможливий перехід статусу заявки з «{ticket.Status}» у «{newStatus}».");
        }

        ticket.Status = newStatus;

        if (newStatus == TicketStatus.InProgress)
        {
            ticket.Equipment.Status = EquipmentStatus.UnderRepair;
        }
        else if (newStatus == TicketStatus.Completed)
        {
            ticket.CompletedAt = DateTime.UtcNow;
            ticket.Equipment.CurrentUsageHours = 0;
            ticket.Equipment.Status = EquipmentStatus.Operational;
        }

        await _context.SaveChangesAsync();
        return MapToDto(ticket);
    }

    private static MaintenanceTicketDto MapToDto(MaintenanceTicket t)
    {
        return new MaintenanceTicketDto
        {
            Id = t.Id,
            EquipmentId = t.EquipmentId,
            EquipmentInventoryNumber = t.Equipment?.InventoryNumber ?? string.Empty,
            EquipmentName = t.Equipment?.Name ?? string.Empty,
            Status = t.Status,
            Description = t.Description,
            CreatedAt = t.CreatedAt,
            CompletedAt = t.CompletedAt
        };
    }
}
