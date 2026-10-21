using Microsoft.EntityFrameworkCore;
using SportsComplexSystem.API.Data;
using SportsComplexSystem.API.DTOs.Schedule;
using SportsComplexSystem.API.Models;
using SportsComplexSystem.API.Models.Enums;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Services;

public class ScheduleService : IScheduleService
{
    private readonly AppDbContext _context;
    private readonly ITrainerService _trainerService;
    private readonly ISettingsService _settings;

    public ScheduleService(AppDbContext context, ITrainerService trainerService, ISettingsService settings)
    {
        _context = context;
        _trainerService = trainerService;
        _settings = settings;
    }

    public async Task<List<ScheduleSlotDto>> GetAllAsync(DateTime? from = null, DateTime? to = null, int? locationId = null, int? trainerId = null)
    {
        var query = _context.ScheduleSlots
            .Include(s => s.Trainer)
            .Include(s => s.Location)
            .Include(s => s.Equipment)
            .AsQueryable();

        if (from.HasValue)
            query = query.Where(s => s.EndTime >= from.Value);
        if (to.HasValue)
            query = query.Where(s => s.StartTime <= to.Value);
        if (locationId.HasValue)
            query = query.Where(s => s.LocationId == locationId.Value);
        if (trainerId.HasValue)
            query = query.Where(s => s.TrainerId == trainerId.Value);

        var items = await query.OrderBy(s => s.StartTime).ToListAsync();
        return items.Select(MapToDto).ToList();
    }

    public async Task<ScheduleSlotDto?> GetByIdAsync(int id)
    {
        var slot = await _context.ScheduleSlots
            .Include(s => s.Trainer)
            .Include(s => s.Location)
            .Include(s => s.Equipment)
            .FirstOrDefaultAsync(s => s.Id == id);

        return slot == null ? null : MapToDto(slot);
    }

    private static ScheduleSlotDto MapToDto(ScheduleSlot s)
    {
        return new ScheduleSlotDto
        {
            Id = s.Id,
            TrainerId = s.TrainerId,
            TrainerName = s.Trainer?.FullName ?? string.Empty,
            LocationId = s.LocationId,
            LocationName = s.Location?.Name ?? string.Empty,
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            Title = s.Title,
            EquipmentIds = s.Equipment.Select(e => e.Id).ToList(),
            EquipmentNames = s.Equipment.Select(e => e.Name).ToList()
        };
    }

    public async Task<ScheduleValidationResultDto> ValidateAsync(ScheduleSlotCreateUpdateDto dto, int? excludeSlotId = null)
    {
        var result = new ScheduleValidationResultDto { IsValid = true };

        // Правило 0: коректність інтервалу та робочі години комплексу (SystemSettings)
        if (dto.EndTime <= dto.StartTime)
        {
            result.IsValid = false;
            result.Conflicts.Add(new ConflictDto
            {
                Type = ConflictType.InvalidTimeRange,
                Message = "Час завершення заняття має бути пізніше за час початку."
            });
        }
        else
        {
            var settings = await _settings.GetAsync();
            var opensAt = TimeSpan.FromHours(settings.WorkDayStartHour);
            var closesAt = TimeSpan.FromHours(settings.WorkDayEndHour);

            if (dto.StartTime.Date != dto.EndTime.Date ||
                dto.StartTime.TimeOfDay < opensAt ||
                dto.EndTime.TimeOfDay > closesAt)
            {
                result.IsValid = false;
                result.Conflicts.Add(new ConflictDto
                {
                    Type = ConflictType.OutsideWorkingHours,
                    Message = $"Заняття виходить за робочі години комплексу " +
                              $"({settings.WorkDayStartHour:00}:00–{settings.WorkDayEndHour:00}:00)."
                });
            }
        }

        // Правило 1: Локація зайнята
        var locationBusy = await _context.ScheduleSlots
            .AnyAsync(s => (excludeSlotId == null || s.Id != excludeSlotId) &&
                          s.LocationId == dto.LocationId &&
                          s.StartTime < dto.EndTime && s.EndTime > dto.StartTime);

        if (locationBusy)
        {
            result.IsValid = false;
            result.Conflicts.Add(new ConflictDto
            {
                Type = ConflictType.LocationBusy,
                Message = "Локація зайнята в цей час іншим заняттям."
            });
        }

        // Правило 2: Тренер зайнятий
        var trainerBusy = await _context.ScheduleSlots
            .AnyAsync(s => (excludeSlotId == null || s.Id != excludeSlotId) &&
                          s.TrainerId == dto.TrainerId &&
                          s.StartTime < dto.EndTime && s.EndTime > dto.StartTime);

        if (trainerBusy)
        {
            result.IsValid = false;
            result.Conflicts.Add(new ConflictDto
            {
                Type = ConflictType.TrainerBusy,
                Message = "Тренер зайнятий в цей час іншим заняттям."
            });
        }

        // Правило 3: Перевищення MaxWeeklyHours
        var trainer = await _context.Trainers.FindAsync(dto.TrainerId);
        if (trainer != null)
        {
            var assignedHours = await _trainerService.GetAssignedHoursForWeekAsync(dto.TrainerId, dto.StartTime, excludeSlotId);
            var duration = (dto.EndTime - dto.StartTime).TotalHours;

            if (assignedHours + duration > trainer.MaxWeeklyHours)
            {
                result.IsValid = false;
                result.Conflicts.Add(new ConflictDto
                {
                    Type = ConflictType.WeeklyHoursExceeded,
                    Message = $"Тренер перевищить ліміт годин на тиждень ({assignedHours + duration:0.#}/{trainer.MaxWeeklyHours} год)."
                });
            }
        }

        // Правило 4: Інвентар не Operational
        if (dto.EquipmentIds.Any())
        {
            var equipment = await _context.Equipment
                .Where(e => dto.EquipmentIds.Contains(e.Id))
                .ToListAsync();

            var notOperational = equipment.Where(e => e.Status != EquipmentStatus.Operational).ToList();
            if (notOperational.Any())
            {
                result.IsValid = false;
                foreach (var eq in notOperational)
                {
                    result.Conflicts.Add(new ConflictDto
                    {
                        Type = ConflictType.EquipmentNotOperational,
                        Message = $"Інвентар {eq.Name} #{eq.InventoryNumber} має статус «{eq.Status}» і недоступний."
                    });
                }
            }
        }

        // Якщо конфлікт тренера (правило 2 або 3), підказати альтернативного
        if (result.Conflicts.Any(c => c.Type == ConflictType.TrainerBusy || c.Type == ConflictType.WeeklyHoursExceeded))
        {
            var suggestion = await _trainerService.FindAvailableTrainerAsync(
                trainer!.Specialization, dto.StartTime, dto.EndTime, excludeSlotId);

            if (suggestion.Found)
            {
                result.SuggestedTrainer = suggestion.Trainer;
            }
        }

        return result;
    }

