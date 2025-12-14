import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('departure_time, available_seats, bus:buses(total_seats)')
        .eq('id', data.tripId)
        .single();

      if (tripError) throw tripError;

      const holdMinutes = calculateHoldTime(
        trip.departure_time,
        trip.available_seats,
        trip.bus?.total_seats || 48
      );

      const holdExpiresAt = new Date(Date.now() + holdMinutes * 60 * 1000).toISOString();
      const ticketCode = generateTicketCode();
      const seatNumbers = data.passengers.map(p => p.seatNumber);

      // Create the booking with pending status and hold time
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          trip_id: data.tripId,
          user_id: user.id,
          seats: seatNumbers,
          total_amount: data.totalAmount,
          passenger_name: data.passengers[0].fullName, // Primary passenger
          passenger_email: data.passengers[0].email || user.email || '',
          passenger_phone: data.passengers[0].phone,
          ticket_code: ticketCode,
          status: 'pending',
          hold_expires_at: holdExpiresAt,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Insert all passengers
      const passengersToInsert = data.passengers.map(p => ({
        booking_id: booking.id,
        full_name: p.fullName,
        phone: p.phone,
        email: p.email || null,
        nin: p.nin || null,
        seat_number: p.seatNumber,
      }));

      const { error: passengersError } = await supabase
        .from('booking_passengers')
        .insert(passengersToInsert);

      if (passengersError) {
        // Rollback booking if passengers insert fails
        await supabase.from('bookings').delete().eq('id', booking.id);
        throw passengersError;
      }

      // Reserve seats (reduce available seats)
      const { error: updateError } = await supabase
        .from('trips')
        .update({ available_seats: trip.available_seats - seatNumbers.length })
        .eq('id', data.tripId);

      if (updateError) throw updateError;

      return { booking, holdMinutes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
    },
  });
};
