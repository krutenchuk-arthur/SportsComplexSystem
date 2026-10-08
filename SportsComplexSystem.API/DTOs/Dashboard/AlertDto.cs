namespace SportsComplexSystem.API.DTOs.Dashboard;

public enum AlertSeverity
{
    Warning,
    Critical
}

public class AlertDto
{
    public AlertSeverity Severity { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
