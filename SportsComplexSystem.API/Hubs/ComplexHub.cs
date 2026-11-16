using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SportsComplexSystem.API.Hubs;

/// <summary>
/// SignalR-хаб реального часу: після будь-якої зміни даних надсилає подію
/// <c>DataChanged</c> з типом сутності, щоб клієнт оновив відповідні списки.
/// </summary>
[Authorize]
public class ComplexHub : Hub
{
}
