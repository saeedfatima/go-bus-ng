// Django REST API Service Implementation
// This is a template for Django backend integration

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
  IPaymentService,
} from "../interfaces";
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
  PaystackInitResult,
  PaystackVerifyResult,
} from "../types";

// Configuration
const DJANGO_API_URL =
  import.meta.env.VITE_DJANGO_API_URL || "http://localhost:8000/api/v1";

// Token storage - persisted in localStorage so sessions survive page refresh
let accessToken: string | null = localStorage.getItem("django_access_token");
let refreshToken: string | null = localStorage.getItem("django_refresh_token");

function setTokens(access: string | null, refresh: string | null) {
  accessToken = access;
  refreshToken = refresh;
  if (access) localStorage.setItem("django_access_token", access);
  else localStorage.removeItem("django_access_token");
  if (refresh) localStorage.setItem("django_refresh_token", refresh);
  else localStorage.removeItem("django_refresh_token");
}

// Helper for API calls
// Helper for API calls with automatic refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const makeRequest = async (tokenToUse: string | null): Promise<Response> => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (tokenToUse) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${tokenToUse}`;
    }

    return fetch(`${DJANGO_API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  let response = await makeRequest(accessToken);

  // Handle 401 Unauthorized - attempt token refresh
  if (response.status === 401 && refreshToken && !endpoint.includes('/auth/refresh/') && !endpoint.includes('/auth/login/')) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve: (token: string) => resolve(apiCall(endpoint, options)), reject });
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await fetch(`${DJANGO_API_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setTokens(data.access, data.refresh || refreshToken);
        processQueue(null, data.access);
        isRefreshing = false;
        
        // Retry the original request with new token
        response = await makeRequest(data.access);
      } else {
        // Refresh failed, logout user
        processQueue(new Error("Refresh failed"), null);
        isRefreshing = false;
        setTokens(null, null);
        window.location.href = '/login';
        throw new Error("Session expired. Please login again.");
      }
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError, null);
      setTokens(null, null);
      throw refreshError;
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const fieldErrorEntry = Object.entries(errorBody).find(
      ([key, value]) =>
        key !== "non_field_errors" &&
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "string",
    );
    const fieldMessage = fieldErrorEntry
      ? `${fieldErrorEntry[0]}: ${fieldErrorEntry[1][0]}`
      : undefined;
    const message =
      errorBody.error ||
      errorBody.detail ||
      errorBody.message ||
      errorBody.non_field_errors?.[0] ||
      fieldMessage ||
      `Request failed with status ${response.status}`;
    
    // If we still get a 401 or "token not valid" after refresh attempt, clear tokens
    if (response.status === 401 || message.includes('token not valid')) {
      setTokens(null, null);
    }
    
    throw new Error(message);
  }

  return response.json();
}


// Paginated response helper
function buildQueryString(options?: ApiQueryOptions): string {
  const params = new URLSearchParams();
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("page_size", String(options.limit));
  if (options?.sort) {
    const prefix = options.sort.direction === "desc" ? "-" : "";
    params.set("ordering", `${prefix}${options.sort.field}`);
  }
  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
  }
  return params.toString() ? `?${params.toString()}` : "";
}

// Auth Service
class DjangoAuthService implements IAuthService {
  private authChangeCallbacks: Set<
    (event: string, session: ApiSession | null) => void
  > = new Set();

  private notifyAuthChange(event: string, session: ApiSession | null) {
    this.authChangeCallbacks.forEach((cb) => cb(event, session));
  }

