namespace SportsComplexSystem.API.DTOs.Schedule;

public class ScheduleSlotDto
{
    public int Id { get; set; }
    public int TrainerId { get; set; }
    public string TrainerName { get; set; } = string.Empty;
    public int LocationId { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Кількість записаних учасників.
    /// </summary>
    public int BookedCount { get; set; }

    /// <summary>
    /// Максимальна місткість локації (для відображення «записані / місткість»).
    /// </summary>
    public int LocationMaxCapacity { get; set; }

    public List<int> EquipmentIds { get; set; } = new();
    public List<string> EquipmentNames { get; set; } = new();
}
