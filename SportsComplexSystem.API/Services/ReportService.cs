using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using SportsComplexSystem.API.Data;
using SportsComplexSystem.API.Services.Interfaces;

namespace SportsComplexSystem.API.Services;

public interface IReportService
{
    Task<byte[]> TrainersWorkloadCsvAsync();
    Task<byte[]> MaintenanceLogCsvAsync();
}

/// <summary>
/// CSV-звіти з UTF-8 BOM та роздільником ";" (так Excel з українською локаллю відкриває файл одразу по колонках).
/// </summary>
public class ReportService : IReportService
{
    private readonly AppDbContext _context;
    private readonly ITrainerService _trainerService;
    private readonly ISettingsService _settings;

    public ReportService(AppDbContext context, ITrainerService trainerService, ISettingsService settings)
    {
        _context = context;
        _trainerService = trainerService;
        _settings = settings;
    }

    public async Task<byte[]> TrainersWorkloadCsvAsync()
    {
        var trainers = await _trainerService.GetAllWithWorkloadAsync();
        var sb = new StringBuilder();
        AppendRow(sb, "ID", "ПІБ", "Спеціалізація", "Телефон", "Призначено, год", "Ліміт, год", "Завантаженість, %", "Статус");
        foreach (var t in trainers.OrderBy(t => t.FullName))
        {
            AppendRow(sb, t.Id.ToString(), t.FullName, t.Specialization.ToString(), t.PhoneNumber ?? "",
                Num(t.AssignedHours), t.MaxWeeklyHours.ToString(), Num(t.LoadPercentage), t.LoadStatus.ToString());
        }
        return Encode(sb);
    }

    public async Task<byte[]> MaintenanceLogCsvAsync()
    {
        var warning = (await _settings.GetAsync()).WarningWearPercentage;
        var equipment = await _context.Equipment
            .Include(e => e.Location)
            .Include(e => e.MaintenanceTickets)
            .OrderBy(e => e.InventoryNumber)
            .ToListAsync();

        var sb = new StringBuilder();
        AppendRow(sb, "Інв. номер", "Назва", "Локація", "Статус", "Напрацювання, год", "Поріг ТО, год",
            "Знос, %", "Потребує уваги", "Заявка №", "Статус заявки", "Опис", "Створено", "Завершено");

        foreach (var e in equipment)
        {
            var wear = e.MaintenanceThresholdHours > 0 ? e.CurrentUsageHours / e.MaintenanceThresholdHours * 100 : 0;
            var baseCols = new[]
            {
                e.InventoryNumber, e.Name, e.Location.Name, e.Status.ToString(), Num(e.CurrentUsageHours),
                Num(e.MaintenanceThresholdHours), Num(wear), wear >= warning ? "Так" : "Ні"
            };

            var tickets = e.MaintenanceTickets.OrderByDescending(t => t.CreatedAt).ToList();
            if (tickets.Count == 0)
            {
                AppendRow(sb, baseCols.Concat(new[] { "", "", "", "", "" }).ToArray());
                continue;
            }
            foreach (var t in tickets)
            {
                AppendRow(sb, baseCols.Concat(new[]
                {
                    t.Id.ToString(), t.Status.ToString(), t.Description, Date(t.CreatedAt),
                    t.CompletedAt.HasValue ? Date(t.CompletedAt.Value) : ""
                }).ToArray());
            }
        }
        return Encode(sb);
    }

    private static string Num(double v) => v.ToString("0.##", CultureInfo.GetCultureInfo("uk-UA"));
    private static string Date(DateTime d) => d.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture);

    private static void AppendRow(StringBuilder sb, params string[] cols)
    {
        sb.AppendLine(string.Join(";", cols.Select(Escape)));
    }

    private static string Escape(string v)
    {
        if (v.IndexOfAny(new[] { ';', '"', '\n', '\r' }) < 0) return v;
        return "\"" + v.Replace("\"", "\"\"") + "\"";
    }

    private static byte[] Encode(StringBuilder sb)
    {
        var preamble = Encoding.UTF8.GetPreamble();
        var body = Encoding.UTF8.GetBytes(sb.ToString());
        return preamble.Concat(body).ToArray();
    }
}
