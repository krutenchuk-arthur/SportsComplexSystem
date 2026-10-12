using Microsoft.EntityFrameworkCore;
using SportsComplexSystem.API.Data;
using SportsComplexSystem.API.DTOs.Locations;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Services;

public class LocationService : ILocationService
{
    private readonly AppDbContext _context;

    public LocationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<LocationDto>> GetAllAsync()
    {
        return await _context.Locations
            .Select(l => new LocationDto { Id = l.Id, Name = l.Name, Type = l.Type })
            .ToListAsync();
    }

    public async Task<LocationDto?> GetByIdAsync(int id)
    {
        var location = await _context.Locations.FindAsync(id);
        if (location == null) return null;

        return new LocationDto { Id = location.Id, Name = location.Name, Type = location.Type };
    }
}
