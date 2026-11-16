using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.Models;

/// <summary>
/// Заявка на технічне обслуговування обладнання.
/// </summary>
public class MaintenanceTicket
{
    public int Id { get; set; }
    
    public int EquipmentId { get; set; }
    public Equipment Equipment { get; set; } = null!;
    
    public TicketStatus Status { get; set; } = TicketStatus.Open;
    
    public required string Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Вартість виконаного ремонту, грн (заповнюється при закритті заявки).
    /// </summary>
    public decimal? RepairCost { get; set; }
}
