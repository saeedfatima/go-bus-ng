import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Company, Bus, Route, Trip, Booking, City } from '@/types';

export const useCompany = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', user?.username],
    queryFn: async () => {
      if (!user) return null;
      try {
        const response = await api.get<Company[]>('companies/?owner=me');
        return response.data[0] || null;
      } catch (error) {
        console.error('Error fetching company:', error);
        return null;
      }
    },
    enabled: !!user,
  });

  const createCompany = useMutation({
    mutationFn: async (companyData: { name: string; description?: string }) => {
      if (!user) throw new Error('Not authenticated');

      const response = await api.post<Company>('companies/', {
        name: companyData.name,
        // description is not in model, ignoring for now or should add it?
        // Model has: name, logo, rating, total_trips, is_verified
        // We'll just send name and defaults for others
        logo: 'https://via.placeholder.com/150', // Default logo
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Company registered successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || error.message);
    },
  });

  return { company, companyLoading, createCompany };
};

export const useBuses = (companyId?: number) => {
  const queryClient = useQueryClient();

  const { data: buses = [], isLoading } = useQuery({
    queryKey: ['buses', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const response = await api.get<Bus[]>(`buses/?company=${companyId}`);
      return response.data;
    },
    enabled: !!companyId,
  });

  const addBus = useMutation({
    mutationFn: async (busData: {
      plate_number: string;
      bus_type: 'standard' | 'luxury' | 'executive';
      total_seats: number;
      amenities: string[];
    }) => {
      if (!companyId) throw new Error('No company selected');

      const response = await api.post<Bus>('buses/', {
        ...busData,
        company: companyId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses', companyId] });
      toast.success('Bus added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || error.message);
    },
  });

  const updateBus = useMutation({
    mutationFn: async ({ id, ...busData }: {
      id: number;
      plate_number?: string;
      bus_type?: 'standard' | 'luxury' | 'executive';
      total_seats?: number;
      amenities?: string[];
    }) => {
      const response = await api.put<Bus>(`buses/${id}/`, busData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses', companyId] });
      toast.success('Bus updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || error.message);
    },
  });

  const deleteBus = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`buses/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses', companyId] });
      toast.success('Bus deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || error.message);
    },
  });

  return { buses, isLoading, addBus, updateBus, deleteBus };
};

export const useCities = () => {
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await api.get<City[]>('cities/');
      return response.data;
    },
  });

  return { cities, isLoading };
};

export const useRoutes = (companyId?: number) => {
  const queryClient = useQueryClient();

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['routes', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const response = await api.get<Route[]>(`routes/?company=${companyId}`);
      return response.data;
    },
    enabled: !!companyId,
  });

  const addRoute = useMutation({
    mutationFn: async (routeData: {
      origin_id: number;
      destination_id: number;
      base_price: number;
      duration_hours: number;
    }) => {
      if (!companyId) throw new Error('No company selected');

      const response = await api.post<Route>('routes/', {
        ...routeData,
        company: companyId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes', companyId] });
      toast.success('Route added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || error.message);
    },
  });

  const deleteRoute = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`routes/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes', companyId] });
      toast.success('Route deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || error.message);
    },
  });

  return { routes, isLoading, addRoute, deleteRoute };
};

export const useTrips = (companyId?: number) => {
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const response = await api.get<Trip[]>(`trips/?company=${companyId}`);
      return response.data;
    },
    enabled: !!companyId,
  });

  const addTrip = useMutation({
    mutationFn: async (tripData: {
      route_id: number;
      bus_id: number;
      departure_time: string;
      arrival_time: string;
      price: number;
      available_seats: number;
    }) => {
      if (!companyId) throw new Error('No company selected');
      // Need to fetch route to get company ID? Or just pass it?
      // TripSerializer expects company_id
      const response = await api.post<Trip>('trips/', {
        ...tripData,
        company: companyId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', companyId] });
      toast.success('Trip scheduled successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || error.message);
    },
  });

  const updateTrip = useMutation({
    mutationFn: async ({ id, ...tripData }: {
      id: number;
      status?: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled';
      price?: number;
      available_seats?: number;
    }) => {
      const response = await api.put<Trip>(`trips/${id}/`, tripData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', companyId] });
      toast.success('Trip updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || error.message);
    },
  });

  return { trips, isLoading, addTrip, updateTrip };
};

export const useBookings = (companyId?: number) => {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const response = await api.get<Booking[]>(`bookings/?company=${companyId}`);
      return response.data;
    },
    enabled: !!companyId,
  });

  return { bookings, isLoading };
};
