namespace SportsComplexSystem.API.DTOs.Schedule;

/// <summary>
/// Запит на клонування тижневого розкладу на наступний тиждень (+7 днів).
/// Для ролі Trainer поле TrainerId ігнорується — беруться лише власні слоти з токена.
/// </summary>
public class CloneWeekRequestDto
{
    /// <summary>Будь-яка дата тижня-джерела; сервіс нормалізує її до понеділка.</summary>
    public DateTime? WeekStartDate { get; set; }

    /// <summary>Опціональний фільтр за тренером (враховується лише для Admin).</summary>
    public int? TrainerId { get; set; }
}

/// <summary>
/// Результат клонування: скільки занять перенесено та чому частину пропущено.
/// </summary>
public class CloneWeekResultDto
{
    public int CopiedCount { get; set; }
    public int SkippedCount { get; set; }
    public List<string> SkippedReasons { get; set; } = new();
}
