namespace SportsComplexSystem.API.Models;

/// <summary>
/// Слот розкладу (заняття/тренування).
/// </summary>
public class ScheduleSlot
{
    public int Id { get; set; }
    
    public int TrainerId { get; set; }
    public Trainer Trainer { get; set; } = null!;
    
    public int LocationId { get; set; }
    public Location Location { get; set; } = null!;
    
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    
    public required string Title { get; set; }

    /// <summary>
    /// Кількість записаних учасників (не може перевищувати Location.MaxCapacity).
    /// </summary>
    public int BookedCount { get; set; } = 0;
    
    // Many-to-many з Equipment (implicit join table в EF Core 8)
    public ICollection<Equipment> Equipment { get; set; } = new List<Equipment>();
}
