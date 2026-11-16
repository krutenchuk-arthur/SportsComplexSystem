using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.DTOs.Locations;

public class LocationDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public LocationType Type { get; set; }

    /// <summary>
    /// Максимальна місткість зали (кількість місць).
    /// </summary>
    public int MaxCapacity { get; set; }
}
