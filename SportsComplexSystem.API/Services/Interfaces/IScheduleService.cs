using SportsComplexSystem.API.DTOs.Schedule;

namespace SportsComplexSystem.API.Services.Interfaces;

public interface IScheduleService
{
    Task<List<ScheduleSlotDto>> GetAllAsync(DateTime? from = null, DateTime? to = null, int? locationId = null, int? trainerId = null);
    Task<ScheduleSlotDto?> GetByIdAsync(int id);

    /// <summary>
    /// Dry-run перевірка 4 правил без збереження (для live-валідації в модалці).
    /// </summary>
    Task<ScheduleValidationResultDto> ValidateAsync(ScheduleSlotCreateUpdateDto dto, int? excludeSlotId = null);

    /// <summary>
    /// Створює слот розкладу. Кидає ScheduleConflictException, якщо є конфлікти.
    /// Автоматично нараховує години напрацювання обраному інвентарю.
    /// </summary>
    Task<ScheduleSlotDto> CreateAsync(ScheduleSlotCreateUpdateDto dto);

    Task<ScheduleSlotDto?> UpdateAsync(int id, ScheduleSlotCreateUpdateDto dto);
    Task<bool> DeleteAsync(int id);
}
