using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportsComplexSystem.API.DTOs.Trainers;
using SportsComplexSystem.API.Models.Enums;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Controllers;

[ApiController]
[Authorize]
[Route("api/trainers")]
public class TrainersController : ControllerBase
{
    private readonly ITrainerService _service;

    public TrainersController(ITrainerService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<TrainerDto>>> GetAll()
    {
        return Ok(await _service.GetAllWithWorkloadAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TrainerDto>> GetById(int id)
    {
        var trainer = await _service.GetByIdAsync(id);
        return trainer == null ? NotFound() : Ok(trainer);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TrainerDto>> Create(TrainerCreateUpdateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TrainerDto>> Update(int id, TrainerCreateUpdateDto dto)
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

    [HttpGet("auto-assign")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AutoAssignResultDto>> AutoAssign(
        [FromQuery] SpecializationType specialization,
        [FromQuery] DateTime startTime,
        [FromQuery] DateTime endTime)
    {
        var result = await _service.FindAvailableTrainerAsync(specialization, startTime, endTime);
        return Ok(result);
    }
}
