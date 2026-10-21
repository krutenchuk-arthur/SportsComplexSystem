using SportsComplexSystem.API.DTOs.Equipment;
using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.Services.Interfaces;

public interface IEquipmentService
{
    Task<List<EquipmentDto>> GetAllAsync(int? locationId = null, EquipmentStatus? status = null);
    Task<EquipmentDto?> GetByIdAsync(int id);
    Task<EquipmentDto> CreateAsync(EquipmentCreateUpdateDto dto);
    Task<EquipmentDto?> UpdateAsync(int id, EquipmentCreateUpdateDto dto);
    Task<bool> DeleteAsync(int id);

    /// <summary>
    /// Додає години напрацювання. Якщо поріг перевищено - переводить у MaintenanceRequired
    /// та створює MaintenanceTicket.
    /// </summary>
    Task<EquipmentDto?> AddUsageHoursAsync(int id, double hours);
}
