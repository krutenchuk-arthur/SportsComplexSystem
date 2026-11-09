using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportsComplexSystem.API.Data;
using SportsComplexSystem.API.DTOs.Auth;
using SportsComplexSystem.API.Models;
using SportsComplexSystem.API.Services;

namespace SportsComplexSystem.API.Controllers;

[ApiController]
[Route("api/auth")]
[Authorize]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokens;
    private readonly IPasswordHasher<User> _hasher;

    public AuthController(AppDbContext context, ITokenService tokens, IPasswordHasher<User> hasher)
    {
        _context = context;
        _tokens = tokens;
        _hasher = hasher;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto dto)
    {
        var identifier = dto.Email.Trim().ToLowerInvariant();
        var user = await _context.Users
            .Include(u => u.Trainer)
            .FirstOrDefaultAsync(u => u.Email == identifier || (u.Username != null && u.Username == identifier));

        // Однакова відповідь для невідомого логіна і хибного пароля, щоб не розкривати існування акаунта
        if (user == null || _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password) == PasswordVerificationResult.Failed)
            return Unauthorized(new { message = "Невірний логін або пароль." });

        var (token, expiresAt) = _tokens.CreateToken(user);
        return Ok(new LoginResponseDto { Token = token, ExpiresAt = expiresAt, User = Map(user) });
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        var user = await CurrentUserAsync();
        return user == null ? Unauthorized() : Ok(Map(user));
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var user = await CurrentUserAsync();
        if (user == null) return Unauthorized();

        if (_hasher.VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword) == PasswordVerificationResult.Failed)
            return BadRequest(new { message = "Поточний пароль введено невірно." });

        user.PasswordHash = _hasher.HashPassword(user, dto.NewPassword);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private async Task<User?> CurrentUserAsync()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(sub, out var id)) return null;
        return await _context.Users.Include(u => u.Trainer).FirstOrDefaultAsync(u => u.Id == id);
    }

    private static UserDto Map(User u) => new()
    {
        Id = u.Id,
        Username = u.Username,
        Email = u.Email,
        FullName = u.FullName,
        Role = u.Role,
        TrainerId = u.TrainerId,
        TrainerSpecialization = u.Trainer?.Specialization
    };
}
