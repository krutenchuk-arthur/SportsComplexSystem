using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SportsComplexSystem.API.Data;
using SportsComplexSystem.API.DTOs.Maintenance;
using SportsComplexSystem.API.Hubs;
using SportsComplexSystem.API.Models;
using SportsComplexSystem.API.Models.Enums;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Services;

public class MaintenanceService : IMaintenanceService
{
    private readonly AppDbContext _context;
    private readonly IAuditService _audit;
    private readonly IHubContext<ComplexHub> _hub;

    public MaintenanceService(AppDbContext context, IAuditService audit, IHubContext<ComplexHub> hub)
    {
        _context = context;
        _audit = audit;
        _hub = hub;
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

        await _audit.RecordAsync("Створення заявки ТО", "MaintenanceTicket",
            $"#{ticket.Id} · {equipment.InventoryNumber} {equipment.Name}: {ticket.Description}");

        return MapToDto(ticket);
    }

    public async Task<MaintenanceTicketDto?> UpdateStatusAsync(int id, TicketStatus newStatus, decimal? repairCost = null)
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

        // Дозволяємо редагувати вартість уже закритої заявки без зміни статусу
        var isCostOnlyEdit = ticket.Status == newStatus && repairCost.HasValue;

        if (!allowed && !isCostOnlyEdit)
        {
            throw new InvalidOperationException(
                $"Неможливий перехід статусу заявки з «{ticket.Status}» у «{newStatus}».");
        }

        if (repairCost.HasValue)
        {
            if (repairCost.Value < 0)
                throw new InvalidOperationException("Вартість ремонту не може бути від'ємною.");

            ticket.RepairCost = repairCost.Value;
        }

        if (!isCostOnlyEdit)
        {
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
        }

        await _context.SaveChangesAsync();

        // Реальний час: дошка ремонтів та інвентар оновлюються без перезавантаження
        await _hub.Clients.All.SendAsync(AuditService.DataChangedEvent, "MaintenanceTicket");

        if (isCostOnlyEdit)
        {
            await _audit.RecordAsync("Оновлення вартості ремонту", "MaintenanceTicket",
                $"#{ticket.Id} · {ticket.Equipment.InventoryNumber}: {ticket.RepairCost:0.##} грн");
        }
        else if (newStatus == TicketStatus.Completed)
        {
            var cost = ticket.RepairCost.HasValue ? $"{ticket.RepairCost.Value:0.##} грн" : "вартість не вказана";
            await _audit.RecordAsync("Закриття заявки ТО", "MaintenanceTicket",
                $"#{ticket.Id} · {ticket.Equipment.InventoryNumber} {ticket.Equipment.Name}: ремонт завершено ({cost})");
        }

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
            CompletedAt = t.CompletedAt,
            RepairCost = t.RepairCost
        };
    }
}
