// API Service Interfaces - Contracts for backend implementations

import type {
  ApiUser,
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
} from './types';

// Authentication Service Interface
export interface IAuthService {
  // Session management
  getSession(): Promise<ApiSession | null>;
  onAuthStateChange(callback: (event: string, session: ApiSession | null) => void): () => void;
  
  // User actions
  signUp(email: string, password: string, fullName: string, phone?: string): Promise<ApiAuthResult>;
  signIn(email: string, password: string): Promise<ApiAuthResult>;
  signOut(): Promise<void>;
  
  // Password management
  resetPasswordForEmail(email: string): Promise<{ error?: Error }>;
  updatePassword(newPassword: string): Promise<{ error?: Error }>;
  
  // Email verification
  resendVerificationEmail(email: string): Promise<{ error?: Error }>;

  // OTP verification (Django-specific, optional)
  verifyOtp?(email: string, code: string): Promise<ApiAuthResult>;
  resendOtp?(email: string): Promise<{ error?: Error }>;
}

// Cities Service Interface
export interface ICitiesService {
  getAll(): Promise<ApiCity[]>;
  getById(id: string): Promise<ApiCity | null>;
}

// Companies Service Interface
export interface ICompaniesService {
  getAll(options?: ApiQueryOptions): Promise<ApiListResult<ApiCompany>>;
  getById(id: string): Promise<ApiCompany | null>;
  getByOwnerId(ownerId: string): Promise<ApiCompany | null>;
  create(data: CreateCompanyDto, ownerId: string): Promise<ApiCompany>;
  update(id: string, data: Partial<ApiCompany>): Promise<ApiCompany>;
}

// Buses Service Interface
export interface IBusesService {
  getByCompanyId(companyId: string): Promise<ApiBus[]>;
  getById(id: string): Promise<ApiBus | null>;
  create(data: CreateBusDto): Promise<ApiBus>;
  update(id: string, data: Partial<ApiBus>): Promise<ApiBus>;
  delete(id: string): Promise<void>;
}

// Routes Service Interface
export interface IRoutesService {
  getByCompanyId(companyId: string): Promise<ApiRoute[]>;
  getById(id: string): Promise<ApiRoute | null>;
  create(data: CreateRouteDto): Promise<ApiRoute>;
  update(id: string, data: Partial<ApiRoute>): Promise<ApiRoute>;
  delete(id: string): Promise<void>;
}

// Trips Service Interface
export interface ITripsService {
  search(params: TripSearchParams): Promise<ApiTrip[]>;
  getByCompanyId(companyId: string): Promise<ApiTrip[]>;
  getById(id: string): Promise<ApiTrip | null>;
  create(data: CreateTripDto): Promise<ApiTrip>;
  update(id: string, data: UpdateTripDto): Promise<ApiTrip>;
  delete(id: string): Promise<void>;
}

// Bookings Service Interface
export interface IBookingsService {
  getByUserId(userId: string): Promise<ApiBooking[]>;
  getByCompanyId(companyId: string): Promise<ApiBooking[]>;
  getAll(options?: ApiQueryOptions): Promise<ApiListResult<ApiBooking>>;
  getById(id: string): Promise<ApiBooking | null>;
  create(data: CreateBookingDto, userId: string): Promise<ApiBooking>;
  update(id: string, data: UpdateBookingDto): Promise<ApiBooking>;
  getPassengers(bookingId: string): Promise<ApiPassenger[]>;
}

// Profiles Service Interface
export interface IProfilesService {
  getById(id: string): Promise<ApiProfile | null>;
  update(id: string, data: Partial<ApiProfile>): Promise<ApiProfile>;
  getAll(options?: ApiQueryOptions): Promise<ApiListResult<ApiProfile>>;
}

// User Roles Service Interface
export interface IUserRolesService {
  getByUserId(userId: string): Promise<ApiUserRole[]>;
  hasRole(userId: string, role: 'admin' | 'company_admin' | 'passenger'): Promise<boolean>;
  addRole(userId: string, role: 'admin' | 'company_admin' | 'passenger'): Promise<void>;
  removeRole(userId: string, role: 'admin' | 'company_admin' | 'passenger'): Promise<void>;
}

// Functions Service Interface (for edge functions, serverless, etc.)
export interface IFunctionsService {
  invoke<T = any>(functionName: string, body?: any): Promise<{ data?: T; error?: Error }>;
}

// Payment Service Interface (Paystack - Django-specific)
export interface IPaymentService {
  initializePayment(bookingId: string, email: string, amount: number): Promise<PaystackInitResult>;
  verifyPayment(reference: string): Promise<PaystackVerifyResult>;
}

// Main API Service Interface - Aggregates all services
export interface IApiService {
  auth: IAuthService;
  cities: ICitiesService;
  companies: ICompaniesService;
  buses: IBusesService;
  routes: IRoutesService;
  trips: ITripsService;
  bookings: IBookingsService;
  profiles: IProfilesService;
  userRoles: IUserRolesService;
  functions: IFunctionsService;
  payments?: IPaymentService;
}