    public async Task<ScheduleSlotDto> CreateAsync(ScheduleSlotCreateUpdateDto dto)
    {
        var validation = await ValidateAsync(dto);
        if (!validation.IsValid)
        {
            throw new ScheduleConflictException(validation);
        }

        var slot = new ScheduleSlot
        {
            TrainerId = dto.TrainerId,
            LocationId = dto.LocationId,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Title = dto.Title
        };

        if (dto.EquipmentIds.Any())
        {
            var equipment = await _context.Equipment
                .Where(e => dto.EquipmentIds.Contains(e.Id))
                .ToListAsync();
            foreach (var eq in equipment)
                slot.Equipment.Add(eq);
        }

        _context.ScheduleSlots.Add(slot);
        await _context.SaveChangesAsync();

        // Автоматичне нарахування годин напрацювання обраному інвентарю
        await ApplyUsageHoursToEquipmentAsync(dto.EquipmentIds, dto.StartTime, dto.EndTime);

        await _context.Entry(slot).Reference(s => s.Trainer).LoadAsync();
        await _context.Entry(slot).Reference(s => s.Location).LoadAsync();
        await _context.Entry(slot).Collection(s => s.Equipment).LoadAsync();

        return MapToDto(slot);
    }

    public async Task<ScheduleSlotDto?> UpdateAsync(int id, ScheduleSlotCreateUpdateDto dto)
    {
        var slot = await _context.ScheduleSlots
            .Include(s => s.Equipment)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (slot == null) return null;

        var validation = await ValidateAsync(dto, excludeSlotId: id);
        if (!validation.IsValid)
        {
            throw new ScheduleConflictException(validation);
        }

        slot.TrainerId = dto.TrainerId;
        slot.LocationId = dto.LocationId;
        slot.StartTime = dto.StartTime;
        slot.EndTime = dto.EndTime;
        slot.Title = dto.Title;

        slot.Equipment.Clear();
        if (dto.EquipmentIds.Any())
        {
            var equipment = await _context.Equipment
                .Where(e => dto.EquipmentIds.Contains(e.Id))
                .ToListAsync();
            foreach (var eq in equipment)
                slot.Equipment.Add(eq);
        }

        await _context.SaveChangesAsync();

        await _context.Entry(slot).Reference(s => s.Trainer).LoadAsync();
        await _context.Entry(slot).Reference(s => s.Location).LoadAsync();

        return MapToDto(slot);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var slot = await _context.ScheduleSlots.FindAsync(id);
        if (slot == null) return false;

        _context.ScheduleSlots.Remove(slot);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Нараховує обраному інвентарю години напрацювання, що дорівнюють тривалості заняття.
    /// Якщо поріг ТО перевищено - переводить у MaintenanceRequired та створює MaintenanceTicket.
    /// </summary>
    private async Task ApplyUsageHoursToEquipmentAsync(List<int> equipmentIds, DateTime startTime, DateTime endTime)
    {
        if (!equipmentIds.Any()) return;

        var durationHours = (endTime - startTime).TotalHours;

        var equipment = await _context.Equipment
            .Where(e => equipmentIds.Contains(e.Id))
            .ToListAsync();

        foreach (var eq in equipment)
        {
            eq.CurrentUsageHours += durationHours;

            if (eq.CurrentUsageHours >= eq.MaintenanceThresholdHours &&
                eq.Status == EquipmentStatus.Operational)
            {
                eq.Status = EquipmentStatus.MaintenanceRequired;

                _context.MaintenanceTickets.Add(new MaintenanceTicket
                {
                    EquipmentId = eq.Id,
                    Status = TicketStatus.Open,
                    Description = $"Перевищено ліміт напрацювання {eq.MaintenanceThresholdHours:0.#} год " +
                                   $"(поточне напрацювання: {eq.CurrentUsageHours:0.#} год).",
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();
    }
}
