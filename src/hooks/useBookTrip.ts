import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { CreateBookingDto } from '@/services/api/types';

export const useBookTrip = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookingDto) => {
      if (!user) throw new Error('You must be logged in to book a trip');

      const result = await api.bookings.create(data, user.id);
      
      // The backend should handle seat updates, but if we need a refresh:
      await queryClient.invalidateQueries({ queryKey: ['trip', data.tripId] });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};