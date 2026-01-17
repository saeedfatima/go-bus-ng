// PHP MySQL API Service Implementation
// This is a template for PHP/MySQL backend integration

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

// Configuration
const PHP_API_URL = import.meta.env.VITE_PHP_API_URL || 'http://localhost/api';

// Token storage
let authToken: string | null = null;

// Helper for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${PHP_API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data.data || data;
}

// Build query string for pagination/filtering
function buildQueryString(options?: ApiQueryOptions): string {
  const params = new URLSearchParams();
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.sort) {
    params.set('sort_by', options.sort.field);
    params.set('sort_dir', options.sort.direction);
  }
  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
  }
  return params.toString() ? `?${params.toString()}` : '';
}

// Auth Service
class PhpAuthService implements IAuthService {
  private authChangeCallbacks: Set<(event: string, session: ApiSession | null) => void> = new Set();

  private notifyAuthChange(event: string, session: ApiSession | null) {
    this.authChangeCallbacks.forEach(cb => cb(event, session));
  }

  async getSession(): Promise<ApiSession | null> {
    if (!authToken) return null;
    try {
      const user = await apiCall<any>('/auth/me.php');
      return {
        accessToken: authToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          phone: user.phone,
          createdAt: user.created_at,
        },
      };
    } catch {
      return null;
    }
  }

  onAuthStateChange(callback: (event: string, session: ApiSession | null) => void): () => void {
    this.authChangeCallbacks.add(callback);
    return () => this.authChangeCallbacks.delete(callback);
  }

  async signUp(email: string, password: string, fullName: string, phone?: string): Promise<ApiAuthResult> {
    try {
      const data = await apiCall<any>('/auth/register.php', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName, phone }),
      });
      authToken = data.token;
      const session = await this.getSession();
      this.notifyAuthChange('SIGNED_IN', session);
      return { user: session?.user, session: session || undefined };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async signIn(email: string, password: string): Promise<ApiAuthResult> {
    try {
      const data = await apiCall<any>('/auth/login.php', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      authToken = data.token;
      const session = await this.getSession();
      this.notifyAuthChange('SIGNED_IN', session);
      return { user: session?.user, session: session || undefined };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async signOut(): Promise<void> {
    try {
      await apiCall('/auth/logout.php', { method: 'POST' });
    } finally {
      authToken = null;
      this.notifyAuthChange('SIGNED_OUT', null);
    }
  }

  async resetPasswordForEmail(email: string): Promise<{ error?: Error }> {
    try {
      await apiCall('/auth/forgot-password.php', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return {};
    } catch (error) {
      return { error: error as Error };
    }
  }

  async updatePassword(newPassword: string): Promise<{ error?: Error }> {
    try {
      await apiCall('/auth/change-password.php', {
        method: 'POST',
        body: JSON.stringify({ new_password: newPassword }),
      });
      return {};
    } catch (error) {
      return { error: error as Error };
    }
  }

  async resendVerificationEmail(email: string): Promise<{ error?: Error }> {
    try {
      await apiCall('/auth/resend-verification.php', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return {};
    } catch (error) {
      return { error: error as Error };
    }
  }
}

// Cities Service
class PhpCitiesService implements ICitiesService {
  async getAll(): Promise<ApiCity[]> {
    const data = await apiCall<any[]>('/cities/list.php');
    return data.map(c => ({ id: c.id, name: c.name, state: c.state }));
  }

  async getById(id: string): Promise<ApiCity | null> {
    try {
      const c = await apiCall<any>(`/cities/get.php?id=${id}`);
      return { id: c.id, name: c.name, state: c.state };
    } catch {
      return null;
    }
  }
}

// Companies Service
class PhpCompaniesService implements ICompaniesService {
  async getAll(options?: ApiQueryOptions): Promise<ApiListResult<ApiCompany>> {
    const qs = buildQueryString(options);
    const data = await apiCall<any>(`/companies/list.php${qs}`);
    return {
      data: data.items.map(this.mapCompany),
      total: data.total,
      page: options?.page || 1,
      limit: options?.limit,
    };
  }

  async getById(id: string): Promise<ApiCompany | null> {
    try {
      const c = await apiCall<any>(`/companies/get.php?id=${id}`);
      return this.mapCompany(c);
    } catch {
      return null;
    }
  }

  async getByOwnerId(ownerId: string): Promise<ApiCompany | null> {
    const data = await apiCall<any>(`/companies/list.php?owner_id=${ownerId}`);
    return data.items.length > 0 ? this.mapCompany(data.items[0]) : null;
  }

  async create(dto: CreateCompanyDto, ownerId: string): Promise<ApiCompany> {
    const c = await apiCall<any>('/companies/create.php', {
      method: 'POST',
      body: JSON.stringify({
        name: dto.name,
        description: dto.description,
        logo_url: dto.logoUrl,
        owner_id: ownerId,
      }),
    });
    return this.mapCompany(c);
  }

  async update(id: string, dto: Partial<ApiCompany>): Promise<ApiCompany> {
    const c = await apiCall<any>('/companies/update.php', {
      method: 'POST',
      body: JSON.stringify({
        id,
        name: dto.name,
        description: dto.description,
        logo_url: dto.logoUrl,
      }),
    });
    return this.mapCompany(c);
  }

  private mapCompany(c: any): ApiCompany {
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      logoUrl: c.logo_url,
      rating: parseFloat(c.rating) || 0,
      totalTrips: parseInt(c.total_trips) || 0,
      isVerified: c.is_verified === '1' || c.is_verified === true,
      ownerId: c.owner_id,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    };
  }
}

// Buses Service
class PhpBusesService implements IBusesService {
  async getByCompanyId(companyId: string): Promise<ApiBus[]> {
    const data = await apiCall<any[]>(`/buses/list.php?company_id=${companyId}`);
    return data.map(this.mapBus);
  }

  async getById(id: string): Promise<ApiBus | null> {
    try {
      const b = await apiCall<any>(`/buses/get.php?id=${id}`);
      return this.mapBus(b);
    } catch {
      return null;
    }
  }

  async create(dto: CreateBusDto): Promise<ApiBus> {
    const b = await apiCall<any>('/buses/create.php', {
      method: 'POST',
      body: JSON.stringify({
        company_id: dto.companyId,
        plate_number: dto.plateNumber,
        bus_type: dto.busType,
        total_seats: dto.totalSeats,
        amenities: JSON.stringify(dto.amenities || []),
      }),
    });
    return this.mapBus(b);
  }

  async update(id: string, dto: Partial<ApiBus>): Promise<ApiBus> {
    const b = await apiCall<any>('/buses/update.php', {
      method: 'POST',
      body: JSON.stringify({
        id,
        plate_number: dto.plateNumber,
        bus_type: dto.busType,
        total_seats: dto.totalSeats,
        amenities: dto.amenities ? JSON.stringify(dto.amenities) : undefined,
        is_active: dto.isActive,
      }),
    });
    return this.mapBus(b);
  }

  async delete(id: string): Promise<void> {
    await apiCall('/buses/delete.php', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  private mapBus(b: any): ApiBus {
    return {
      id: b.id,
      companyId: b.company_id,
      plateNumber: b.plate_number,
      busType: b.bus_type,
      totalSeats: parseInt(b.total_seats),
      amenities: typeof b.amenities === 'string' ? JSON.parse(b.amenities) : b.amenities || [],
      isActive: b.is_active === '1' || b.is_active === true,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    };
  }
}

// Routes Service
class PhpRoutesService implements IRoutesService {
  async getByCompanyId(companyId: string): Promise<ApiRoute[]> {
    const data = await apiCall<any[]>(`/routes/list.php?company_id=${companyId}`);
    return data.map(this.mapRoute);
  }

  async getById(id: string): Promise<ApiRoute | null> {
    try {
      const r = await apiCall<any>(`/routes/get.php?id=${id}`);
      return this.mapRoute(r);
    } catch {
      return null;
    }
  }

  async create(dto: CreateRouteDto): Promise<ApiRoute> {
    const r = await apiCall<any>('/routes/create.php', {
      method: 'POST',
      body: JSON.stringify({
        company_id: dto.companyId,
        origin_city_id: dto.originCityId,
        destination_city_id: dto.destinationCityId,
        base_price: dto.basePrice,
        duration_hours: dto.durationHours,
      }),
    });
    return this.mapRoute(r);
  }

  async update(id: string, dto: Partial<ApiRoute>): Promise<ApiRoute> {
    const r = await apiCall<any>('/routes/update.php', {
      method: 'POST',
      body: JSON.stringify({
        id,
        origin_city_id: dto.originCityId,
        destination_city_id: dto.destinationCityId,
        base_price: dto.basePrice,
        duration_hours: dto.durationHours,
        is_active: dto.isActive,
      }),
    });
    return this.mapRoute(r);
  }

  async delete(id: string): Promise<void> {
    await apiCall('/routes/delete.php', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  private mapRoute(r: any): ApiRoute {
    return {
      id: r.id,
      companyId: r.company_id,
      originCityId: r.origin_city_id,
      destinationCityId: r.destination_city_id,
      originCity: r.origin_city,
      destinationCity: r.destination_city,
      basePrice: parseFloat(r.base_price),
      durationHours: parseFloat(r.duration_hours),
      isActive: r.is_active === '1' || r.is_active === true,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }
}

// Trips Service
class PhpTripsService implements ITripsService {
  async search(params: TripSearchParams): Promise<ApiTrip[]> {
    const qs = new URLSearchParams();
    if (params.originCityId) qs.set('origin_city_id', params.originCityId);
    if (params.destinationCityId) qs.set('destination_city_id', params.destinationCityId);
    if (params.departureDate) qs.set('departure_date', params.departureDate);
    if (params.passengers) qs.set('min_seats', String(params.passengers));
    
    const data = await apiCall<any[]>(`/trips/search.php?${qs.toString()}`);
    return data.map(this.mapTrip);
  }

  async getByCompanyId(companyId: string): Promise<ApiTrip[]> {
    const data = await apiCall<any[]>(`/trips/list.php?company_id=${companyId}`);
    return data.map(this.mapTrip);
  }

  async getById(id: string): Promise<ApiTrip | null> {
    try {
      const t = await apiCall<any>(`/trips/get.php?id=${id}`);
      return this.mapTrip(t);
    } catch {
      return null;
    }
  }

  async create(dto: CreateTripDto): Promise<ApiTrip> {
    const t = await apiCall<any>('/trips/create.php', {
      method: 'POST',
      body: JSON.stringify({
        route_id: dto.routeId,
        bus_id: dto.busId,
        departure_time: dto.departureTime,
        arrival_time: dto.arrivalTime,
        price: dto.price,
        available_seats: dto.availableSeats,
      }),
    });
    return this.mapTrip(t);
  }

  async update(id: string, dto: UpdateTripDto): Promise<ApiTrip> {
    const t = await apiCall<any>('/trips/update.php', {
      method: 'POST',
      body: JSON.stringify({
        id,
        departure_time: dto.departureTime,
        arrival_time: dto.arrivalTime,
        price: dto.price,
        available_seats: dto.availableSeats,
        status: dto.status,
      }),
    });
    return this.mapTrip(t);
  }

  async delete(id: string): Promise<void> {
    await apiCall('/trips/delete.php', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  private mapTrip(t: any): ApiTrip {
    return {
      id: t.id,
      routeId: t.route_id,
      busId: t.bus_id,
      departureTime: t.departure_time,
      arrivalTime: t.arrival_time,
      price: parseFloat(t.price),
      availableSeats: parseInt(t.available_seats),
      status: t.status,
      route: t.route,
      bus: t.bus,
      company: t.company,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    };
  }
}

// Bookings Service
class PhpBookingsService implements IBookingsService {
  async getByUserId(userId: string): Promise<ApiBooking[]> {
    const data = await apiCall<any[]>(`/bookings/list.php?user_id=${userId}`);
    return data.map(this.mapBooking);
  }

  async getByCompanyId(companyId: string): Promise<ApiBooking[]> {
    const data = await apiCall<any[]>(`/bookings/list.php?company_id=${companyId}`);
    return data.map(this.mapBooking);
  }

  async getAll(options?: ApiQueryOptions): Promise<ApiListResult<ApiBooking>> {
    const qs = buildQueryString(options);
    const data = await apiCall<any>(`/bookings/list.php${qs}`);
    return {
      data: data.items.map(this.mapBooking),
      total: data.total,
      page: options?.page || 1,
      limit: options?.limit,
    };
  }

  async getById(id: string): Promise<ApiBooking | null> {
    try {
      const b = await apiCall<any>(`/bookings/get.php?id=${id}`);
      return this.mapBooking(b);
    } catch {
      return null;
    }
  }

  async create(dto: CreateBookingDto, userId: string): Promise<ApiBooking> {
    const b = await apiCall<any>('/bookings/create.php', {
      method: 'POST',
      body: JSON.stringify({
        trip_id: dto.tripId,
        user_id: userId,
        seats: JSON.stringify(dto.seats),
        total_amount: dto.totalAmount,
        passenger_name: dto.passengerName,
        passenger_email: dto.passengerEmail,
        passenger_phone: dto.passengerPhone,
        passengers: dto.passengers ? JSON.stringify(dto.passengers.map(p => ({
          full_name: p.fullName,
          phone: p.phone,
          email: p.email,
          nin: p.nin,
          seat_number: p.seatNumber,
        }))) : null,
      }),
    });
    return this.mapBooking(b);
  }

  async update(id: string, dto: UpdateBookingDto): Promise<ApiBooking> {
    const b = await apiCall<any>('/bookings/update.php', {
      method: 'POST',
      body: JSON.stringify({
        id,
        status: dto.status,
        cancellation_reason: dto.cancellationReason,
      }),
    });
    return this.mapBooking(b);
  }

  async getPassengers(bookingId: string): Promise<ApiPassenger[]> {
    const data = await apiCall<any[]>(`/bookings/passengers.php?booking_id=${bookingId}`);
    return data.map(p => ({
      id: p.id,
      bookingId: p.booking_id,
      fullName: p.full_name,
      phone: p.phone,
      email: p.email,
      nin: p.nin,
      seatNumber: p.seat_number,
      createdAt: p.created_at,
    }));
  }

  private mapBooking(b: any): ApiBooking {
    return {
      id: b.id,
      tripId: b.trip_id,
      userId: b.user_id,
      seats: typeof b.seats === 'string' ? JSON.parse(b.seats) : b.seats,
      totalAmount: parseFloat(b.total_amount),
      passengerName: b.passenger_name,
      passengerEmail: b.passenger_email,
      passengerPhone: b.passenger_phone,
      ticketCode: b.ticket_code,
      status: b.status,
      holdExpiresAt: b.hold_expires_at,
      paymentCompletedAt: b.payment_completed_at,
      cancelledAt: b.cancelled_at,
      cancellationReason: b.cancellation_reason,
      trip: b.trip,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    };
  }
}

// Profiles Service
class PhpProfilesService implements IProfilesService {
  async getById(id: string): Promise<ApiProfile | null> {
    try {
      const p = await apiCall<any>(`/profiles/get.php?id=${id}`);
      return this.mapProfile(p);
    } catch {
      return null;
    }
  }

  async update(id: string, dto: Partial<ApiProfile>): Promise<ApiProfile> {
    const p = await apiCall<any>('/profiles/update.php', {
      method: 'POST',
      body: JSON.stringify({
        id,
        full_name: dto.fullName,
        phone: dto.phone,
      }),
    });
    return this.mapProfile(p);
  }

  async getAll(options?: ApiQueryOptions): Promise<ApiListResult<ApiProfile>> {
    const qs = buildQueryString(options);
    const data = await apiCall<any>(`/profiles/list.php${qs}`);
    return {
      data: data.items.map(this.mapProfile),
      total: data.total,
      page: options?.page || 1,
      limit: options?.limit,
    };
  }

  private mapProfile(p: any): ApiProfile {
    return {
      id: p.id,
      fullName: p.full_name,
      phone: p.phone,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  }
}

// User Roles Service
class PhpUserRolesService implements IUserRolesService {
  async getByUserId(userId: string): Promise<ApiUserRole[]> {
    const data = await apiCall<any[]>(`/user-roles/list.php?user_id=${userId}`);
    return data.map(r => ({ id: r.id, userId: r.user_id, role: r.role }));
  }

  async hasRole(userId: string, role: 'admin' | 'company_admin' | 'passenger'): Promise<boolean> {
    const data = await apiCall<{ has_role: boolean }>(`/user-roles/check.php?user_id=${userId}&role=${role}`);
    return data.has_role;
  }

  async addRole(userId: string, role: 'admin' | 'company_admin' | 'passenger'): Promise<void> {
    await apiCall('/user-roles/add.php', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role }),
    });
  }

  async removeRole(userId: string, role: 'admin' | 'company_admin' | 'passenger'): Promise<void> {
    await apiCall('/user-roles/remove.php', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role }),
    });
  }
}

// Functions Service
class PhpFunctionsService implements IFunctionsService {
  async invoke<T = any>(functionName: string, body?: any): Promise<{ data?: T; error?: Error }> {
    try {
      const data = await apiCall<T>(`/functions/${functionName}.php`, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      });
      return { data };
    } catch (error) {
      return { error: error as Error };
    }
  }
}

// Main PHP API Service
export class PhpApiService implements IApiService {
  auth = new PhpAuthService();
  cities = new PhpCitiesService();
  companies = new PhpCompaniesService();
  buses = new PhpBusesService();
  routes = new PhpRoutesService();
  trips = new PhpTripsService();
  bookings = new PhpBookingsService();
  profiles = new PhpProfilesService();
  userRoles = new PhpUserRolesService();
  functions = new PhpFunctionsService();
}

export const phpApiService = new PhpApiService();
