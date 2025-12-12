import { City, Company, Trip } from '@/types';

export const cities: City[] = [
  { id: '1', name: 'Lagos', state: 'Lagos' },
  { id: '2', name: 'Abuja', state: 'FCT' },
  { id: '3', name: 'Kano', state: 'Kano' },
  { id: '4', name: 'Port Harcourt', state: 'Rivers' },
  { id: '5', name: 'Kaduna', state: 'Kaduna' },
  { id: '6', name: 'Ibadan', state: 'Oyo' },
  { id: '7', name: 'Benin City', state: 'Edo' },
  { id: '8', name: 'Enugu', state: 'Enugu' },
  { id: '9', name: 'Calabar', state: 'Cross River' },
  { id: '10', name: 'Owerri', state: 'Imo' },
];

export const companies: Company[] = [
  {
    id: '1',
    name: 'ABC Transport',
    logo: '🚌',
    rating: 4.5,
    totalTrips: 15000,
    isVerified: true,
  },
  {
    id: '2',
    name: 'God is Good Motors',
    logo: '🚍',
    rating: 4.3,
    totalTrips: 12000,
    isVerified: true,
  },
  {
    id: '3',
    name: 'Peace Mass Transit',
    logo: '🚐',
    rating: 4.1,
    totalTrips: 18000,
    isVerified: true,
  },
  {
    id: '4',
    name: 'Chisco Transport',
    logo: '🚎',
    rating: 4.4,
    totalTrips: 10000,
    isVerified: true,
  },
  {
    id: '5',
    name: 'Young Shall Grow',
    logo: '🚌',
    rating: 4.0,
    totalTrips: 8000,
    isVerified: true,
  },
];

export const generateTrips = (origin: string, destination: string, date: string): Trip[] => {
  const baseTrips: Trip[] = companies.map((company, index) => ({
    id: `trip-${company.id}-${index}`,
    route: {
      id: `route-${index}`,
      companyId: company.id,
      origin: cities.find(c => c.name === origin) || cities[0],
      destination: cities.find(c => c.name === destination) || cities[1],
      basePrice: 8000 + Math.random() * 7000,
      durationHours: 6 + Math.floor(Math.random() * 4),
    },
    bus: {
      id: `bus-${index}`,
      companyId: company.id,
      plateNumber: `LAG-${Math.floor(Math.random() * 900) + 100}-XY`,
      busType: ['standard', 'luxury', 'executive'][Math.floor(Math.random() * 3)] as 'standard' | 'luxury' | 'executive',
      totalSeats: [48, 32, 24][Math.floor(Math.random() * 3)],
      amenities: ['AC', 'WiFi', 'USB Charging', 'Snacks'].slice(0, Math.floor(Math.random() * 4) + 1),
    },
    company,
    departureTime: `${date}T${String(6 + index * 2).padStart(2, '0')}:00:00`,
    arrivalTime: `${date}T${String(12 + index * 2).padStart(2, '0')}:00:00`,
    price: Math.floor(8000 + Math.random() * 7000),
    availableSeats: Math.floor(Math.random() * 20) + 5,
    status: 'scheduled',
  }));

  return baseTrips;
};

export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};
