using SportsComplexSystem.API.DTOs.Locations;

namespace SportsComplexSystem.API.Services.Interfaces;

public interface ILocationService
{
    Task<List<LocationDto>> GetAllAsync();
    Task<LocationDto?> GetByIdAsync(int id);
}
