namespace SportsComplexSystem.API.DTOs.Schedule;

public class ScheduleSlotCreateUpdateDto
{
    public int TrainerId { get; set; }
    public int LocationId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Кількість записаних учасників (0 ≤ BookedCount ≤ Location.MaxCapacity).
    /// </summary>
    public int BookedCount { get; set; }

    public List<int> EquipmentIds { get; set; } = new();
}
