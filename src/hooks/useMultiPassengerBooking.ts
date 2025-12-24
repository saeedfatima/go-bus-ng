import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Trip } from '@/types';

interface PassengerData {
  fullName: string;
  phone: string;
  email: string;
  nin: string;
  seatNumber: string;
}

interface BookingData {
  tripId: string;
  passengers: PassengerData[];
  totalAmount: number;
}

const generateTicketCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'NB-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Calculate hold time based on trip proximity and seat availability
const calculateHoldTime = (departureTime: string, availableSeats: number, totalSeats: number): number => {
  const now = new Date();
  const departure = new Date(departureTime);
  const hoursUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
  const seatAvailabilityRatio = availableSeats / totalSeats;

  // Near departure (< 6 hours) or extreme demand (< 20% seats) = 30 min
  if (hoursUntilDeparture < 6 || seatAvailabilityRatio < 0.2) {
    return 30;
  }

  // High demand (< 40% seats) or moderate time (< 24 hours) = 1 hour
  if (hoursUntilDeparture < 24 || seatAvailabilityRatio < 0.4) {
    return 60;
  }

  // Normal conditions = 2 hours
  return 120;
};

export const useMultiPassengerBooking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookingData) => {
      if (!user) throw new Error('You must be logged in to book a trip');

      // Get trip details for hold time calculation
      const tripResponse = await api.get<Trip>(`trips/${data.tripId}/`);
      const trip = tripResponse.data;

      const holdMinutes = calculateHoldTime(
        trip.departure_time,
        trip.available_seats,
        trip.bus.total_seats
      );

      const holdExpiresAt = new Date(Date.now() + holdMinutes * 60 * 1000).toISOString();
      const ticketCode = generateTicketCode();
      const seatNumbers = data.passengers.map(p => p.seatNumber);

      const passengersToInsert = data.passengers.map(p => ({
        full_name: p.fullName,
        phone: p.phone,
        email: p.email || null,
        nin: p.nin || null,
        seat_number: p.seatNumber,
      }));

      const response = await api.post('bookings/', {
        trip: data.tripId,
        seats: seatNumbers,
        total_amount: data.totalAmount,
        passenger_name: data.passengers[0].fullName, // Primary passenger
        passenger_email: data.passengers[0].email || user.email || '',
        passenger_phone: data.passengers[0].phone,
        ticket_code: ticketCode,
        status: 'pending',
        hold_expires_at: holdExpiresAt,
        passengers: passengersToInsert,
      });

      return { booking: response.data, holdMinutes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
    },
  });
};
