using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.DTOs.Trainers;

/// <summary>
/// DTO для створення/редагування тренера.
/// </summary>
public class TrainerCreateUpdateDto
{
    public string FullName { get; set; } = string.Empty;
    public SpecializationType Specialization { get; set; }
    public int MaxWeeklyHours { get; set; } = 40;
    public string? PhoneNumber { get; set; }
}
