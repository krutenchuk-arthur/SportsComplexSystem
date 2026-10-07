namespace SportsComplexSystem.API.DTOs.Trainers;

/// <summary>
/// Результат автопідбору вільного тренера.
/// </summary>
public class AutoAssignResultDto
{
    public TrainerDto? Trainer { get; set; }
    public bool Found { get; set; }
    public string? Message { get; set; }
}
