using SportsComplexSystem.API.DTOs.Trainers;
using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.Services.Interfaces;

public interface ITrainerService
{
    Task<List<TrainerDto>> GetAllWithWorkloadAsync();
    Task<TrainerDto?> GetByIdAsync(int id);
    Task<TrainerDto> CreateAsync(TrainerCreateUpdateDto dto);
    Task<TrainerDto?> UpdateAsync(int id, TrainerCreateUpdateDto dto);
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Знаходить найменш завантаженого вільного тренера потрібної спеціалізації
    /// для заданого інтервалу часу (без колізій у розкладі, без перевищення лімітів).
    /// </summary>
    Task<AutoAssignResultDto> FindAvailableTrainerAsync(
        SpecializationType specialization,
        DateTime startTime,
        DateTime endTime,
        int? excludeSlotId = null);

    /// <summary>
    /// Обчислює фактично призначені години тренера за тиждень, що містить referenceDate.
    /// </summary>
    Task<double> GetAssignedHoursForWeekAsync(int trainerId, DateTime referenceDate, int? excludeSlotId = null);
}
