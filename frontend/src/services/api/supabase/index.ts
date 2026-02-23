// Supabase API Service Implementation

import { supabase } from '@/integrations/supabase/client';
import type {
  IApiService,
  IAuthService,
  ICitiesService,
  ICompaniesService,
  IBusesService,
  IRoutesService,
  ITripsService,
  IBookingsService,
  IProfilesService,
  IUserRolesService,
  IFunctionsService,
} from '../interfaces';
import type {
  ApiSession,
  ApiAuthResult,
  ApiCity,
  ApiCompany,
  ApiBus,
  ApiRoute,
  ApiTrip,
  ApiBooking,
  ApiPassenger,
  ApiProfile,
  ApiUserRole,
  ApiQueryOptions,
  ApiListResult,
  CreateBookingDto,
  CreateCompanyDto,
  CreateBusDto,
  CreateRouteDto,
  CreateTripDto,
  UpdateBookingDto,
  UpdateTripDto,
  TripSearchParams,
} from '../types';
import {
  mapSupabaseSession,
  mapSupabaseUser,
  mapSupabaseCity,
  mapSupabaseCompany,
  mapSupabaseBus,
  mapSupabaseRoute,
  mapSupabaseTrip,
  mapSupabaseBooking,
  mapSupabasePassenger,
  mapSupabaseProfile,
  mapSupabaseUserRole,
} from './mappers';

