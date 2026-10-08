namespace SportsComplexSystem.API.DTOs.Schedule;

public class ScheduleSlotCreateUpdateDto
{
    public int TrainerId { get; set; }
    public int LocationId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Title { get; set; } = string.Empty;
    public List<int> EquipmentIds { get; set; } = new();
}
