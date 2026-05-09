using HotelSystem.Application.Features.FrontDesk.Commands.CheckIn;
using HotelSystem.Application.Features.FrontDesk.Commands.CheckOut;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelSystem.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FrontDeskController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FrontDeskController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("CheckIn")]
        public async Task<ActionResult> CheckIn([FromBody] CheckInCommand command)
        {
            try
            {
                await _mediator.Send(command);
                return Ok(new { Message = "Check-in successful" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("CheckOut")]
        public async Task<ActionResult> CheckOut([FromBody] CheckOutCommand command)
        {
            try
            {
                await _mediator.Send(command);
                return Ok(new { Message = "Check-out successful" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
