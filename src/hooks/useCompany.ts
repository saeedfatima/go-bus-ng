import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useCompany = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createCompany = useMutation({
    mutationFn: async (companyData: { name: string; description?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: companyData.name,
          description: companyData.description,
          owner_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;

      // Add company_admin role
      await supabase.from('user_roles').insert({
        user_id: user.id,
        role: 'company_admin',
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Company registered successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return { company, companyLoading, createCompany };
};

export const useBuses = (companyId?: string) => {
  const queryClient = useQueryClient();

  const { data: buses = [], isLoading } = useQuery({
    queryKey: ['buses', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
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
      
      const { data, error } = await supabase
        .from('buses')
        .insert({
          ...busData,
          company_id: companyId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses', companyId] });
      toast.success('Bus added successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateBus = useMutation({
    mutationFn: async ({ id, ...busData }: {
      id: string;
      plate_number?: string;
      bus_type?: 'standard' | 'luxury' | 'executive';
      total_seats?: number;
      amenities?: string[];
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('buses')
        .update(busData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses', companyId] });
      toast.success('Bus updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteBus = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('buses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses', companyId] });
      toast.success('Bus deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return { buses, isLoading, addBus, updateBus, deleteBus };
};

export const useCities = () => {
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  return { cities, isLoading };
};

export const useRoutes = (companyId?: string) => {
  const queryClient = useQueryClient();

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['routes', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          origin_city:cities!routes_origin_city_id_fkey(id, name, state),
          destination_city:cities!routes_destination_city_id_fkey(id, name, state)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const addRoute = useMutation({
    mutationFn: async (routeData: {
      origin_city_id: string;
      destination_city_id: string;
      base_price: number;
      duration_hours: number;
    }) => {
      if (!companyId) throw new Error('No company selected');
      
      const { data, error } = await supabase
        .from('routes')
        .insert({
          ...routeData,
          company_id: companyId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes', companyId] });
      toast.success('Route added successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteRoute = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes', companyId] });
      toast.success('Route deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return { routes, isLoading, addRoute, deleteRoute };
};

export const useTrips = (companyId?: string) => {
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(
            *,
            origin_city:cities!routes_origin_city_id_fkey(id, name, state),
            destination_city:cities!routes_destination_city_id_fkey(id, name, state)
          ),
          bus:buses(*)
        `)
        .eq('route.company_id', companyId)
        .order('departure_time', { ascending: true });
      
      if (error) throw error;
      return data.filter(trip => trip.route !== null);
    },
    enabled: !!companyId,
  });

  const addTrip = useMutation({
    mutationFn: async (tripData: {
      route_id: string;
      bus_id: string;
      departure_time: string;
      arrival_time: string;
      price: number;
      available_seats: number;
    }) => {
      const { data, error } = await supabase
        .from('trips')
        .insert(tripData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', companyId] });
      toast.success('Trip scheduled successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateTrip = useMutation({
    mutationFn: async ({ id, ...tripData }: {
      id: string;
      status?: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled';
      price?: number;
      available_seats?: number;
    }) => {
      const { data, error } = await supabase
        .from('trips')
        .update(tripData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', companyId] });
      toast.success('Trip updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return { trips, isLoading, addTrip, updateTrip };
};

export const useBookings = (companyId?: string) => {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      // Get all trips for the company first
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select(`
          id,
          route:routes!inner(company_id)
        `)
        .eq('route.company_id', companyId);
      
      if (tripsError) throw tripsError;
      
      const tripIds = tripsData?.map(t => t.id) || [];
      if (tripIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trip:trips(
            *,
            route:routes(
              origin_city:cities!routes_origin_city_id_fkey(name),
              destination_city:cities!routes_destination_city_id_fkey(name)
            )
          )
        `)
        .in('trip_id', tripIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  return { bookings, isLoading };
};
