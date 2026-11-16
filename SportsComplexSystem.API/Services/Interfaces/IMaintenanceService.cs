using SportsComplexSystem.API.DTOs.Maintenance;
using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.Services.Interfaces;

public interface IMaintenanceService
{
    Task<List<MaintenanceTicketDto>> GetAllAsync(TicketStatus? status = null);
    Task<MaintenanceTicketDto?> GetByIdAsync(int id);

    /// <summary>
    /// Створює заявку на ТО вручну (наприклад, тренер повідомляє про поломку).
    /// Обладнання в робочому стані переходить у MaintenanceRequired.
    /// </summary>
    Task<MaintenanceTicketDto?> CreateAsync(CreateTicketDto dto);

    /// <summary>
    /// Оновлює статус заявки з дозволеними переходами Open -> InProgress -> Completed.
    /// При InProgress обладнання переходить у UnderRepair.
    /// При Completed - лічильник годин скидається на 0, обладнання повертається в Operational.
    /// </summary>
    Task<MaintenanceTicketDto?> UpdateStatusAsync(int id, TicketStatus newStatus, decimal? repairCost = null);
}
