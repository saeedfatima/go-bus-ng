// Supabase to API type mappers

import type {
  ApiUser,
  ApiSession,
  ApiCity,
  ApiCompany,
  ApiBus,
  ApiRoute,
  ApiTrip,
  ApiBooking,
  ApiPassenger,
  ApiProfile,
  ApiUserRole,
} from '../types';
import type { User, Session } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';

export const mapSupabaseUser = (user: User): ApiUser => ({
  id: user.id,
  email: user.email || '',
  fullName: user.user_metadata?.full_name,
  phone: user.user_metadata?.phone,
  createdAt: user.created_at,
});

export const mapSupabaseSession = (session: Session): ApiSession => ({
  accessToken: session.access_token,
  refreshToken: session.refresh_token,
  expiresAt: session.expires_at,
  user: mapSupabaseUser(session.user),
});

export const mapSupabaseCity = (city: Tables<'cities'>): ApiCity => ({
  id: city.id,
  name: city.name,
  state: city.state,
});

export const mapSupabaseCompany = (company: Tables<'companies'>): ApiCompany => ({
  id: company.id,
  name: company.name,
  description: company.description || undefined,
  logoUrl: company.logo_url || undefined,
  rating: company.rating || 0,
  totalTrips: company.total_trips || 0,
  isVerified: company.is_verified || false,
  ownerId: company.owner_id,
  createdAt: company.created_at,
  updatedAt: company.updated_at,
});

export const mapSupabaseBus = (bus: Tables<'buses'>): ApiBus => ({
  id: bus.id,
  companyId: bus.company_id,
  plateNumber: bus.plate_number,
  busType: bus.bus_type,
  totalSeats: bus.total_seats,
  amenities: bus.amenities || [],
  isActive: bus.is_active || true,
  createdAt: bus.created_at,
  updatedAt: bus.updated_at,
});

export const mapSupabaseRoute = (route: any): ApiRoute => ({
  id: route.id,
  companyId: route.company_id,
  originCityId: route.origin_city_id,
  destinationCityId: route.destination_city_id,
  originCity: route.origin_city ? mapSupabaseCity(route.origin_city) : undefined,
  destinationCity: route.destination_city ? mapSupabaseCity(route.destination_city) : undefined,
  basePrice: route.base_price,
  durationHours: route.duration_hours,
  isActive: route.is_active || true,
  createdAt: route.created_at,
  updatedAt: route.updated_at,
});

export const mapSupabaseTrip = (trip: any): ApiTrip => ({
  id: trip.id,
  routeId: trip.route_id,
  busId: trip.bus_id,
  departureTime: trip.departure_time,
  arrivalTime: trip.arrival_time,
  price: trip.price,
  availableSeats: trip.available_seats,
  status: trip.status,
  route: trip.routes ? mapSupabaseRoute(trip.routes) : undefined,
  bus: trip.buses ? mapSupabaseBus(trip.buses) : undefined,
  company: trip.buses?.companies ? mapSupabaseCompany(trip.buses.companies) : undefined,
  createdAt: trip.created_at,
  updatedAt: trip.updated_at,
});

export const mapSupabasePassenger = (passenger: Tables<'booking_passengers'>): ApiPassenger => ({
  id: passenger.id,
  bookingId: passenger.booking_id,
  fullName: passenger.full_name,
  phone: passenger.phone,
  email: passenger.email || undefined,
  nin: passenger.nin || undefined,
  seatNumber: passenger.seat_number,
  createdAt: passenger.created_at,
});

export const mapSupabaseBooking = (booking: any): ApiBooking => ({
  id: booking.id,
  tripId: booking.trip_id,
  userId: booking.user_id,
  seats: booking.seats,
  totalAmount: booking.total_amount,
  passengerName: booking.passenger_name,
  passengerEmail: booking.passenger_email,
  passengerPhone: booking.passenger_phone,
  ticketCode: booking.ticket_code,
  status: booking.status,
  holdExpiresAt: booking.hold_expires_at || undefined,
  paymentCompletedAt: booking.payment_completed_at || undefined,
  cancelledAt: booking.cancelled_at || undefined,
  cancellationReason: booking.cancellation_reason || undefined,
  trip: booking.trips ? mapSupabaseTrip(booking.trips) : undefined,
  createdAt: booking.created_at,
  updatedAt: booking.updated_at,
});

export const mapSupabaseProfile = (profile: Tables<'profiles'>): ApiProfile => ({
  id: profile.id,
  fullName: profile.full_name || undefined,
  phone: profile.phone || undefined,
  createdAt: profile.created_at,
  updatedAt: profile.updated_at,
});

export const mapSupabaseUserRole = (role: Tables<'user_roles'>): ApiUserRole => ({
  id: role.id,
  userId: role.user_id,
  role: role.role,
});
