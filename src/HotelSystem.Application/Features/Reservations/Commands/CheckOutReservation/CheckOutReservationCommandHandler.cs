using HotelSystem.Domain.Entities;
using HotelSystem.Domain.Enums;
using HotelSystem.Domain.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace HotelSystem.Application.Features.Reservations.Commands.CheckOutReservation
{
    public class CheckOutReservationCommandHandler : IRequestHandler<CheckOutReservationCommand, bool>
    {
        private readonly IGenericRepository<Reservation> _repository;

        public CheckOutReservationCommandHandler(IGenericRepository<Reservation> repository)
        {
            _repository = repository;
        }

        public async Task<bool> Handle(CheckOutReservationCommand request, CancellationToken cancellationToken)
        {
            var reservation = await _repository.GetByIdAsync(request.Id);

            if (reservation == null)
            {
                throw new Exception("Reservation not found");
            }

            if (reservation.Status != ReservationStatus.CheckedIn)
            {
                throw new Exception($"Cannot check-out reservation. Current status: {reservation.Status}. Status must be CheckedIn.");
            }

            reservation.Status = ReservationStatus.CheckedOut;
            
            await _repository.UpdateAsync(reservation);

            return true;
        }
    }
}
