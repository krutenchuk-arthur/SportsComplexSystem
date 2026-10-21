using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportsComplexSystem.API.DTOs.Locations;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Controllers;

[ApiController]
[Authorize]
[Route("api/locations")]
public class LocationsController : ControllerBase
{
    private readonly ILocationService _service;

    public LocationsController(ILocationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<LocationDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LocationDto>> GetById(int id)
    {
        var location = await _service.GetByIdAsync(id);
        return location == null ? NotFound() : Ok(location);
    }
}
