using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.DTOs.Maintenance;

public class MaintenanceTicketDto
{
    public int Id { get; set; }
    public int EquipmentId { get; set; }
    public string EquipmentInventoryNumber { get; set; } = string.Empty;
    public string EquipmentName { get; set; } = string.Empty;
    public TicketStatus Status { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Вартість ремонту, грн (заповнюється при закритті заявки).
    /// </summary>
    public decimal? RepairCost { get; set; }
}