  async getSession(): Promise<ApiSession | null> {
    if (!accessToken) return null;
    try {
      const user = await apiCall<any>("/auth/me/");
      return {
        accessToken,
        refreshToken: refreshToken || undefined,
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

  onAuthStateChange(
    callback: (event: string, session: ApiSession | null) => void,
  ): () => void {
    this.authChangeCallbacks.add(callback);
    return () => this.authChangeCallbacks.delete(callback);
  }

  async signUp(
    email: string,
    password: string,
    fullName: string,
    phone?: string,
  ): Promise<ApiAuthResult> {
    try {
      const data = await apiCall<any>("/auth/register/", {
        method: "POST",
        body: JSON.stringify({ email, password, full_name: fullName, phone }),
      });

      // Django returns otp_required flag — don't auto-login
      if (data.otp_required) {
        return {
          user: {
            id: "",
            email,
            fullName,
            phone,
            createdAt: new Date().toISOString(),
          },
        };
      }

      setTokens(data.access, data.refresh);
      const session = await this.getSession();
      this.notifyAuthChange('SIGNED_IN', session);
      return { user: session?.user, session: session || undefined };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async signIn(email: string, password: string): Promise<ApiAuthResult> {
    try {
      const data = await apiCall<any>("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // If Django requires OTP verification before login
      if (data.otp_required) {
        return {
          user: { id: "", email, fullName: data.full_name, createdAt: "" },
          error: new Error("OTP_REQUIRED"),
        };
      }

      setTokens(data.access, data.refresh);
      const session = await this.getSession();
      this.notifyAuthChange('SIGNED_IN', session);
      return { user: session?.user, session: session || undefined };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async verifyOtp(email: string, code: string): Promise<ApiAuthResult> {
    try {
      const data = await apiCall<any>("/auth/verify-otp/", {
        method: "POST",
        body: JSON.stringify({ email, otp_code: code }),
      });
      setTokens(data.access, data.refresh);
      const session = await this.getSession();
      this.notifyAuthChange('SIGNED_IN', session);
      return { user: session?.user, session: session || undefined };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async resendOtp(email: string): Promise<{ error?: Error }> {
    try {
      await apiCall("/auth/resend-otp/", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return {};
    } catch (error) {
      return { error: error as Error };
    }
  }

  async signOut(): Promise<void> {
    try {
      await apiCall("/auth/logout/", { method: "POST" });
    } finally {
      setTokens(null, null);
      this.notifyAuthChange('SIGNED_OUT', null);
    }
  }

  async resetPasswordForEmail(email: string): Promise<{ error?: Error }> {
    try {
      await apiCall("/auth/password-reset/", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return {};
    } catch (error) {
      return { error: error as Error };
    }
  }

  async updatePassword(newPassword: string): Promise<{ error?: Error }> {
    try {
      await apiCall("/auth/password-change/", {
        method: "POST",
        body: JSON.stringify({ new_password: newPassword }),
      });
      return {};
    } catch (error) {
      return { error: error as Error };
    }
  }

  async resendVerificationEmail(email: string): Promise<{ error?: Error }> {
    try {
      await apiCall("/auth/resend-verification/", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return {};
    } catch (error) {
      return { error: error as Error };
    }
  }
}

// Cities Service
class DjangoCitiesService implements ICitiesService {
  async getAll(): Promise<ApiCity[]> {
    const data = await apiCall<any[]>("/cities/");
    return data.map((c) => ({ id: c.id, name: c.name, state: c.state }));
  }

  async getById(id: string): Promise<ApiCity | null> {
    try {
      const c = await apiCall<any>(`/cities/${id}/`);
      return { id: c.id, name: c.name, state: c.state };
    } catch {
      return null;
    }
  }
}

// Companies Service
class DjangoCompaniesService implements ICompaniesService {
  async getAll(options?: ApiQueryOptions): Promise<ApiListResult<ApiCompany>> {
    const qs = buildQueryString(options);
    const data = await apiCall<any>(`/companies/${qs}`);
    return {
      data: data.results.map(this.mapCompany),
      total: data.count,
      page: options?.page || 1,
      limit: options?.limit,
    };
  }

  async getById(id: string): Promise<ApiCompany | null> {
    try {
      const c = await apiCall<any>(`/companies/${id}/`);
      return this.mapCompany(c);
    } catch {
      return null;
    }
  }

  async getByOwnerId(ownerId: string): Promise<ApiCompany | null> {
    const data = await apiCall<any>(`/companies/?owner_id=${ownerId}`);
    return data.results.length > 0 ? this.mapCompany(data.results[0]) : null;
  }

  async create(dto: CreateCompanyDto, ownerId: string): Promise<ApiCompany> {
    const c = await apiCall<any>("/companies/", {
      method: "POST",
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
    const c = await apiCall<any>(`/companies/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({
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
      rating: c.rating || 0,
      totalTrips: c.total_trips || 0,
      isVerified: c.is_verified || false,
      ownerId: c.owner_id,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    };
  }
}

// Buses Service
class DjangoBusesService implements IBusesService {
  async getByCompanyId(companyId: string): Promise<ApiBus[]> {
    const data = await apiCall<any[]>(`/buses/?company_id=${companyId}`);
    return data.map(this.mapBus);
  }

  async getById(id: string): Promise<ApiBus | null> {
    try {
      const b = await apiCall<any>(`/buses/${id}/`);
      return this.mapBus(b);
    } catch {
      return null;
    }
  }

  async create(dto: CreateBusDto): Promise<ApiBus> {
    const b = await apiCall<any>("/buses/", {
      method: "POST",
      body: JSON.stringify({
        company_id: dto.companyId,
        plate_number: dto.plateNumber,
        bus_type: dto.busType,
        total_seats: dto.totalSeats,
        amenities: dto.amenities || [],
      }),
    });
    return this.mapBus(b);
  }

  async update(id: string, dto: Partial<ApiBus>): Promise<ApiBus> {
    const b = await apiCall<any>(`/buses/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({
        plate_number: dto.plateNumber,
        bus_type: dto.busType,
        total_seats: dto.totalSeats,
        amenities: dto.amenities,
        is_active: dto.isActive,
      }),
    });
    return this.mapBus(b);
  }

  async delete(id: string): Promise<void> {
    await apiCall(`/buses/${id}/`, { method: "DELETE" });
  }

  private mapBus(b: any): ApiBus {
    return {
      id: b.id,
      companyId: b.company_id,
      plateNumber: b.plate_number,
      busType: b.bus_type,
      totalSeats: b.total_seats,
      amenities: b.amenities || [],
      isActive: b.is_active,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    };
  }
}

// Routes Service
class DjangoRoutesService implements IRoutesService {
  async getByCompanyId(companyId: string): Promise<ApiRoute[]> {
    const data = await apiCall<any[]>(`/routes/?company_id=${companyId}`);
    return data.map(this.mapRoute);
  }

  async getById(id: string): Promise<ApiRoute | null> {
    try {
      const r = await apiCall<any>(`/routes/${id}/`);
      return this.mapRoute(r);
    } catch {
      return null;
    }
  }

  async create(dto: CreateRouteDto): Promise<ApiRoute> {
    const r = await apiCall<any>("/routes/", {
      method: "POST",
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
    const r = await apiCall<any>(`/routes/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({
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
    await apiCall(`/routes/${id}/`, { method: "DELETE" });
  }

  private mapRoute(r: any): ApiRoute {
    return {
      id: r.id,
      companyId: r.company_id,
      originCityId: r.origin_city_id,
      destinationCityId: r.destination_city_id,
      originCity: r.origin_city,
      destinationCity: r.destination_city,
      basePrice: r.base_price,
      durationHours: r.duration_hours,
      isActive: r.is_active,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }
}

// Trips Service
class DjangoTripsService implements ITripsService {
  async search(params: TripSearchParams): Promise<ApiTrip[]> {
    const qs = new URLSearchParams();
    if (params.originCityId) qs.set("origin_city_id", params.originCityId);
    if (params.destinationCityId)
      qs.set("destination_city_id", params.destinationCityId);
    if (params.departureDate) qs.set("departure_date", params.departureDate);
    if (params.passengers) qs.set("min_seats", String(params.passengers));

    const data = await apiCall<any[]>(`/trips/search/?${qs.toString()}`);
    return data.map(this.mapTrip);
  }

  async getByCompanyId(companyId: string): Promise<ApiTrip[]> {
    const data = await apiCall<any[]>(`/trips/?company_id=${companyId}`);
    return data.map(this.mapTrip);
  }

  async getById(id: string): Promise<ApiTrip | null> {
    try {
      const t = await apiCall<any>(`/trips/${id}/`);
      return this.mapTrip(t);
    } catch {
      return null;
    }
  }

  async create(dto: CreateTripDto): Promise<ApiTrip> {
    const t = await apiCall<any>("/trips/", {
      method: "POST",
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
    const t = await apiCall<any>(`/trips/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({
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
    await apiCall(`/trips/${id}/`, { method: "DELETE" });
  }

  private mapTrip(t: any): ApiTrip {
    return {
      id: t.id,
      routeId: t.route_id,
      busId: t.bus_id,
      departureTime: t.departure_time,
      arrivalTime: t.arrival_time,
      price: t.price,
      availableSeats: t.available_seats,
      bookedSeats: t.booked_seats || [],
      status: t.status,

      route: t.route ? {
        id: t.route.id,
        companyId: t.route.company_id,
        originCityId: t.route.origin_city_id,
        destinationCityId: t.route.destination_city_id,
        originCity: t.route.origin_city,
        destinationCity: t.route.destination_city,
        basePrice: t.route.base_price,
        durationHours: t.route.duration_hours,
        isActive: t.route.is_active,
        createdAt: t.route.created_at || '',
        updatedAt: t.route.updated_at || '',
      } : undefined,
      bus: t.bus ? {
        id: t.bus.id,
        companyId: t.bus.company_id,
        plateNumber: t.bus.plate_number,
        busType: t.bus.bus_type,
        totalSeats: t.bus.total_seats,
        amenities: t.bus.amenities || [],
        isActive: t.bus.is_active,
        createdAt: t.bus.created_at || '',
        updatedAt: t.bus.updated_at || '',
      } : undefined,
      company: t.company ? {
        id: t.company.id,
        name: t.company.name,
        description: t.company.description,
        logoUrl: t.company.logo_url,
        rating: t.company.rating || 0,
        totalTrips: t.company.total_trips || 0,
        isVerified: t.company.is_verified || false,
        ownerId: t.company.owner_id || '',
        createdAt: t.company.created_at || '',
        updatedAt: t.company.updated_at || '',
      } : undefined,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    };
  }

}

// Bookings Service
class DjangoBookingsService implements IBookingsService {
  async getByUserId(userId: string): Promise<ApiBooking[]> {
    const data = await apiCall<{ results: any[]; count: number }>(`/bookings/?user_id=${userId}`);
    return data.results.map(this.mapBooking);
  }

  async getByCompanyId(companyId: string): Promise<ApiBooking[]> {
    const data = await apiCall<{ results: any[]; count: number }>(`/bookings/?company_id=${companyId}`);
    return data.results.map(this.mapBooking);
  }

  async getAll(options?: ApiQueryOptions): Promise<ApiListResult<ApiBooking>> {
    const qs = buildQueryString(options);
    const data = await apiCall<any>(`/bookings/${qs}`);
    return {
      data: data.results.map(this.mapBooking),
      total: data.count,
      page: options?.page || 1,
      limit: options?.limit,
    };
  }

  async getById(id: string): Promise<ApiBooking | null> {
    try {
      const b = await apiCall<any>(`/bookings/${id}/`);
      return this.mapBooking(b);
    } catch {
      return null;
    }
  }

  async create(dto: CreateBookingDto, userId: string): Promise<ApiBooking> {
    const b = await apiCall<any>("/bookings/", {
      method: "POST",
      body: JSON.stringify({
        trip_id: dto.tripId,
        user_id: userId,
        seats: dto.seats,
        total_amount: dto.totalAmount,
        passenger_name: dto.passengerName,
        passenger_email: dto.passengerEmail,
        passenger_phone: dto.passengerPhone,
        passengers: dto.passengers?.map((p) => ({
          full_name: p.fullName,
          phone: p.phone,
          email: p.email?.trim() ? p.email.trim() : null,
          nin: p.nin?.trim() ? p.nin.trim() : null,
          seat_number: p.seatNumber,
        })),
      }),
    });
    return this.mapBooking(b);
  }

  async update(id: string, dto: UpdateBookingDto): Promise<ApiBooking> {
    const b = await apiCall<any>(`/bookings/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({
        status: dto.status,
        cancellation_reason: dto.cancellationReason,
      }),
    });
    return this.mapBooking(b);
  }

  async getPassengers(bookingId: string): Promise<ApiPassenger[]> {
    const data = await apiCall<any[]>(`/bookings/${bookingId}/passengers/`);
    return data.map((p) => ({
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
      seats: b.seats,
      totalAmount: b.total_amount,
      passengerName: b.passenger_name,
      passengerEmail: b.passenger_email,
      passengerPhone: b.passenger_phone,
      ticketCode: b.ticket_code,
      status: b.status,
      holdExpiresAt: b.hold_expires_at,
      paymentCompletedAt: b.payment_completed_at,
      cancelledAt: b.cancelled_at,
      cancellationReason: b.cancellation_reason,
      trip: b.trip ? {
        id: b.trip.id,
        routeId: b.trip.route_id,
        busId: b.trip.bus_id,
        departureTime: b.trip.departure_time,
        arrivalTime: b.trip.arrival_time,
        price: b.trip.price,
        route: b.trip.route ? {
          id: b.trip.route.id,
          originCity: b.trip.route.origin_city,
          destinationCity: b.trip.route.destination_city,
        } : undefined,
      } as any : undefined,
      passengers: b.passengers ? b.passengers.map((p: any) => ({
        id: p.id,
        bookingId: p.booking_id,
        fullName: p.full_name,
        phone: p.phone,
        email: p.email,
        nin: p.nin,
        seatNumber: p.seat_number,
        createdAt: p.created_at,
      })) : undefined,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    };

  }
}

// Profiles Service
class DjangoProfilesService implements IProfilesService {
  async getById(id: string): Promise<ApiProfile | null> {
    try {
      const p = await apiCall<any>(`/profiles/${id}/`);
      return this.mapProfile(p);
    } catch {
      return null;
    }
  }

  async getByUserId(userId: string): Promise<ApiProfile | null> {
    try {
      // Assuming backend has a filter or we use a dedicated endpoint
      const data = await apiCall<{ results: any[] }>(`/profiles/?user_id=${userId}`);
      return data.results.length > 0 ? this.mapProfile(data.results[0]) : null;
    } catch {
      return null;
    }
  }

  async update(id: string, dto: Partial<ApiProfile>): Promise<ApiProfile> {
    const p = await apiCall<any>(`/profiles/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({
        full_name: dto.fullName,
        phone: dto.phone,
      }),
    });
    return this.mapProfile(p);
  }

  async getAll(options?: ApiQueryOptions): Promise<ApiListResult<ApiProfile>> {
    const qs = buildQueryString(options);
    const data = await apiCall<any>(`/profiles/${qs}`);
    return {
      data: data.results.map(this.mapProfile),
      total: data.count,
      page: options?.page || 1,
      limit: options?.limit,
    };
  }

  private mapProfile(p: any): any {
    return {
      id: p.id,
      fullName: p.full_name,
      phone: p.phone,
      email: p.email,
      roles: p.roles || [],
      bookingsCount: p.bookings_count || 0,
      companyName: p.company_name,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  }
}

// User Roles Service
class DjangoUserRolesService implements IUserRolesService {
  async getByUserId(userId: string): Promise<ApiUserRole[]> {
    const data = await apiCall<any[]>(`/auth/user-roles/?user_id=${userId}`);
    return data.map((r) => ({ id: r.id, userId: r.user_id, role: r.role }));
  }

  async hasRole(
    userId: string,
    role: "admin" | "company_admin" | "passenger",
  ): Promise<boolean> {
    const data = await apiCall<{ has_role: boolean }>(
      `/auth/user-roles/check/?user_id=${userId}&role=${role}`,
    );
    return data.has_role;
  }

  async addRole(
    userId: string,
    role: "admin" | "company_admin" | "passenger",
  ): Promise<void> {
    await apiCall("/auth/user-roles/add/", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, role }),
    });
  }

  async removeRole(
    userId: string,
    role: "admin" | "company_admin" | "passenger",
  ): Promise<void> {
    await apiCall(`/auth/user-roles/remove/`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, role }),
    });
  }
}

// Functions Service (for background tasks, webhooks, etc.)
class DjangoFunctionsService implements IFunctionsService {
  async invoke<T = any>(
    functionName: string,
    body?: any,
  ): Promise<{ data?: T; error?: Error }> {
    try {
      const data = await apiCall<T>(`/functions/${functionName}/`, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      return { data };
    } catch (error) {
      return { error: error as Error };
    }
  }
}

// Payment Service (Paystack)
class DjangoPaymentService implements IPaymentService {
  async initializePayment(
    bookingId: string,
    email: string,
    amount: number,
  ): Promise<PaystackInitResult> {
    const data = await apiCall<any>("/payments/initialize/", {
      method: "POST",
      body: JSON.stringify({ booking_id: bookingId, email, amount }),
    });
    return {
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
      reference: data.reference,
    };
  }

  async verifyPayment(reference: string): Promise<PaystackVerifyResult> {
    const data = await apiCall<any>(`/payments/verify/?reference=${reference}`);
    return {
      status: data.status,
      reference: data.reference,
      amount: data.amount,
      paidAt: data.paid_at,
    };
  }
}

// Main Django API Service
export class DjangoApiService implements IApiService {
  auth = new DjangoAuthService();
  cities = new DjangoCitiesService();
  companies = new DjangoCompaniesService();
  buses = new DjangoBusesService();
  routes = new DjangoRoutesService();
  trips = new DjangoTripsService();
  bookings = new DjangoBookingsService();
  profiles = new DjangoProfilesService();
  userRoles = new DjangoUserRolesService();
  functions = new DjangoFunctionsService();
  payments = new DjangoPaymentService();
}

export const djangoApiService = new DjangoApiService();
