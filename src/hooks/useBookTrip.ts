import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
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

      const response = await api.post('bookings/', {
        trip: data.tripId,
        // user is handled by backend
        seats: data.seats,
        total_amount: data.totalAmount,
        passenger_name: data.passengerName,
        passenger_email: data.passengerEmail,
        passenger_phone: data.passengerPhone,
        ticket_code: ticketCode,
        status: 'confirmed',
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};