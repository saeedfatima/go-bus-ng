export interface City {
  id: number;
  name: string;
  state: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Company {
  id: number;
  name: string;
  logo: string;
  rating: number;
  total_trips: number;
  is_verified: boolean;
}

export interface Bus {
  id: number;
  company: number; // ID
  plate_number: string;
  bus_type: 'standard' | 'luxury' | 'executive';
  total_seats: number;
  amenities: string[];
}

export interface Route {
  id: number;
  company: number; // ID
  origin: City;
  destination: City;
  base_price: number;
  duration_hours: number;
}

export interface Trip {
  id: number;
  route: Route;
  bus: Bus;
  company: Company;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled';
}

export interface Seat {
  id: string;
  number: string;
  row: number;
  column: number;
  is_available: boolean;
  is_selected: boolean;
  type: 'standard' | 'premium';
}

export interface Booking {
  id: number;
  trip: number; // ID
  user: number; // ID
  seats: string[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  ticket_code: string;
  created_at: string;
}

export interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}
