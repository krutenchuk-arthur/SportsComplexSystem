using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportsComplexSystem.API.Services;

namespace SportsComplexSystem.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "Admin,Technician")]
public class ReportsController : ControllerBase
{
    private const string CsvType = "text/csv; charset=utf-8";
    private readonly IReportService _service;

    public ReportsController(IReportService service)
    {
        _service = service;
    }

    [HttpGet("trainers-workload.csv")]
    public async Task<IActionResult> TrainersWorkload() =>
        File(await _service.TrainersWorkloadCsvAsync(), CsvType, "Табель_завантаженості_персоналу.csv");

    [HttpGet("maintenance-log.csv")]
    public async Task<IActionResult> MaintenanceLog() =>
        File(await _service.MaintenanceLogCsvAsync(), CsvType, "Журнал_ТО_та_зносу_інвентарю.csv");
}
