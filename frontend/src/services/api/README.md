# API Service Layer

A backend-agnostic API abstraction layer that allows easy switching between different backend implementations.

## Supported Backends

1. **Supabase** (default) - PostgreSQL + Auth + Edge Functions
2. **Django** - Django REST Framework with JWT
3. **PHP/MySQL** - Traditional PHP API with MySQL

## Configuration

Set the backend in your `.env` file:

```env
# Choose backend: 'supabase' | 'django' | 'php'
VITE_API_BACKEND=supabase

# Django configuration (if using Django)
VITE_DJANGO_API_URL=http://localhost:8000/api/v1

# PHP configuration (if using PHP)
VITE_PHP_API_URL=http://localhost/api
```

## Usage

### Basic Usage

```typescript
import { api } from '@/services/api';

// Authentication
const { user, error } = await api.auth.signIn('email@example.com', 'password');
await api.auth.signOut();

// Fetch data
const cities = await api.cities.getAll();
const trip = await api.trips.getById('trip-id');

// Create booking
const booking = await api.bookings.create({
  tripId: 'trip-id',
  seats: ['A1', 'A2'],
  totalAmount: 5000,
  passengerName: 'John Doe',
  passengerEmail: 'john@example.com',
  passengerPhone: '08012345678',
}, userId);

// Check user role
const isAdmin = await api.userRoles.hasRole(userId, 'admin');
```

### Available Services

| Service | Description |
|---------|-------------|
| `api.auth` | Authentication (signIn, signUp, signOut, password reset) |
| `api.cities` | City management |
| `api.companies` | Company CRUD operations |
| `api.buses` | Bus fleet management |
| `api.routes` | Route management |
| `api.trips` | Trip scheduling and search |
| `api.bookings` | Booking management |
| `api.profiles` | User profile management |
| `api.userRoles` | Role-based access control |
| `api.functions` | Backend functions/webhooks |

## Architecture

```
src/services/api/
├── index.ts          # Factory & exports
├── types.ts          # Shared type definitions
├── interfaces.ts     # Service interfaces
├── supabase/
│   ├── index.ts      # Supabase implementation
│   └── mappers.ts    # Supabase → API type mappers
├── django/
│   └── index.ts      # Django REST implementation
└── php/
    └── index.ts      # PHP/MySQL implementation
```

## Adding a New Backend

1. Create a new folder under `src/services/api/`
2. Implement all interfaces from `interfaces.ts`
3. Add the backend to the factory in `index.ts`
4. Update the `BackendType` type

## Type Safety

All backends return the same API types defined in `types.ts`:

- `ApiUser`, `ApiSession` - Authentication
- `ApiCity`, `ApiCompany`, `ApiBus`, `ApiRoute`, `ApiTrip` - Core entities
- `ApiBooking`, `ApiPassenger` - Booking data
- `ApiProfile`, `ApiUserRole` - User management

## Django Backend Setup

See `docs/DJANGO_BACKEND_STRUCTURE.md` for complete Django setup including:
- Models and serializers
- API views with `@api_view` decorators
- JWT authentication
- Testing suite

## PHP Backend Setup

Create the following directory structure:

```
api/
├── auth/
│   ├── login.php
│   ├── register.php
│   ├── logout.php
│   └── me.php
├── cities/
│   ├── list.php
│   └── get.php
├── companies/
│   ├── list.php
│   ├── get.php
│   ├── create.php
│   └── update.php
├── buses/
│   └── ...
├── routes/
│   └── ...
├── trips/
│   ├── list.php
│   ├── get.php
│   ├── search.php
│   ├── create.php
│   └── update.php
├── bookings/
│   └── ...
├── profiles/
│   └── ...
└── user-roles/
    └── ...
```

Each endpoint should return JSON with this structure:

```json
{
  "success": true,
  "data": { ... }
}
```

Or for errors:

```json
{
  "success": false,
  "message": "Error description"
}
```
