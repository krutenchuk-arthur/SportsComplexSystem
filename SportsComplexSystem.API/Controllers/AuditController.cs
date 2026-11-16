using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportsComplexSystem.API.DTOs.Audit;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Controllers;

[ApiController]
[Route("api/audit")]
[Authorize(Roles = "Admin")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _audit;

    public AuditController(IAuditService audit)
    {
        _audit = audit;
    }

    /// <summary>
    /// Останні події журналу аудиту (тільки для адміністратора).
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<AuditLogDto>>> GetRecent([FromQuery] int limit = 25)
    {
        return Ok(await _audit.GetRecentAsync(limit));
    }
}