// Generate unique ticket code
const generateTicketCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'NB-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Auth Service
class SupabaseAuthService implements IAuthService {
  async getSession(): Promise<ApiSession | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? mapSupabaseSession(session) : null;
  }

  onAuthStateChange(callback: (event: string, session: ApiSession | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session ? mapSupabaseSession(session) : null);
    });
    return () => subscription.unsubscribe();
  }

  async signUp(email: string, password: string, fullName: string, phone?: string): Promise<ApiAuthResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName, phone },
      },
    });
    return {
      user: data.user ? mapSupabaseUser(data.user) : undefined,
      session: data.session ? mapSupabaseSession(data.session) : undefined,
      error: error || undefined,
    };
  }

  async signIn(email: string, password: string): Promise<ApiAuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return {
      user: data.user ? mapSupabaseUser(data.user) : undefined,
      session: data.session ? mapSupabaseSession(data.session) : undefined,
      error: error || undefined,
    };
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  async resetPasswordForEmail(email: string): Promise<{ error?: Error }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/forgot-password`,
    });
    return { error: error || undefined };
  }

  async updatePassword(newPassword: string): Promise<{ error?: Error }> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error || undefined };
  }

  async resendVerificationEmail(email: string): Promise<{ error?: Error }> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    return { error: error || undefined };
  }
}

// Cities Service
class SupabaseCitiesService implements ICitiesService {
  async getAll(): Promise<ApiCity[]> {
    const { data, error } = await supabase.from('cities').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapSupabaseCity);
  }

  async getById(id: string): Promise<ApiCity | null> {
    const { data, error } = await supabase.from('cities').select('*').eq('id', id).single();
    if (error) return null;
    return mapSupabaseCity(data);
  }
}

// Companies Service
class SupabaseCompaniesService implements ICompaniesService {
  async getAll(options?: ApiQueryOptions): Promise<ApiListResult<ApiCompany>> {
    let query = supabase.from('companies').select('*', { count: 'exact' });
    
    if (options?.sort) {
      query = query.order(options.sort.field, { ascending: options.sort.direction === 'asc' });
    }
    if (options?.limit) {
      const offset = ((options.page || 1) - 1) * options.limit;
      query = query.range(offset, offset + options.limit - 1);
    }
    
    const { data, error, count } = await query;
    if (error) throw error;
    
    return {
      data: (data || []).map(mapSupabaseCompany),
      total: count || 0,
      page: options?.page || 1,
      limit: options?.limit,
    };
  }

  async getById(id: string): Promise<ApiCompany | null> {
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
    if (error) return null;
    return mapSupabaseCompany(data);
  }

  async getByOwnerId(ownerId: string): Promise<ApiCompany | null> {
    const { data, error } = await supabase.from('companies').select('*').eq('owner_id', ownerId).maybeSingle();
    if (error) return null;
    return data ? mapSupabaseCompany(data) : null;
  }

  async create(dto: CreateCompanyDto, ownerId: string): Promise<ApiCompany> {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: dto.name,
        description: dto.description,
        logo_url: dto.logoUrl,
        owner_id: ownerId,
      })
      .select()
      .single();
    if (error) throw error;
    return mapSupabaseCompany(data);
  }

  async update(id: string, dto: Partial<ApiCompany>): Promise<ApiCompany> {
    const { data, error } = await supabase
      .from('companies')
      .update({
        name: dto.name,
        description: dto.description,
        logo_url: dto.logoUrl,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapSupabaseCompany(data);
  }
}

// Buses Service
class SupabaseBusesService implements IBusesService {
  async getByCompanyId(companyId: string): Promise<ApiBus[]> {
    const { data, error } = await supabase.from('buses').select('*').eq('company_id', companyId);
    if (error) throw error;
    return (data || []).map(mapSupabaseBus);
  }

  async getById(id: string): Promise<ApiBus | null> {
    const { data, error } = await supabase.from('buses').select('*').eq('id', id).single();
    if (error) return null;
    return mapSupabaseBus(data);
  }

  async create(dto: CreateBusDto): Promise<ApiBus> {
    const { data, error } = await supabase
      .from('buses')
      .insert({
        company_id: dto.companyId,
        plate_number: dto.plateNumber,
        bus_type: dto.busType,
        total_seats: dto.totalSeats,
        amenities: dto.amenities || [],
      })
      .select()
      .single();
    if (error) throw error;
    return mapSupabaseBus(data);
  }

  async update(id: string, dto: Partial<ApiBus>): Promise<ApiBus> {
    const { data, error } = await supabase
      .from('buses')
      .update({
        plate_number: dto.plateNumber,
        bus_type: dto.busType,
        total_seats: dto.totalSeats,
        amenities: dto.amenities,
        is_active: dto.isActive,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapSupabaseBus(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('buses').delete().eq('id', id);
    if (error) throw error;
  }
}

// Routes Service
class SupabaseRoutesService implements IRoutesService {
  async getByCompanyId(companyId: string): Promise<ApiRoute[]> {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        origin_city:cities!routes_origin_city_id_fkey(*),
        destination_city:cities!routes_destination_city_id_fkey(*)
      `)
      .eq('company_id', companyId);
    if (error) throw error;
    return (data || []).map(mapSupabaseRoute);
  }

  async getById(id: string): Promise<ApiRoute | null> {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        origin_city:cities!routes_origin_city_id_fkey(*),
        destination_city:cities!routes_destination_city_id_fkey(*)
      `)
      .eq('id', id)
      .single();
    if (error) return null;
    return mapSupabaseRoute(data);
  }

  async create(dto: CreateRouteDto): Promise<ApiRoute> {
    const { data, error } = await supabase
      .from('routes')
      .insert({
        company_id: dto.companyId,
        origin_city_id: dto.originCityId,
        destination_city_id: dto.destinationCityId,
        base_price: dto.basePrice,
        duration_hours: dto.durationHours,
      })
      .select()
      .single();
    if (error) throw error;
    return mapSupabaseRoute(data);
  }

  async update(id: string, dto: Partial<ApiRoute>): Promise<ApiRoute> {
    const { data, error } = await supabase
      .from('routes')
      .update({
        origin_city_id: dto.originCityId,
        destination_city_id: dto.destinationCityId,
        base_price: dto.basePrice,
        duration_hours: dto.durationHours,
        is_active: dto.isActive,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapSupabaseRoute(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('routes').delete().eq('id', id);
    if (error) throw error;
  }
}

// Trips Service
class SupabaseTripsService implements ITripsService {
  async search(params: TripSearchParams): Promise<ApiTrip[]> {
    let query = supabase
      .from('trips')
      .select(`
        *,
        routes!inner (
          *,
          origin_city:cities!routes_origin_city_id_fkey(*),
          destination_city:cities!routes_destination_city_id_fkey(*)
        ),
        buses (
          *,
          companies (*)
        )
      `)
      .eq('status', 'scheduled')
      .gte('departure_time', new Date().toISOString());

    if (params.originCityId) {
      query = query.eq('routes.origin_city_id', params.originCityId);
    }
    if (params.destinationCityId) {
      query = query.eq('routes.destination_city_id', params.destinationCityId);
    }
    if (params.departureDate) {
      const startOfDay = `${params.departureDate}T00:00:00`;
      const endOfDay = `${params.departureDate}T23:59:59`;
      query = query.gte('departure_time', startOfDay).lte('departure_time', endOfDay);
    }
    if (params.passengers) {
      query = query.gte('available_seats', params.passengers);
    }

    const { data, error } = await query.order('departure_time');
    if (error) throw error;
    return (data || []).map(mapSupabaseTrip);
  }

  async getByCompanyId(companyId: string): Promise<ApiTrip[]> {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        routes!inner (
          *,
          origin_city:cities!routes_origin_city_id_fkey(*),
          destination_city:cities!routes_destination_city_id_fkey(*)
        ),
        buses (*)
      `)
      .eq('routes.company_id', companyId);
    if (error) throw error;
    return (data || []).map(mapSupabaseTrip);
  }

  async getById(id: string): Promise<ApiTrip | null> {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        routes (
          *,
          origin_city:cities!routes_origin_city_id_fkey(*),
          destination_city:cities!routes_destination_city_id_fkey(*)
        ),
        buses (
          *,
          companies (*)
        )
      `)
      .eq('id', id)
      .single();
    if (error) return null;
    return mapSupabaseTrip(data);
  }

  async create(dto: CreateTripDto): Promise<ApiTrip> {
    const { data, error } = await supabase
      .from('trips')
      .insert({
        route_id: dto.routeId,
        bus_id: dto.busId,
        departure_time: dto.departureTime,
        arrival_time: dto.arrivalTime,
        price: dto.price,
        available_seats: dto.availableSeats,
      })
      .select()
      .single();
    if (error) throw error;
    return mapSupabaseTrip(data);
  }

  async update(id: string, dto: UpdateTripDto): Promise<ApiTrip> {
    const { data, error } = await supabase
      .from('trips')
      .update({
        departure_time: dto.departureTime,
        arrival_time: dto.arrivalTime,
        price: dto.price,
        available_seats: dto.availableSeats,
        status: dto.status,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapSupabaseTrip(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('trips').delete().eq('id', id);
    if (error) throw error;
  }
}

// Bookings Service
class SupabaseBookingsService implements IBookingsService {
  async getByUserId(userId: string): Promise<ApiBooking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        trips (
          *,
          routes (
            *,
            origin_city:cities!routes_origin_city_id_fkey(*),
            destination_city:cities!routes_destination_city_id_fkey(*)
          ),
          buses (
            *,
            companies (*)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapSupabaseBooking);
  }

  async getByCompanyId(companyId: string): Promise<ApiBooking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        trips!inner (
          *,
          routes!inner (*),
          buses (*)
        )
      `)
      .eq('trips.routes.company_id', companyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapSupabaseBooking);
  }

  async getAll(options?: ApiQueryOptions): Promise<ApiListResult<ApiBooking>> {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        trips (
          *,
          routes (
            *,
            origin_city:cities!routes_origin_city_id_fkey(*),
            destination_city:cities!routes_destination_city_id_fkey(*)
          ),
          buses (
            *,
            companies (*)
          )
        )
      `, { count: 'exact' });

    if (options?.sort) {
      query = query.order(options.sort.field, { ascending: options.sort.direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (options?.limit) {
      const offset = ((options.page || 1) - 1) * options.limit;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: (data || []).map(mapSupabaseBooking),
      total: count || 0,
      page: options?.page || 1,
      limit: options?.limit,
    };
  }

  async getById(id: string): Promise<ApiBooking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        trips (
          *,
          routes (
            *,
            origin_city:cities!routes_origin_city_id_fkey(*),
            destination_city:cities!routes_destination_city_id_fkey(*)
          ),
          buses (
            *,
            companies (*)
          )
        )
      `)
      .eq('id', id)
      .single();
    if (error) return null;
    return mapSupabaseBooking(data);
  }

  async create(dto: CreateBookingDto, userId: string): Promise<ApiBooking> {
    const ticketCode = generateTicketCode();
    
    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        trip_id: dto.tripId,
        user_id: userId,
        seats: dto.seats,
        total_amount: dto.totalAmount,
        passenger_name: dto.passengerName,
        passenger_email: dto.passengerEmail,
        passenger_phone: dto.passengerPhone,
        ticket_code: ticketCode,
        status: 'pending',
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Insert passengers if provided
    if (dto.passengers && dto.passengers.length > 0) {
      const passengersToInsert = dto.passengers.map(p => ({
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
        // Rollback booking
        await supabase.from('bookings').delete().eq('id', booking.id);
        throw passengersError;
      }
    }

    // Update available seats
    const { data: trip } = await supabase
      .from('trips')
      .select('available_seats')
      .eq('id', dto.tripId)
      .single();

    if (trip) {
      await supabase
        .from('trips')
        .update({ available_seats: trip.available_seats - dto.seats.length })
        .eq('id', dto.tripId);
    }

    return mapSupabaseBooking(booking);
  }

  async update(id: string, dto: UpdateBookingDto): Promise<ApiBooking> {
    const updateData: any = { status: dto.status };
    
    if (dto.status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
      updateData.cancellation_reason = dto.cancellationReason || 'Cancelled';
    } else if (dto.status === 'confirmed') {
      updateData.payment_completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapSupabaseBooking(data);
  }

  async getPassengers(bookingId: string): Promise<ApiPassenger[]> {
    const { data, error } = await supabase
      .from('booking_passengers')
      .select('*')
      .eq('booking_id', bookingId);
    if (error) throw error;
    return (data || []).map(mapSupabasePassenger);
  }
}

// Profiles Service
class SupabaseProfilesService implements IProfilesService {
  async getById(id: string): Promise<ApiProfile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) return null;
    return mapSupabaseProfile(data);
  }

  async update(id: string, dto: Partial<ApiProfile>): Promise<ApiProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: dto.fullName,
        phone: dto.phone,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapSupabaseProfile(data);
  }

  async getAll(options?: ApiQueryOptions): Promise<ApiListResult<ApiProfile>> {
    let query = supabase.from('profiles').select('*', { count: 'exact' });
    
    if (options?.sort) {
      query = query.order(options.sort.field, { ascending: options.sort.direction === 'asc' });
    }
    if (options?.limit) {
      const offset = ((options.page || 1) - 1) * options.limit;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: (data || []).map(mapSupabaseProfile),
      total: count || 0,
      page: options?.page || 1,
      limit: options?.limit,
    };
  }
}

