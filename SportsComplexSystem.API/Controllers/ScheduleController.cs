using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportsComplexSystem.API.DTOs.Schedule;
using SportsComplexSystem.API.Services;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Controllers;

[ApiController]
[Authorize]
[Route("api/schedule")]
public class ScheduleController : ControllerBase
{
    private readonly IScheduleService _service;

    public ScheduleController(IScheduleService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ScheduleSlotDto>>> GetAll(
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] int? locationId = null,
        [FromQuery] int? trainerId = null)
    {
        return Ok(await _service.GetAllAsync(from, to, locationId, trainerId));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ScheduleSlotDto>> GetById(int id)
    {
        var slot = await _service.GetByIdAsync(id);
        return slot == null ? NotFound() : Ok(slot);
    }

    [HttpPost("validate")]
    public async Task<ActionResult<ScheduleValidationResultDto>> Validate(ScheduleSlotCreateUpdateDto dto)
    {
        return Ok(await _service.ValidateAsync(dto));
    }

    /// <summary>
    /// Admin може все. Trainer може працювати лише зі слотами, де TrainerId = його профіль.
    /// </summary>
    private bool CanManageTrainerSlot(int trainerId)
    {
        if (User.IsInRole("Admin")) return true;
        if (!User.IsInRole("Trainer")) return false;
        var claim = User.FindFirst(TokenService.TrainerIdClaim)?.Value;
        return int.TryParse(claim, out var own) && own == trainerId;
    }

    private ObjectResult ForbiddenSlot() =>
        StatusCode(StatusCodes.Status403Forbidden, new { message = "Ви можете керувати лише власними заняттями." });

    [HttpPost]
    [Authorize(Roles = "Admin,Trainer")]
    public async Task<ActionResult<ScheduleSlotDto>> Create(ScheduleSlotCreateUpdateDto dto)
    {
        if (!CanManageTrainerSlot(dto.TrainerId)) return ForbiddenSlot();
        try
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ScheduleConflictException ex)
        {
            return Conflict(ex.ValidationResult);
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Trainer")]
    public async Task<ActionResult<ScheduleSlotDto>> Update(int id, ScheduleSlotCreateUpdateDto dto)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing == null) return NotFound();
        // Тренер не може ні редагувати чужий слот, ні переписати свій на іншого тренера
        if (!CanManageTrainerSlot(existing.TrainerId) || !CanManageTrainerSlot(dto.TrainerId)) return ForbiddenSlot();
        try
        {
            var updated = await _service.UpdateAsync(id, dto);
            return updated == null ? NotFound() : Ok(updated);
        }
        catch (ScheduleConflictException ex)
        {
            return Conflict(ex.ValidationResult);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Trainer")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing == null) return NotFound();
        if (!CanManageTrainerSlot(existing.TrainerId)) return ForbiddenSlot();
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
