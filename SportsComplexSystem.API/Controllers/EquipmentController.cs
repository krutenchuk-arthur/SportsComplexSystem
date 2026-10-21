using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportsComplexSystem.API.DTOs.Equipment;
using SportsComplexSystem.API.Models.Enums;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Controllers;

[ApiController]
[Authorize]
[Route("api/equipment")]
public class EquipmentController : ControllerBase
{
    private readonly IEquipmentService _service;

    public EquipmentController(IEquipmentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<EquipmentDto>>> GetAll(
        [FromQuery] int? locationId = null,
        [FromQuery] EquipmentStatus? status = null)
    {
        return Ok(await _service.GetAllAsync(locationId, status));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EquipmentDto>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EquipmentDto>> Create(EquipmentCreateUpdateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EquipmentDto>> Update(int id, EquipmentCreateUpdateDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        return updated == null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{id}/usage")]
    [Authorize(Roles = "Admin,Technician")]
    public async Task<ActionResult<EquipmentDto>> AddUsageHours(int id, AddUsageHoursDto dto)
    {
        var updated = await _service.AddUsageHoursAsync(id, dto.Hours);
        return updated == null ? NotFound() : Ok(updated);
    }
}
