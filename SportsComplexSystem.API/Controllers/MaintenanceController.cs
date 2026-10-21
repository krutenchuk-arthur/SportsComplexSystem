using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportsComplexSystem.API.DTOs.Maintenance;
using SportsComplexSystem.API.Models.Enums;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Controllers;

[ApiController]
[Authorize]
[Route("api/maintenance/tickets")]
public class MaintenanceController : ControllerBase
{
    private readonly IMaintenanceService _service;

    public MaintenanceController(IMaintenanceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<MaintenanceTicketDto>>> GetAll([FromQuery] TicketStatus? status = null)
    {
        return Ok(await _service.GetAllAsync(status));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MaintenanceTicketDto>> GetById(int id)
    {
        var ticket = await _service.GetByIdAsync(id);
        return ticket == null ? NotFound() : Ok(ticket);
    }

    /// <summary>
    /// Ручне створення заявки на ТО ("Повідомити про поломку"). Доступно всім ролям.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<MaintenanceTicketDto>> Create(CreateTicketDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return created == null
            ? NotFound(new { message = "Обладнання не знайдено." })
            : CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Technician")]
    public async Task<ActionResult<MaintenanceTicketDto>> UpdateStatus(int id, UpdateTicketStatusDto dto)
    {
        try
        {
            var updated = await _service.UpdateStatusAsync(id, dto.Status);
            return updated == null ? NotFound() : Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
