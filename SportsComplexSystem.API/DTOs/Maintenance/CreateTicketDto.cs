using System.ComponentModel.DataAnnotations;

namespace SportsComplexSystem.API.DTOs.Maintenance;

public class CreateTicketDto
{
    [Range(1, int.MaxValue)]
    public int EquipmentId { get; set; }

    [Required, StringLength(1000, MinimumLength = 5, ErrorMessage = "Опишіть несправність (від 5 символів).")]
    public string Description { get; set; } = string.Empty;
}
