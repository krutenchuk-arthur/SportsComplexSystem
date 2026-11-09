using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportsComplexSystem.API.DTOs.Settings;
using SportsComplexSystem.API.Services;

namespace SportsComplexSystem.API.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _service;

    public SettingsController(ISettingsService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<SettingsDto>> Get() => Ok(await _service.GetAsync());

    [HttpPut]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SettingsDto>> Update(SettingsDto dto) => Ok(await _service.UpdateAsync(dto));
}
