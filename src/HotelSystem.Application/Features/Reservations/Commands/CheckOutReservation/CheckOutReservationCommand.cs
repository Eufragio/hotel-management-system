using MediatR;
using System;

namespace HotelSystem.Application.Features.Reservations.Commands.CheckOutReservation
{
    public class CheckOutReservationCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }
}
