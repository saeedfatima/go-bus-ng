import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BookingData {
  tripId: string;
  seats: string[];
  totalAmount: number;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
}

const generateTicketCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'NB-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useBookTrip = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookingData) => {
      if (!user) throw new Error('You must be logged in to book a trip');

      const ticketCode = generateTicketCode();

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          trip_id: data.tripId,
          user_id: user.id,
          seats: data.seats,
          total_amount: data.totalAmount,
          passenger_name: data.passengerName,
          passenger_email: data.passengerEmail,
          passenger_phone: data.passengerPhone,
          ticket_code: ticketCode,
          status: 'confirmed',
        })
        .select()
        .single();

      if (error) throw error;

      // Update available seats on the trip
      const { data: trip } = await supabase
        .from('trips')
        .select('available_seats')
        .eq('id', data.tripId)
        .single();

      if (trip) {
        await supabase
          .from('trips')
          .update({ available_seats: trip.available_seats - data.seats.length })
          .eq('id', data.tripId);
      }

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};