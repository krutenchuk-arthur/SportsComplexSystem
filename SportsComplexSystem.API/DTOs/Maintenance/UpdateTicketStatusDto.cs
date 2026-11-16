using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.DTOs.Maintenance;

public class UpdateTicketStatusDto
{
    public TicketStatus Status { get; set; }

    /// <summary>
    /// Вартість ремонту, грн. Передається при закритті заявки або редагуванні вже закритої.
    /// </summary>
    public decimal? RepairCost { get; set; }
}
