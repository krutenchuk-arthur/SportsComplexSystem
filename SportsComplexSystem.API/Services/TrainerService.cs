using Microsoft.EntityFrameworkCore;
using SportsComplexSystem.API.Data;
using SportsComplexSystem.API.DTOs.Trainers;
using SportsComplexSystem.API.Models;
using SportsComplexSystem.API.Models.Enums;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Services;

public class TrainerService : ITrainerService
{
    private readonly AppDbContext _context;
    private readonly ISettingsService _settings;

    public TrainerService(AppDbContext context, ISettingsService settings)
    {
        _context = context;
        _settings = settings;
    }

    public async Task<List<TrainerDto>> GetAllWithWorkloadAsync()
    {
        var trainers = await _context.Trainers.ToListAsync();
        var now = DateTime.UtcNow;

        var dtos = new List<TrainerDto>();
        foreach (var trainer in trainers)
        {
            var assignedHours = await GetAssignedHoursForWeekAsync(trainer.Id, now);
            dtos.Add(MapToDto(trainer, assignedHours));
        }

        return dtos;
    }

    public async Task<TrainerDto?> GetByIdAsync(int id)
    {
        var trainer = await _context.Trainers.FindAsync(id);
        if (trainer == null) return null;

        var assignedHours = await GetAssignedHoursForWeekAsync(id, DateTime.UtcNow);
        return MapToDto(trainer, assignedHours);
    }

    public async Task<TrainerDto> CreateAsync(TrainerCreateUpdateDto dto)
    {
        // 0 = «взяти базовий ліміт із налаштувань комплексу»
        var maxWeeklyHours = dto.MaxWeeklyHours > 0
            ? dto.MaxWeeklyHours
            : (await _settings.GetAsync()).DefaultMaxWeeklyHours;

        var trainer = new Trainer
        {
            FullName = dto.FullName,
            Specialization = dto.Specialization,
            MaxWeeklyHours = maxWeeklyHours,
            PhoneNumber = dto.PhoneNumber,
            HourlyRate = dto.HourlyRate > 0 ? dto.HourlyRate : 450m
        };

        _context.Trainers.Add(trainer);
        await _context.SaveChangesAsync();

        return MapToDto(trainer, 0);
    }

    public async Task<TrainerDto?> UpdateAsync(int id, TrainerCreateUpdateDto dto)
    {
        var trainer = await _context.Trainers.FindAsync(id);
        if (trainer == null) return null;

        trainer.FullName = dto.FullName;
        trainer.Specialization = dto.Specialization;
        trainer.MaxWeeklyHours = dto.MaxWeeklyHours > 0 ? dto.MaxWeeklyHours : trainer.MaxWeeklyHours;
        trainer.PhoneNumber = dto.PhoneNumber;
        if (dto.HourlyRate > 0) trainer.HourlyRate = dto.HourlyRate;

        await _context.SaveChangesAsync();

        var assignedHours = await GetAssignedHoursForWeekAsync(id, DateTime.UtcNow);
        return MapToDto(trainer, assignedHours);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var trainer = await _context.Trainers.FindAsync(id);
        if (trainer == null) return false;

        _context.Trainers.Remove(trainer);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<AutoAssignResultDto> FindAvailableTrainerAsync(
        SpecializationType specialization,
        DateTime startTime,
        DateTime endTime,
        int? excludeSlotId = null)
    {
        var duration = (endTime - startTime).TotalHours;

        var candidateIds = await _context.Trainers
            .Where(t => t.Specialization == specialization)
            .Select(t => t.Id)
            .ToListAsync();

        if (!candidateIds.Any())
        {
            return new AutoAssignResultDto
            {
                Found = false,
                Message = $"Немає тренерів зі спеціалізацією «{specialization}»."
            };
        }

        var busyTrainerIds = await _context.ScheduleSlots
            .Where(s => (excludeSlotId == null || s.Id != excludeSlotId) &&
                        s.StartTime < endTime && s.EndTime > startTime)
            .Select(s => s.TrainerId)
            .Distinct()
            .ToListAsync();

        var availableIds = candidateIds.Except(busyTrainerIds).ToList();

        if (!availableIds.Any())
        {
            return new AutoAssignResultDto
            {
                Found = false,
                Message = $"Усі тренери зі спеціалізацією «{specialization}» зайняті в цей час."
            };
        }

        var candidates = new List<(Trainer trainer, double assignedHours)>();

        foreach (var tid in availableIds)
        {
            var trainer = await _context.Trainers.FindAsync(tid);
            if (trainer == null) continue;

            var assignedHours = await GetAssignedHoursForWeekAsync(tid, startTime, excludeSlotId);

            if (assignedHours + duration <= trainer.MaxWeeklyHours)
            {
                candidates.Add((trainer, assignedHours));
            }
        }

        if (!candidates.Any())
        {
            return new AutoAssignResultDto
            {
                Found = false,
                Message = $"Жоден тренер зі спеціалізацією «{specialization}» не має достатньо вільних годин на цьому тижні."
            };
        }

        var best = candidates.OrderBy(c => c.assignedHours).First();

        return new AutoAssignResultDto
        {
            Found = true,
            Trainer = MapToDto(best.trainer, best.assignedHours),
            Message = "Знайдено вільного тренера."
        };
    }

    public async Task<double> GetAssignedHoursForWeekAsync(int trainerId, DateTime referenceDate, int? excludeSlotId = null)
    {
        // Тиждень: понеділок-неділя
        int diff = (7 + (referenceDate.DayOfWeek - DayOfWeek.Monday) % 7) % 7;
        var startOfWeek = referenceDate.Date.AddDays(-1 * diff);
        var endOfWeek = startOfWeek.AddDays(7);

        var slots = await _context.ScheduleSlots
            .Where(s => s.TrainerId == trainerId &&
                        (excludeSlotId == null || s.Id != excludeSlotId) &&
                        s.StartTime >= startOfWeek && s.StartTime < endOfWeek)
            .ToListAsync();

        return slots.Sum(s => (s.EndTime - s.StartTime).TotalHours);
    }

    private TrainerDto MapToDto(Trainer trainer, double assignedHours)
    {
        var loadPercentage = trainer.MaxWeeklyHours > 0
            ? (assignedHours / trainer.MaxWeeklyHours) * 100
            : 0;

        LoadStatus loadStatus;
        if (loadPercentage < 75)
            loadStatus = LoadStatus.Optimal;
        else if (loadPercentage < 100)
            loadStatus = LoadStatus.Warning;
        else
            loadStatus = LoadStatus.Critical;

        return new TrainerDto
        {
            Id = trainer.Id,
            FullName = trainer.FullName,
            Specialization = trainer.Specialization,
            MaxWeeklyHours = trainer.MaxWeeklyHours,
            PhoneNumber = trainer.PhoneNumber,
            HourlyRate = trainer.HourlyRate,
            AssignedHours = assignedHours,
            LoadPercentage = loadPercentage,
            LoadStatus = loadStatus
        };
    }
}

