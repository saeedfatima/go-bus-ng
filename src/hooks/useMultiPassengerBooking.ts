import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

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

export const useMultiPassengerBooking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookingData) => {
      if (!user) throw new Error('You must be logged in to book a trip');

      const booking = await api.bookings.create({
        tripId: data.tripId,
        seats: data.passengers.map(p => p.seatNumber),
        totalAmount: data.totalAmount,
        passengerName: data.passengers[0].fullName,
        passengerEmail: data.passengers[0].email || user.email || '',
        passengerPhone: data.passengers[0].phone,
        passengers: data.passengers.map(p => ({
          fullName: p.fullName,
          phone: p.phone,
          email: p.email,
          nin: p.nin,
          seatNumber: p.seatNumber,
          createdAt: new Date().toISOString() // Just to match types, backend ignores
        })),
      }, user.id);

      // Backend handles hold time, usually 15-30 minutes
      const holdMinutes = 15; 

      return { booking, holdMinutes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
    },
  });
};