// User Roles Service
class SupabaseUserRolesService implements IUserRolesService {
  async getByUserId(userId: string): Promise<ApiUserRole[]> {
    const { data, error } = await supabase.from('user_roles').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(mapSupabaseUserRole);
  }

  async hasRole(userId: string, role: 'admin' | 'company_admin' | 'passenger'): Promise<boolean> {
    const { data, error } = await supabase.rpc('has_role', { _user_id: userId, _role: role });
    if (error) return false;
    return data;
  }

  async addRole(userId: string, role: 'admin' | 'company_admin' | 'passenger'): Promise<void> {
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role });
    if (error) throw error;
  }

  async removeRole(userId: string, role: 'admin' | 'company_admin' | 'passenger'): Promise<void> {
    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', role);
    if (error) throw error;
  }
}

// Functions Service
class SupabaseFunctionsService implements IFunctionsService {
  async invoke<T = any>(functionName: string, body?: any): Promise<{ data?: T; error?: Error }> {
    const { data, error } = await supabase.functions.invoke(functionName, { body });
    return { data: data as T, error: error || undefined };
  }
}

// Main Supabase API Service
export class SupabaseApiService implements IApiService {
  auth = new SupabaseAuthService();
  cities = new SupabaseCitiesService();
  companies = new SupabaseCompaniesService();
  buses = new SupabaseBusesService();
  routes = new SupabaseRoutesService();
  trips = new SupabaseTripsService();
  bookings = new SupabaseBookingsService();
  profiles = new SupabaseProfilesService();
  userRoles = new SupabaseUserRolesService();
  functions = new SupabaseFunctionsService();
}

export const supabaseApiService = new SupabaseApiService();
