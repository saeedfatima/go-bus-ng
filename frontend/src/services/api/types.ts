// API Service Types - Backend-agnostic data structures

export interface ApiUser {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  createdAt: string;
}

export interface ApiSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  user: ApiUser;
}

export interface ApiAuthResult {
  user?: ApiUser;
  session?: ApiSession;
  error?: Error;
}

export interface ApiCity {
  id: string;
  name: string;
  state: string;
}

export interface ApiCompany {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  rating: number;
  totalTrips: number;
  isVerified: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiBus {
  id: string;
  companyId: string;
  plateNumber: string;
  busType: 'standard' | 'luxury' | 'executive';
  totalSeats: number;
  amenities: string[];
  isActive: boolean;
  company?: ApiCompany;
  createdAt: string;
  updatedAt: string;
}

export interface ApiRoute {
  id: string;
  companyId: string;
  originCityId: string;
  destinationCityId: string;
  originCity?: ApiCity;
  destinationCity?: ApiCity;
  company?: ApiCompany;
  basePrice: number;
  durationHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTrip {
  id: string;
  routeId: string;
  busId: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  bookedSeats?: string[];
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled';
  route?: ApiRoute;
  bus?: ApiBus;
  company?: ApiCompany;
  createdAt: string;
  updatedAt: string;
}


export interface ApiPassenger {
  id: string;
  bookingId: string;
  fullName: string;
  phone: string;
  email?: string;
  nin?: string;
  seatNumber: string;
  createdAt: string;
}

export interface ApiBooking {
  id: string;
  tripId: string;
  userId: string;
  seats: string[];
  totalAmount: number;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  ticketCode: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  holdExpiresAt?: string;
  paymentCompletedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  trip?: ApiTrip;
  passengers?: ApiPassenger[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiProfile {
  id: string;
  fullName?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiUserRole {
  id: string;
  userId: string;
  role: 'admin' | 'company_admin' | 'passenger';
}

// Query options
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ApiQueryOptions extends PaginationOptions {
  sort?: SortOptions;
  filters?: Record<string, any>;
}

export interface ApiListResult<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

// Create/Update DTOs
export interface CreateBookingDto {
  tripId: string;
  seats: string[];
  totalAmount: number;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  passengers?: Omit<ApiPassenger, 'id' | 'bookingId' | 'createdAt'>[];
}

export interface CreateCompanyDto {
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface CreateBusDto {
  companyId: string;
  plateNumber: string;
  busType: 'standard' | 'luxury' | 'executive';
  totalSeats: number;
  amenities?: string[];
}

export interface CreateRouteDto {
  companyId: string;
  originCityId: string;
  destinationCityId: string;
  basePrice: number;
  durationHours: number;
}

export interface CreateTripDto {
  routeId: string;
  busId: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

export interface UpdateBookingDto {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  cancellationReason?: string;
}

export interface UpdateTripDto {
  departureTime?: string;
  arrivalTime?: string;
  price?: number;
  availableSeats?: number;
  status?: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled';
}

export interface TripSearchParams {
  originCityId?: string;
  destinationCityId?: string;
  departureDate?: string;
  passengers?: number;
}

// OTP Verification
export interface OtpVerifyResult {
  verified: boolean;
  session?: ApiSession;
  error?: Error;
}

// Paystack Payment
export interface PaystackInitResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface PaystackVerifyResult {
  status: string;
  reference: string;
  amount: number;
  paidAt?: string;
}
