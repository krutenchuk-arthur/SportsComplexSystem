namespace SportsComplexSystem.API.DTOs.Trainers;

/// <summary>
/// Статус завантаженості тренера для кольорового маркування на фронтенді.
/// </summary>
public enum LoadStatus
{
    Optimal,    // < 75%
    Warning,    // 75-99.9%
    Critical    // >= 100%
}
