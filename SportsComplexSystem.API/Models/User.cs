using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.Models;

/// <summary>
/// Обліковий запис користувача системи.
/// </summary>
public class User
{
    public int Id { get; set; }

    public required string Email { get; set; }

    /// <summary>
    /// Унікальний логін користувача. Вхід дозволено як за email, так і за логіном.
    /// </summary>
    public string? Username { get; set; }

    public string PasswordHash { get; set; } = string.Empty;

    public required string FullName { get; set; }

    public UserRole Role { get; set; }

    /// <summary>
    /// Прив'язка акаунта тренера до його профілю в таблиці Trainers.
    /// </summary>
    public int? TrainerId { get; set; }
    public Trainer? Trainer { get; set; }
}
