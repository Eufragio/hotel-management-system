using HotelSystem.Application.DTOs;
using HotelSystem.Application.Features.Auth.Commands.Login;
using HotelSystem.Application.Features.Auth.Commands.ChangePassword;
using HotelSystem.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IAuditService _auditService;

        public AuthController(IMediator mediator, IAuditService auditService)
        {
            _mediator = mediator;
            _auditService = auditService;
        }

        /// <summary>
        /// Authenticates a user and returns a JWT token.
        /// </summary>
        /// <param name="request">User credentials (email and password)</param>
        /// <returns>Authentication response with JWT token and user details</returns>
        /// <response code="200">Returns the JWT token and user information</response>
        /// <response code="401">If credentials are invalid</response>
        [HttpPost("Login")]
        [ProducesResponseType(typeof(AuthResponse), 200)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] AuthRequest request)
        {
            try
            {
                var response = await _mediator.Send(new LoginCommand { Email = request.Email, Password = request.Password });
                
                // Log successful login
                await _auditService.LogAction(
                    response.Id,
                    response.UserName ?? response.Email,
                    "Login",
                    "Auth",
                    response.Id,
                    null,
                    $"User logged in successfully",
                    HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown"
                );
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(ex.Message);
            }
        }
        /// <summary>
        /// Changes the password for the currently authenticated user.
        /// </summary>
        /// <param name="request">Current and new password</param>
        /// <returns>No content on success</returns>
        /// <response code="204">Password changed successfully</response>
        /// <response code="400">If current password is incorrect or new password is invalid</response>
        /// <response code="401">If user is not authenticated</response>
        [HttpPost("ChangePassword")]
        [Authorize]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not identified");
                }

                await _mediator.Send(new ChangePasswordCommand 
                { 
                    UserId = userId, 
                    CurrentPassword = request.CurrentPassword, 
                    NewPassword = request.NewPassword 
                });
                
                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
