using HotelSystem.Application.DTOs;

namespace HotelSystem.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> Login(AuthRequest request);
        Task ChangePassword(string userId, string currentPassword, string newPassword);
    }
}
