import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { api } from '@/services/api';

export const useCompany = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return api.companies.getByOwnerId(user.id);
    },
    enabled: !!user,
  });

  const createCompany = useMutation({
    mutationFn: async (companyData: { name: string; description?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const company = await api.companies.create({
        name: companyData.name,
        description: companyData.description,
      }, user.id);
      
      // Add company_admin role
      await api.userRoles.addRole(user.id, 'company_admin');
      
      return company;
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
      return api.buses.getByCompanyId(companyId);
    },
    enabled: !!companyId,
  });

  const addBus = useMutation({
    mutationFn: async (busData: {
      plateNumber: string;
      busType: 'standard' | 'luxury' | 'executive';
      totalSeats: number;
      amenities: string[];
    }) => {
      if (!companyId) throw new Error('No company selected');
      
      return api.buses.create({
        companyId,
        plateNumber: busData.plateNumber,
        busType: busData.busType,
        totalSeats: busData.totalSeats,
        amenities: busData.amenities,
      });
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
      plateNumber?: string;
      busType?: 'standard' | 'luxury' | 'executive';
      totalSeats?: number;
      amenities?: string[];
      isActive?: boolean;
    }) => {
      return api.buses.update(id, {
        plateNumber: busData.plateNumber,
        busType: busData.busType,
        totalSeats: busData.totalSeats,
        amenities: busData.amenities,
        isActive: busData.isActive,
      });
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
      return api.buses.delete(id);
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
      return api.cities.getAll();
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
      return api.routes.getByCompanyId(companyId);
    },
    enabled: !!companyId,
  });

  const addRoute = useMutation({
    mutationFn: async (routeData: {
      originCityId: string;
      destinationCityId: string;
      basePrice: number;
      durationHours: number;
    }) => {
      if (!companyId) throw new Error('No company selected');
      
      return api.routes.create({
        companyId,
        originCityId: routeData.originCityId,
        destinationCityId: routeData.destinationCityId,
        basePrice: routeData.basePrice,
        durationHours: routeData.durationHours,
      });
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
      return api.routes.delete(id);
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
      return api.trips.getByCompanyId(companyId);
    },
    enabled: !!companyId,
  });

  const addTrip = useMutation({
    mutationFn: async (tripData: {
      routeId: string;
      busId: string;
      departureTime: string;
      arrivalTime: string;
      price: number;
      availableSeats: number;
    }) => {
      return api.trips.create({
        routeId: tripData.routeId,
        busId: tripData.busId,
        departureTime: tripData.departureTime,
        arrivalTime: tripData.arrivalTime,
        price: tripData.price,
        availableSeats: tripData.availableSeats,
      });
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
      availableSeats?: number;
      departureTime?: string;
      arrivalTime?: string;
    }) => {
      return api.trips.update(id, {
        status: tripData.status,
        price: tripData.price,
        availableSeats: tripData.availableSeats,
        departureTime: tripData.departureTime,
        arrivalTime: tripData.arrivalTime,
      });
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
      return api.bookings.getByCompanyId(companyId);
    },
    enabled: !!companyId,
  });

  return { bookings, isLoading };
};
