using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.DTOs.Maintenance;

public class UpdateTicketStatusDto
{
    public TicketStatus Status { get; set; }
}
