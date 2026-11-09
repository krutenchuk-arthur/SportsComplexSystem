using System.ComponentModel.DataAnnotations;
using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.DTOs.Auth;

public class LoginRequestDto
{
    /// <summary>
    /// Ідентифікатор входу: email або логін (Username).
    /// </summary>
    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class UserDto
{
    public int Id { get; set; }
    public string? Username { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public int? TrainerId { get; set; }
    public SpecializationType? TrainerSpecialization { get; set; }
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserDto User { get; set; } = new();
}

public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required, MinLength(6, ErrorMessage = "Пароль має містити щонайменше 6 символів.")]
    public string NewPassword { get; set; } = string.Empty;
}
