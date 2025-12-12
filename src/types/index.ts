export interface City {
  id: string;
  name: string;
  state: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  rating: number;
  totalTrips: number;
  isVerified: boolean;
}

export interface Bus {
  id: string;
  companyId: string;
  plateNumber: string;
  busType: 'standard' | 'luxury' | 'executive';
  totalSeats: number;
  amenities: string[];
}

export interface Route {
  id: string;
  companyId: string;
  origin: City;
  destination: City;
  basePrice: number;
  durationHours: number;
}

export interface Trip {
  id: string;
  route: Route;
  bus: Bus;
  company: Company;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled';
}

export interface Seat {
  id: string;
  number: string;
  row: number;
  column: number;
  isAvailable: boolean;
  isSelected: boolean;
  type: 'standard' | 'premium';
}

export interface Booking {
  id: string;
  tripId: string;
  userId: string;
  seats: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  ticketCode: string;
  createdAt: string;
}

export interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}
