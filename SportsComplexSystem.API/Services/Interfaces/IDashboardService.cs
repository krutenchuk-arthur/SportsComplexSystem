using SportsComplexSystem.API.DTOs.Dashboard;

namespace SportsComplexSystem.API.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardKpiDto> GetKpiAsync();
    Task<List<AlertDto>> GetAlertsAsync(int limit = 10);
}
