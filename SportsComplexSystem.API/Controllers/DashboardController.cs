using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportsComplexSystem.API.DTOs.Dashboard;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service)
    {
        _service = service;
    }

    [HttpGet("kpi")]
    public async Task<ActionResult<DashboardKpiDto>> GetKpi()
    {
        return Ok(await _service.GetKpiAsync());
    }

    [HttpGet("alerts")]
    public async Task<ActionResult<List<AlertDto>>> GetAlerts([FromQuery] int limit = 10)
    {
        return Ok(await _service.GetAlertsAsync(limit));
    }
}
