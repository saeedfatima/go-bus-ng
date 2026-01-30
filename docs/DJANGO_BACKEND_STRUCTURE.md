# Django Backend Structure for Bus Booking System

This document outlines the complete Django REST Framework backend structure designed to integrate seamlessly with the React frontend. The API contract aligns with `src/services/api/interfaces.ts` and `src/services/api/types.ts`.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Frontend Integration Contract](#frontend-integration-contract)
3. [API Response Format Standards](#api-response-format-standards)
4. [Project Structure](#project-structure)
5. [Requirements](#requirements)
6. [Settings Configuration](#settings-configuration)
7. [Models](#models)
8. [Serializers](#serializers)
9. [Views](#views)
10. [URL Configuration](#url-configuration)
11. [API Endpoints Summary](#api-endpoints-summary)
12. [Background Tasks](#background-tasks)
13. [Testing](#testing)
14. [Production Deployment](#production-deployment)

---

## Quick Start

### Prerequisites
- Python 3.10+
- pip (Python package manager)

### Installation

```bash
# 1. Create project directory
mkdir bus_booking_backend && cd bus_booking_backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create environment file
cp .env.example .env
# Edit .env with your DJANGO_SECRET_KEY

# 5. Run migrations
python manage.py migrate

# 6. Create superuser (optional)
python manage.py createsuperuser

# 7. Load sample data (optional)
python manage.py loaddata fixtures/sample_data.json

# 8. Run development server
python manage.py runserver
```

### Access Points
- **API Base**: http://localhost:8000/api/v1/
- **Admin Panel**: http://localhost:8000/admin/
- **Swagger Docs**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/

---

## Frontend Integration Contract

This section defines the exact contract between the Django backend and the React frontend. The frontend expects responses that match the interfaces defined in `src/services/api/types.ts`.

### Field Naming Convention

The frontend uses **camelCase** while Django uses **snake_case**. The frontend client (`src/services/api/django/index.ts`) handles the mapping.

| Frontend (camelCase) | Django (snake_case) |
|---------------------|---------------------|
| `fullName` | `full_name` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |
| `logoUrl` | `logo_url` |
| `totalTrips` | `total_trips` |
| `isVerified` | `is_verified` |
| `ownerId` | `owner_id` |
| `companyId` | `company_id` |
| `plateNumber` | `plate_number` |
| `busType` | `bus_type` |
| `totalSeats` | `total_seats` |
| `isActive` | `is_active` |
| `originCityId` | `origin_city_id` |
| `destinationCityId` | `destination_city_id` |
| `originCity` | `origin_city` |
| `destinationCity` | `destination_city` |
| `basePrice` | `base_price` |
| `durationHours` | `duration_hours` |
| `routeId` | `route_id` |
| `busId` | `bus_id` |
| `departureTime` | `departure_time` |
| `arrivalTime` | `arrival_time` |
| `availableSeats` | `available_seats` |
| `tripId` | `trip_id` |
| `userId` | `user_id` |
| `totalAmount` | `total_amount` |
| `passengerName` | `passenger_name` |
| `passengerEmail` | `passenger_email` |
| `passengerPhone` | `passenger_phone` |
| `ticketCode` | `ticket_code` |
| `holdExpiresAt` | `hold_expires_at` |
| `paymentCompletedAt` | `payment_completed_at` |
| `cancelledAt` | `cancelled_at` |
| `cancellationReason` | `cancellation_reason` |
| `bookingId` | `booking_id` |
| `seatNumber` | `seat_number` |

### Required Response Structures

#### ApiUser (Authentication)
```json
{
  "id": "uuid",
  "email": "string",
  "full_name": "string | null",
  "phone": "string | null",
  "created_at": "ISO8601 datetime"
}
```

#### ApiSession (Login/Register Response)
```json
{
  "access": "JWT access token",
  "refresh": "JWT refresh token",
  "user": { /* ApiUser object */ }
}
```

#### ApiCity
```json
{
  "id": "uuid",
  "name": "string",
  "state": "string"
}
```

#### ApiCompany
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "logo_url": "string | null",
  "rating": "number (0-5)",
  "total_trips": "integer",
  "is_verified": "boolean",
  "owner_id": "uuid",
  "created_at": "ISO8601 datetime",
  "updated_at": "ISO8601 datetime"
}
```

#### ApiBus
```json
{
  "id": "uuid",
  "company_id": "uuid",
  "plate_number": "string",
  "bus_type": "standard | luxury | executive",
  "total_seats": "integer",
  "amenities": ["string array"],
  "is_active": "boolean",
  "created_at": "ISO8601 datetime",
  "updated_at": "ISO8601 datetime"
}
```

#### ApiRoute
```json
{
  "id": "uuid",
  "company_id": "uuid",
  "origin_city_id": "uuid",
  "destination_city_id": "uuid",
  "origin_city": { /* ApiCity object */ },
  "destination_city": { /* ApiCity object */ },
  "base_price": "decimal",
  "duration_hours": "decimal",
  "is_active": "boolean",
  "created_at": "ISO8601 datetime",
  "updated_at": "ISO8601 datetime"
}
```

#### ApiTrip
```json
{
  "id": "uuid",
  "route_id": "uuid",
  "bus_id": "uuid",
  "departure_time": "ISO8601 datetime",
  "arrival_time": "ISO8601 datetime",
  "price": "decimal",
  "available_seats": "integer",
  "status": "scheduled | boarding | departed | arrived | cancelled",
  "route": { /* ApiRoute object */ },
  "bus": { /* ApiBus object */ },
  "company": { /* ApiCompany object */ },
  "created_at": "ISO8601 datetime",
  "updated_at": "ISO8601 datetime"
}
```

#### ApiBooking
```json
{
  "id": "uuid",
  "trip_id": "uuid",
  "user_id": "uuid",
  "seats": ["string array"],
  "total_amount": "decimal",
  "passenger_name": "string",
  "passenger_email": "string",
  "passenger_phone": "string",
  "ticket_code": "string",
  "status": "pending | confirmed | cancelled | expired",
  "hold_expires_at": "ISO8601 datetime | null",
  "payment_completed_at": "ISO8601 datetime | null",
  "cancelled_at": "ISO8601 datetime | null",
  "cancellation_reason": "string | null",
  "trip": { /* ApiTrip object */ },
  "passengers": [{ /* ApiPassenger objects */ }],
  "created_at": "ISO8601 datetime",
  "updated_at": "ISO8601 datetime"
}
```

#### ApiPassenger
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "full_name": "string",
  "phone": "string",
  "email": "string | null",
  "nin": "string | null",
  "seat_number": "string",
  "created_at": "ISO8601 datetime"
}
```

#### ApiProfile
```json
{
  "id": "uuid",
  "full_name": "string | null",
  "phone": "string | null",
  "created_at": "ISO8601 datetime",
  "updated_at": "ISO8601 datetime"
}
```

#### ApiUserRole
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "role": "admin | company_admin | passenger"
}
```

---

## API Response Format Standards

### Paginated List Response
All list endpoints return paginated responses:

```json
{
  "count": 100,
  "current_page": 1,
  "page_size": 10,
  "total_pages": 10,
  "next": "http://api/endpoint/?page=2",
  "previous": null,
  "results": [/* array of items */]
}
```

**Frontend mapping** (`ApiListResult<T>`):
- `count` → `total`
- `current_page` → `page`
- `page_size` → `limit`
- `results` → `data`

### Error Response
```json
{
  "error": "Human-readable error message",
  "detail": "Optional detailed explanation"
}
```

For validation errors:
```json
{
  "field_name": ["Error message 1", "Error message 2"],
  "another_field": ["Error message"]
}
```

### Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `page` | Page number (1-indexed) | `?page=2` |
| `page_size` | Items per page (max 100) | `?page_size=20` |
| `ordering` | Sort field, prefix `-` for desc | `?ordering=-created_at` |
| `search` | Search term | `?search=lagos` |

---

## Project Structure

```
bus_booking_backend/
├── manage.py
├── requirements.txt
├── .env.example
├── pytest.ini
├── db.sqlite3                      # SQLite database file
├── bus_booking/                    # Main project directory
│   ├── __init__.py
│   ├── settings.py
│   ├── settings_test.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── __init__.py
│   ├── accounts/                   # User management
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   └── tests.py
│   ├── companies/                  # Company management
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests.py
│   ├── buses/                      # Bus management
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests.py
│   ├── routes/                     # Route management
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests.py
│   ├── trips/                      # Trip management
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests.py
│   ├── bookings/                   # Booking management
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── management/
│   │   │   └── commands/
│   │   │       ├── expire_bookings.py
│   │   │       └── send_reminders.py
│   │   └── tests.py
│   ├── cities/                     # City management
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests.py
│   └── profiles/                   # User profiles
│       ├── __init__.py
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       └── tests.py
├── utils/
│   ├── __init__.py
│   ├── pagination.py
│   └── permissions.py
├── fixtures/
│   └── sample_data.json
└── tests/
    ├── conftest.py
    ├── test_unit/
    ├── test_integration/
    └── test_e2e/
```

---

## Requirements (requirements.txt)

```txt
Django>=4.2,<5.0
djangorestframework>=3.14.0
django-cors-headers>=4.3.0
django-filter>=23.5
djangorestframework-simplejwt>=5.3.0
drf-yasg>=1.21.7
python-dotenv>=1.0.0
Pillow>=10.1.0
gunicorn>=21.2.0

# Testing
pytest>=7.4.0
pytest-django>=4.5.0
pytest-cov>=4.1.0
pytest-xdist>=3.5.0
```

---

## Settings Configuration (bus_booking/settings.py)

```python
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'your-dev-secret-key-change-in-production')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_yasg',
    # Local apps
    'apps.accounts',
    'apps.companies',
    'apps.buses',
    'apps.routes',
    'apps.trips',
    'apps.bookings',
    'apps.cities',
    'apps.profiles',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'bus_booking.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'bus_booking.wsgi.application'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'utils.pagination.StandardResultsPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

AUTH_USER_MODEL = 'accounts.User'

# Database - SQLite (default for development)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# CORS - Allow frontend origins
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ORIGINS', 
    'http://localhost:3000,http://localhost:5173,http://localhost:8080'
).split(',')
CORS_ALLOW_CREDENTIALS = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email (console backend for development)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@busbooking.com')
```

---

## Models

### 1. Accounts App (apps/accounts/models.py)

```python
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return self.email


class AppRole(models.TextChoices):
    ADMIN = 'admin', 'Admin'
    COMPANY_ADMIN = 'company_admin', 'Company Admin'
    PASSENGER = 'passenger', 'Passenger'


class UserRole(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roles')
    role = models.CharField(max_length=20, choices=AppRole.choices)

    class Meta:
        db_table = 'user_roles'
        unique_together = ['user', 'role']

    def __str__(self):
        return f"{self.user.email} - {self.role}"
```

### 2. Profiles App (apps/profiles/models.py)

```python
import uuid
from django.db import models
from apps.accounts.models import User


class Profile(models.Model):
    """
    Separate profile model for additional user data.
    Matches frontend ApiProfile interface.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'profiles'

    def __str__(self):
        return f"Profile: {self.user.email}"
```

### 3. Cities App (apps/cities/models.py)

```python
import uuid
from django.db import models


class City(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cities'
        ordering = ['name']
        verbose_name_plural = 'Cities'

    def __str__(self):
        return f"{self.name}, {self.state}"
```

### 4. Companies App (apps/companies/models.py)

```python
import uuid
from django.db import models
from apps.accounts.models import User


class Company(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    logo_url = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_trips = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='companies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'companies'
        ordering = ['-created_at']
        verbose_name_plural = 'Companies'

    def __str__(self):
        return self.name
```

### 5. Buses App (apps/buses/models.py)

```python
import uuid
from django.db import models
from apps.companies.models import Company


class BusType(models.TextChoices):
    STANDARD = 'standard', 'Standard'
    LUXURY = 'luxury', 'Luxury'
    EXECUTIVE = 'executive', 'Executive'


class Bus(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='buses')
    plate_number = models.CharField(max_length=20, unique=True)
    bus_type = models.CharField(max_length=20, choices=BusType.choices, default=BusType.STANDARD)
    total_seats = models.IntegerField(default=48)
    amenities = models.JSONField(default=list, blank=True)  # Database-agnostic
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'buses'
        ordering = ['-created_at']
        verbose_name_plural = 'Buses'

    def __str__(self):
        return f"{self.plate_number} - {self.company.name}"
```

### 6. Routes App (apps/routes/models.py)

```python
import uuid
from django.db import models
from apps.companies.models import Company
from apps.cities.models import City


class Route(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='routes')
    origin_city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='origin_routes')
    destination_city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='destination_routes')
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_hours = models.DecimalField(max_digits=5, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'routes'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.origin_city.name} → {self.destination_city.name}"
```

### 7. Trips App (apps/trips/models.py)

```python
import uuid
from django.db import models
from apps.routes.models import Route
from apps.buses.models import Bus


class TripStatus(models.TextChoices):
    SCHEDULED = 'scheduled', 'Scheduled'
    BOARDING = 'boarding', 'Boarding'
    DEPARTED = 'departed', 'Departed'
    ARRIVED = 'arrived', 'Arrived'
    CANCELLED = 'cancelled', 'Cancelled'


class Trip(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='trips')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='trips')
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    available_seats = models.IntegerField()
    status = models.CharField(max_length=20, choices=TripStatus.choices, default=TripStatus.SCHEDULED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trips'
        ordering = ['departure_time']

    def __str__(self):
        return f"{self.route} - {self.departure_time}"

    @property
    def company(self):
        return self.route.company
```

### 8. Bookings App (apps/bookings/models.py)

```python
import uuid
import random
import string
from django.db import models
from apps.accounts.models import User
from apps.trips.models import Trip


class BookingStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    CONFIRMED = 'confirmed', 'Confirmed'
    CANCELLED = 'cancelled', 'Cancelled'
    EXPIRED = 'expired', 'Expired'


def generate_ticket_code():
    """Generate unique ticket code matching frontend format: NB-XXXXXXXX"""
    chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return 'NB-' + ''.join(random.choices(chars, k=8))


class Booking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    seats = models.JSONField(default=list)  # Array of seat numbers
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=BookingStatus.choices, default=BookingStatus.PENDING)
    ticket_code = models.CharField(max_length=20, unique=True, default=generate_ticket_code)
    passenger_name = models.CharField(max_length=255)
    passenger_phone = models.CharField(max_length=20)
    passenger_email = models.EmailField()
    hold_expires_at = models.DateTimeField(blank=True, null=True)
    payment_completed_at = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    cancellation_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.ticket_code} - {self.passenger_name}"


class BookingPassenger(models.Model):
    """Individual passengers for multi-passenger bookings"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='passengers')
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    nin = models.CharField(max_length=20, blank=True, null=True)  # National ID Number
    seat_number = models.CharField(max_length=5)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'booking_passengers'
        unique_together = ['booking', 'seat_number']

    def __str__(self):
        return f"{self.full_name} - Seat {self.seat_number}"
```

---

## Serializers

### 1. Accounts Serializers (apps/accounts/serializers.py)

```python
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserRole, AppRole
from apps.profiles.models import Profile


class RegisterSerializer(serializers.ModelSerializer):
    """
    Registration serializer matching frontend signUp interface.
    Creates user, profile, and assigns passenger role.
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'full_name', 'phone']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match'})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        # Assign default passenger role
        UserRole.objects.create(user=user, role=AppRole.PASSENGER)
        # Create profile
        Profile.objects.create(
            user=user,
            full_name=user.full_name,
            phone=user.phone
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled')
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    """Matches frontend ApiUser interface"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'created_at']


class UserRoleSerializer(serializers.ModelSerializer):
    """Matches frontend ApiUserRole interface"""
    user_id = serializers.UUIDField(source='user.id', read_only=True)

    class Meta:
        model = UserRole
        fields = ['id', 'user_id', 'role']
```

### 2. Profiles Serializers (apps/profiles/serializers.py)

```python
from rest_framework import serializers
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    """Matches frontend ApiProfile interface"""

    class Meta:
        model = Profile
        fields = ['id', 'full_name', 'phone', 'created_at', 'updated_at']
```

### 3. Cities Serializers (apps/cities/serializers.py)

```python
from rest_framework import serializers
from .models import City


class CitySerializer(serializers.ModelSerializer):
    """Matches frontend ApiCity interface"""
    
    class Meta:
        model = City
        fields = ['id', 'name', 'state']
```

### 4. Companies Serializers (apps/companies/serializers.py)

```python
from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    """Matches frontend ApiCompany interface"""
    owner_id = serializers.UUIDField(source='owner.id', read_only=True)

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'logo_url', 'description', 'rating',
            'total_trips', 'is_verified', 'owner_id', 'created_at', 'updated_at'
        ]


class CompanyCreateSerializer(serializers.ModelSerializer):
    """For creating companies - matches frontend CreateCompanyDto"""
    
    class Meta:
        model = Company
        fields = ['name', 'logo_url', 'description']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
```

### 5. Buses Serializers (apps/buses/serializers.py)

```python
from rest_framework import serializers
from .models import Bus


class BusSerializer(serializers.ModelSerializer):
    """Matches frontend ApiBus interface"""
    company_id = serializers.UUIDField(source='company.id', read_only=True)

    class Meta:
        model = Bus
        fields = [
            'id', 'company_id', 'plate_number', 'bus_type',
            'total_seats', 'amenities', 'is_active', 'created_at', 'updated_at'
        ]


class BusCreateSerializer(serializers.ModelSerializer):
    """For creating buses - matches frontend CreateBusDto"""
    company_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Bus
        fields = ['company_id', 'plate_number', 'bus_type', 'total_seats', 'amenities']
    
    def create(self, validated_data):
        company_id = validated_data.pop('company_id')
        validated_data['company_id'] = company_id
        return super().create(validated_data)
```

### 6. Routes Serializers (apps/routes/serializers.py)

```python
from rest_framework import serializers
from .models import Route
from apps.cities.serializers import CitySerializer


class RouteSerializer(serializers.ModelSerializer):
    """Matches frontend ApiRoute interface"""
    origin_city = CitySerializer(read_only=True)
    destination_city = CitySerializer(read_only=True)
    origin_city_id = serializers.UUIDField(source='origin_city.id', read_only=True)
    destination_city_id = serializers.UUIDField(source='destination_city.id', read_only=True)
    company_id = serializers.UUIDField(source='company.id', read_only=True)

    class Meta:
        model = Route
        fields = [
            'id', 'company_id', 'origin_city', 'destination_city',
            'origin_city_id', 'destination_city_id',
            'base_price', 'duration_hours', 'is_active', 'created_at', 'updated_at'
        ]


class RouteCreateSerializer(serializers.ModelSerializer):
    """For creating routes - matches frontend CreateRouteDto"""
    company_id = serializers.UUIDField(write_only=True)
    origin_city_id = serializers.UUIDField(write_only=True)
    destination_city_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Route
        fields = ['company_id', 'origin_city_id', 'destination_city_id', 'base_price', 'duration_hours']
```

### 7. Trips Serializers (apps/trips/serializers.py)

```python
from rest_framework import serializers
from .models import Trip
from apps.routes.serializers import RouteSerializer
from apps.buses.serializers import BusSerializer
from apps.companies.serializers import CompanySerializer


class TripSerializer(serializers.ModelSerializer):
    """Matches frontend ApiTrip interface"""
    route = RouteSerializer(read_only=True)
    bus = BusSerializer(read_only=True)
    company = serializers.SerializerMethodField()
    route_id = serializers.UUIDField(source='route.id', read_only=True)
    bus_id = serializers.UUIDField(source='bus.id', read_only=True)

    class Meta:
        model = Trip
        fields = [
            'id', 'route', 'bus', 'company', 'route_id', 'bus_id',
            'departure_time', 'arrival_time', 'price',
            'available_seats', 'status', 'created_at', 'updated_at'
        ]

    def get_company(self, obj):
        if obj.route and obj.route.company:
            return CompanySerializer(obj.route.company).data
        return None


class TripCreateSerializer(serializers.ModelSerializer):
    """For creating trips - matches frontend CreateTripDto"""
    route_id = serializers.UUIDField(write_only=True)
    bus_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Trip
        fields = ['route_id', 'bus_id', 'departure_time', 'arrival_time', 'price', 'available_seats']
    
    def create(self, validated_data):
        route_id = validated_data.pop('route_id')
        bus_id = validated_data.pop('bus_id')
        validated_data['route_id'] = route_id
        validated_data['bus_id'] = bus_id
        return super().create(validated_data)


class TripSearchSerializer(serializers.ModelSerializer):
    """Lightweight serializer for search results"""
    origin_city = serializers.CharField(source='route.origin_city.name')
    destination_city = serializers.CharField(source='route.destination_city.name')
    company_name = serializers.CharField(source='route.company.name')
    company_logo = serializers.URLField(source='route.company.logo_url')
    bus_type = serializers.CharField(source='bus.bus_type')
    amenities = serializers.JSONField(source='bus.amenities')

    class Meta:
        model = Trip
        fields = [
            'id', 'origin_city', 'destination_city', 'company_name', 'company_logo',
            'departure_time', 'arrival_time', 'price', 'available_seats',
            'bus_type', 'amenities', 'status'
        ]
```

### 8. Bookings Serializers (apps/bookings/serializers.py)

```python
from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Booking, BookingPassenger
from apps.trips.serializers import TripSerializer


class BookingPassengerSerializer(serializers.ModelSerializer):
    """Matches frontend ApiPassenger interface"""
    booking_id = serializers.UUIDField(source='booking.id', read_only=True)

    class Meta:
        model = BookingPassenger
        fields = ['id', 'booking_id', 'full_name', 'phone', 'email', 'nin', 'seat_number', 'created_at']


class BookingPassengerCreateSerializer(serializers.Serializer):
    """For creating passengers in booking - matches frontend CreateBookingDto.passengers"""
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField(required=False, allow_null=True)
    nin = serializers.CharField(max_length=20, required=False, allow_null=True)
    seat_number = serializers.CharField(max_length=5)


class BookingSerializer(serializers.ModelSerializer):
    """Matches frontend ApiBooking interface"""
    trip = TripSerializer(read_only=True)
    passengers = BookingPassengerSerializer(many=True, read_only=True)
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    trip_id = serializers.UUIDField(source='trip.id', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'trip', 'trip_id', 'user_id', 'seats', 'total_amount', 'status',
            'ticket_code', 'passenger_name', 'passenger_phone', 'passenger_email',
            'hold_expires_at', 'payment_completed_at', 'cancelled_at',
            'cancellation_reason', 'passengers', 'created_at', 'updated_at'
        ]


class BookingCreateSerializer(serializers.Serializer):
    """For creating bookings - matches frontend CreateBookingDto"""
    trip_id = serializers.UUIDField()
    seats = serializers.ListField(child=serializers.CharField())
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    passenger_name = serializers.CharField(max_length=255)
    passenger_email = serializers.EmailField()
    passenger_phone = serializers.CharField(max_length=20)
    passengers = BookingPassengerCreateSerializer(many=True, required=False)

    def create(self, validated_data):
        from apps.trips.models import Trip
        
        passengers_data = validated_data.pop('passengers', [])
        trip = Trip.objects.get(id=validated_data['trip_id'])
        
        # Set hold expiration (15 minutes)
        hold_expires_at = timezone.now() + timedelta(minutes=15)
        
        booking = Booking.objects.create(
            trip=trip,
            user=self.context['request'].user,
            seats=validated_data['seats'],
            total_amount=validated_data['total_amount'],
            passenger_name=validated_data['passenger_name'],
            passenger_email=validated_data['passenger_email'],
            passenger_phone=validated_data['passenger_phone'],
            hold_expires_at=hold_expires_at
        )
        
        # Create passengers
        for passenger_data in passengers_data:
            BookingPassenger.objects.create(booking=booking, **passenger_data)
        
        # Update available seats
        trip.available_seats -= len(validated_data['seats'])
        trip.save()
        
        return booking
```

---

## Views

### 1. Accounts Views (apps/accounts/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, UserRole, AppRole
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UserRoleSerializer
from utils.permissions import IsAdmin


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    POST /api/v1/auth/register/
    Register a new user - matches frontend signUp interface
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    POST /api/v1/auth/login/
    Login user and return JWT tokens - matches frontend signIn interface
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    POST /api/v1/auth/logout/
    Logout user by blacklisting refresh token
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logged out successfully'})
    except Exception:
        return Response({'message': 'Logged out'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    GET /api/v1/auth/me/
    Get current authenticated user - matches frontend getSession interface
    """
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset(request):
    """
    POST /api/v1/auth/password-reset/
    Request password reset email - matches frontend resetPasswordForEmail
    """
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Always return success (security best practice)
    return Response({'message': 'Password reset email sent'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def password_change(request):
    """
    POST /api/v1/auth/password-change/
    Change user password - matches frontend updatePassword
    """
    new_password = request.data.get('new_password')
    old_password = request.data.get('old_password')
    
    if not new_password:
        return Response({'error': 'new_password required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if old_password and not request.user.check_password(old_password):
        return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
    
    request.user.set_password(new_password)
    request.user.save()
    return Response({'message': 'Password changed successfully'})


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification(request):
    """
    POST /api/v1/auth/resend-verification/
    Resend verification email - matches frontend resendVerificationEmail
    """
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # TODO: Implement email sending
    return Response({'message': 'Verification email sent'})


# User Roles endpoints

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_roles(request):
    """
    GET /api/v1/auth/user-roles/?user_id=xxx
    List roles for a user - matches frontend getByUserId
    """
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    roles = UserRole.objects.filter(user_id=user_id)
    return Response(UserRoleSerializer(roles, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_user_role(request):
    """
    GET /api/v1/auth/user-roles/check/?user_id=xxx&role=xxx
    Check if user has specific role - matches frontend hasRole
    """
    user_id = request.query_params.get('user_id')
    role = request.query_params.get('role')
    
    if not user_id or not role:
        return Response({'error': 'user_id and role required'}, status=status.HTTP_400_BAD_REQUEST)
    
    has_role = UserRole.objects.filter(user_id=user_id, role=role).exists()
    return Response({'has_role': has_role})


@api_view(['POST'])
@permission_classes([IsAdmin])
def add_user_role(request):
    """
    POST /api/v1/auth/user-roles/
    Add role to user - matches frontend addRole
    """
    user_id = request.data.get('user_id')
    role = request.data.get('role')
    
    if not user_id or not role:
        return Response({'error': 'user_id and role required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if role not in [r[0] for r in AppRole.choices]:
        return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
    
    user_role, created = UserRole.objects.get_or_create(user_id=user_id, role=role)
    return Response(UserRoleSerializer(user_role).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdmin])
def remove_user_role(request):
    """
    POST /api/v1/auth/user-roles/remove/
    Remove role from user - matches frontend removeRole
    """
    user_id = request.data.get('user_id')
    role = request.data.get('role')
    
    if not user_id or not role:
        return Response({'error': 'user_id and role required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_role = UserRole.objects.get(user_id=user_id, role=role)
        user_role.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except UserRole.DoesNotExist:
        return Response({'error': 'Role not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAdmin])
def list_users(request):
    """
    GET /api/v1/auth/users/
    List all users (Admin only) - matches frontend profiles.getAll
    """
    users = User.objects.all()
    return Response(UserSerializer(users, many=True).data)
```

### 2. Profiles Views (apps/profiles/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Profile
from .serializers import ProfileSerializer
from utils.permissions import IsAdmin
from utils.pagination import StandardResultsPagination


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request, profile_id):
    """
    GET /api/v1/profiles/<id>/
    Get profile by ID - matches frontend profiles.getById
    """
    try:
        profile = Profile.objects.get(id=profile_id)
        return Response(ProfileSerializer(profile).data)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_profile(request):
    """
    GET /api/v1/profiles/me/
    Get current user's profile
    """
    try:
        profile = Profile.objects.get(user=request.user)
        return Response(ProfileSerializer(profile).data)
    except Profile.DoesNotExist:
        profile = Profile.objects.create(user=request.user)
        return Response(ProfileSerializer(profile).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request, profile_id):
    """
    PATCH /api/v1/profiles/<id>/
    Update profile - matches frontend profiles.update
    """
    try:
        profile = Profile.objects.get(id=profile_id)
        
        # Check permission
        if profile.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAdmin])
def list_profiles(request):
    """
    GET /api/v1/profiles/
    List all profiles (Admin only) - matches frontend profiles.getAll
    """
    profiles = Profile.objects.all()
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(profiles, request)
    serializer = ProfileSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)
```

### 3. Cities Views (apps/cities/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import City
from .serializers import CitySerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def list_cities(request):
    """
    GET /api/v1/cities/
    List all cities - matches frontend cities.getAll
    Returns simple array (not paginated) as per interface
    """
    cities = City.objects.all()
    serializer = CitySerializer(cities, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_city(request, city_id):
    """
    GET /api/v1/cities/<id>/
    Get city by ID - matches frontend cities.getById
    """
    try:
        city = City.objects.get(id=city_id)
        return Response(CitySerializer(city).data)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)
```

### 4. Companies Views (apps/companies/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Company
from .serializers import CompanySerializer, CompanyCreateSerializer
from apps.accounts.models import AppRole, UserRole
from utils.permissions import IsAdmin
from utils.pagination import StandardResultsPagination


@api_view(['GET'])
@permission_classes([AllowAny])
def list_companies(request):
    """
    GET /api/v1/companies/
    List companies - matches frontend companies.getAll
    Supports ?owner_id filter for getByOwnerId
    """
    owner_id = request.query_params.get('owner_id')
    
    if owner_id:
        companies = Company.objects.filter(owner_id=owner_id)
    else:
        companies = Company.objects.filter(is_verified=True)
    
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(companies, request)
    serializer = CompanySerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_company(request, company_id):
    """
    GET /api/v1/companies/<id>/
    Get company by ID - matches frontend companies.getById
    """
    try:
        company = Company.objects.get(id=company_id)
        return Response(CompanySerializer(company).data)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_company(request):
    """
    POST /api/v1/companies/
    Create company - matches frontend companies.create
    """
    serializer = CompanyCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        company = serializer.save()
        # Assign company_admin role
        UserRole.objects.get_or_create(user=request.user, role=AppRole.COMPANY_ADMIN)
        return Response(CompanySerializer(company).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_company(request, company_id):
    """
    PATCH /api/v1/companies/<id>/
    Update company - matches frontend companies.update
    """
    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check permission
    if company.owner != request.user and not request.user.roles.filter(role=AppRole.ADMIN).exists():
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = CompanySerializer(company, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### 5. Buses Views (apps/buses/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Bus
from .serializers import BusSerializer, BusCreateSerializer
from apps.accounts.models import AppRole


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_buses(request):
    """
    GET /api/v1/buses/?company_id=xxx
    List buses by company - matches frontend buses.getByCompanyId
    """
    company_id = request.query_params.get('company_id')
    if not company_id:
        return Response({'error': 'company_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    buses = Bus.objects.filter(company_id=company_id)
    serializer = BusSerializer(buses, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_bus(request, bus_id):
    """
    GET /api/v1/buses/<id>/
    Get bus by ID - matches frontend buses.getById
    """
    try:
        bus = Bus.objects.get(id=bus_id)
        return Response(BusSerializer(bus).data)
    except Bus.DoesNotExist:
        return Response({'error': 'Bus not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_bus(request):
    """
    POST /api/v1/buses/
    Create bus - matches frontend buses.create
    """
    serializer = BusCreateSerializer(data=request.data)
    if serializer.is_valid():
        bus = serializer.save()
        return Response(BusSerializer(bus).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_bus(request, bus_id):
    """
    PATCH /api/v1/buses/<id>/
    Update bus - matches frontend buses.update
    """
    try:
        bus = Bus.objects.get(id=bus_id)
    except Bus.DoesNotExist:
        return Response({'error': 'Bus not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = BusSerializer(bus, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_bus(request, bus_id):
    """
    DELETE /api/v1/buses/<id>/
    Delete bus - matches frontend buses.delete
    """
    try:
        bus = Bus.objects.get(id=bus_id)
        bus.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Bus.DoesNotExist:
        return Response({'error': 'Bus not found'}, status=status.HTTP_404_NOT_FOUND)
```

### 6. Routes Views (apps/routes/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Route
from .serializers import RouteSerializer, RouteCreateSerializer
from apps.cities.models import City


@api_view(['GET'])
@permission_classes([AllowAny])
def list_routes(request):
    """
    GET /api/v1/routes/?company_id=xxx
    List routes by company - matches frontend routes.getByCompanyId
    """
    company_id = request.query_params.get('company_id')
    if not company_id:
        return Response({'error': 'company_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    routes = Route.objects.filter(company_id=company_id).select_related('origin_city', 'destination_city')
    serializer = RouteSerializer(routes, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_route(request, route_id):
    """
    GET /api/v1/routes/<id>/
    Get route by ID - matches frontend routes.getById
    """
    try:
        route = Route.objects.select_related('origin_city', 'destination_city').get(id=route_id)
        return Response(RouteSerializer(route).data)
    except Route.DoesNotExist:
        return Response({'error': 'Route not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_route(request):
    """
    POST /api/v1/routes/
    Create route - matches frontend routes.create
    """
    serializer = RouteCreateSerializer(data=request.data)
    if serializer.is_valid():
        # Validate cities exist
        try:
            origin = City.objects.get(id=serializer.validated_data['origin_city_id'])
            destination = City.objects.get(id=serializer.validated_data['destination_city_id'])
        except City.DoesNotExist:
            return Response({'error': 'Invalid city ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        if origin == destination:
            return Response({'error': 'Origin and destination must be different'}, status=status.HTTP_400_BAD_REQUEST)
        
        route = Route.objects.create(
            company_id=serializer.validated_data['company_id'],
            origin_city=origin,
            destination_city=destination,
            base_price=serializer.validated_data['base_price'],
            duration_hours=serializer.validated_data['duration_hours']
        )
        return Response(RouteSerializer(route).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_route(request, route_id):
    """
    PATCH /api/v1/routes/<id>/
    Update route - matches frontend routes.update
    """
    try:
        route = Route.objects.get(id=route_id)
    except Route.DoesNotExist:
        return Response({'error': 'Route not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = RouteSerializer(route, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_route(request, route_id):
    """
    DELETE /api/v1/routes/<id>/
    Delete route - matches frontend routes.delete
    """
    try:
        route = Route.objects.get(id=route_id)
        route.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Route.DoesNotExist:
        return Response({'error': 'Route not found'}, status=status.HTTP_404_NOT_FOUND)
```

### 7. Trips Views (apps/trips/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from .models import Trip, TripStatus
from .serializers import TripSerializer, TripCreateSerializer, TripSearchSerializer
from utils.pagination import StandardResultsPagination


@api_view(['GET'])
@permission_classes([AllowAny])
def search_trips(request):
    """
    GET /api/v1/trips/search/
    Search trips - matches frontend trips.search
    Parameters: origin_city_id, destination_city_id, departure_date, min_seats
    """
    trips = Trip.objects.select_related(
        'route__origin_city',
        'route__destination_city',
        'route__company',
        'bus'
    ).filter(
        status=TripStatus.SCHEDULED,
        departure_time__gt=timezone.now()
    )
    
    # Filters
    origin_city_id = request.query_params.get('origin_city_id')
    destination_city_id = request.query_params.get('destination_city_id')
    departure_date = request.query_params.get('departure_date')
    min_seats = request.query_params.get('min_seats', 1)
    
    if origin_city_id:
        trips = trips.filter(route__origin_city_id=origin_city_id)
    if destination_city_id:
        trips = trips.filter(route__destination_city_id=destination_city_id)
    if departure_date:
        trips = trips.filter(departure_time__date=departure_date)
    if min_seats:
        trips = trips.filter(available_seats__gte=int(min_seats))
    
    trips = trips.order_by('departure_time')
    serializer = TripSerializer(trips, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_trip(request, trip_id):
    """
    GET /api/v1/trips/<id>/
    Get trip by ID - matches frontend trips.getById
    """
    try:
        trip = Trip.objects.select_related(
            'route__origin_city',
            'route__destination_city',
            'route__company',
            'bus'
        ).get(id=trip_id)
        return Response(TripSerializer(trip).data)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_company_trips(request):
    """
    GET /api/v1/trips/?company_id=xxx
    List trips by company - matches frontend trips.getByCompanyId
    """
    company_id = request.query_params.get('company_id')
    if not company_id:
        return Response({'error': 'company_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    trips = Trip.objects.filter(route__company_id=company_id).select_related(
        'route__origin_city', 'route__destination_city', 'bus'
    )
    serializer = TripSerializer(trips, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_trip(request):
    """
    POST /api/v1/trips/
    Create trip - matches frontend trips.create
    """
    serializer = TripCreateSerializer(data=request.data)
    if serializer.is_valid():
        trip = serializer.save()
        return Response(TripSerializer(trip).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_trip(request, trip_id):
    """
    PATCH /api/v1/trips/<id>/
    Update trip - matches frontend trips.update
    """
    try:
        trip = Trip.objects.get(id=trip_id)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = TripSerializer(trip, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_trip(request, trip_id):
    """
    DELETE /api/v1/trips/<id>/
    Delete trip - matches frontend trips.delete
    """
    try:
        trip = Trip.objects.get(id=trip_id)
        trip.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)
```

### 8. Bookings Views (apps/bookings/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from .models import Booking, BookingPassenger, BookingStatus
from .serializers import BookingSerializer, BookingCreateSerializer, BookingPassengerSerializer
from apps.accounts.models import AppRole
from utils.permissions import IsAdmin
from utils.pagination import StandardResultsPagination


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_bookings(request):
    """
    GET /api/v1/bookings/
    List bookings - supports user_id, company_id filters
    Matches frontend bookings.getByUserId and getByCompanyId
    """
    user_id = request.query_params.get('user_id')
    company_id = request.query_params.get('company_id')
    
    if user_id:
        bookings = Booking.objects.filter(user_id=user_id)
    elif company_id:
        bookings = Booking.objects.filter(trip__route__company_id=company_id)
    else:
        # Default: current user's bookings
        bookings = Booking.objects.filter(user=request.user)
    
    bookings = bookings.select_related(
        'trip__route__origin_city',
        'trip__route__destination_city',
        'trip__route__company',
        'trip__bus'
    ).prefetch_related('passengers').order_by('-created_at')
    
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(bookings, request)
    serializer = BookingSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_booking(request, booking_id):
    """
    GET /api/v1/bookings/<id>/
    Get booking by ID - matches frontend bookings.getById
    """
    try:
        booking = Booking.objects.select_related(
            'trip__route__origin_city',
            'trip__route__destination_city',
            'trip__route__company',
            'trip__bus'
        ).prefetch_related('passengers').get(id=booking_id)
        
        # Check permission
        if booking.user != request.user and not request.user.roles.filter(role=AppRole.ADMIN).exists():
            if booking.trip.route.company.owner != request.user:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        return Response(BookingSerializer(booking).data)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    """
    POST /api/v1/bookings/
    Create booking - matches frontend bookings.create
    """
    serializer = BookingCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        booking = serializer.save()
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_booking(request, booking_id):
    """
    PATCH /api/v1/bookings/<id>/
    Update booking - matches frontend bookings.update
    """
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Handle cancellation
    if request.data.get('status') == 'cancelled':
        booking.status = BookingStatus.CANCELLED
        booking.cancelled_at = timezone.now()
        booking.cancellation_reason = request.data.get('cancellation_reason', '')
        booking.save()
        
        # Restore available seats
        booking.trip.available_seats += len(booking.seats)
        booking.trip.save()
    else:
        serializer = BookingSerializer(booking, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(BookingSerializer(booking).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_booking_passengers(request, booking_id):
    """
    GET /api/v1/bookings/<id>/passengers/
    Get passengers for a booking - matches frontend bookings.getPassengers
    """
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    
    passengers = BookingPassenger.objects.filter(booking=booking)
    serializer = BookingPassengerSerializer(passengers, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdmin])
def list_all_bookings(request):
    """
    GET /api/v1/bookings/all/
    List all bookings (Admin only) - matches frontend bookings.getAll
    """
    bookings = Booking.objects.all().select_related(
        'trip__route__origin_city',
        'trip__route__destination_city',
        'trip__route__company',
        'trip__bus',
        'user'
    ).prefetch_related('passengers')
    
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(bookings, request)
    serializer = BookingSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)
```

### 9. Functions Views (apps/accounts/views.py - add)

```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invoke_function(request, function_name):
    """
    POST /api/v1/functions/<function_name>/
    Invoke backend function - matches frontend functions.invoke
    """
    # Map function names to handlers
    handlers = {
        'send-booking-email': handle_send_booking_email,
        # Add more function handlers as needed
    }
    
    handler = handlers.get(function_name)
    if not handler:
        return Response({'error': f'Function {function_name} not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        result = handler(request.data)
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def handle_send_booking_email(data):
    """Handle send-booking-email function"""
    # TODO: Implement email sending
    return {'success': True, 'message': 'Email sent'}
```

---

## URL Configuration

### Main URLs (bus_booking/urls.py)

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Bus Booking API",
        default_version='v1',
        description="API for bus booking system - matches React frontend interfaces",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/profiles/', include('apps.profiles.urls')),
    path('api/v1/cities/', include('apps.cities.urls')),
    path('api/v1/companies/', include('apps.companies.urls')),
    path('api/v1/buses/', include('apps.buses.urls')),
    path('api/v1/routes/', include('apps.routes.urls')),
    path('api/v1/trips/', include('apps.trips.urls')),
    path('api/v1/bookings/', include('apps.bookings.urls')),
    path('api/v1/functions/', include('apps.functions.urls')),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
```

### Accounts URLs (apps/accounts/urls.py)

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth endpoints - match IAuthService interface
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', views.me, name='me'),
    path('password-reset/', views.password_reset, name='password-reset'),
    path('password-change/', views.password_change, name='password-change'),
    path('resend-verification/', views.resend_verification, name='resend-verification'),
    
    # User roles - match IUserRolesService interface
    path('user-roles/', views.list_user_roles, name='list-user-roles'),
    path('user-roles/check/', views.check_user_role, name='check-user-role'),
    path('user-roles/add/', views.add_user_role, name='add-user-role'),
    path('user-roles/remove/', views.remove_user_role, name='remove-user-role'),
    
    # Admin endpoints
    path('users/', views.list_users, name='list-users'),
]
```

### Profiles URLs (apps/profiles/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    # Match IProfilesService interface
    path('', views.list_profiles, name='list-profiles'),
    path('me/', views.my_profile, name='my-profile'),
    path('<uuid:profile_id>/', views.get_profile, name='get-profile'),
    path('<uuid:profile_id>/update/', views.update_profile, name='update-profile'),
]
```

### Cities URLs (apps/cities/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    # Match ICitiesService interface
    path('', views.list_cities, name='list-cities'),
    path('<uuid:city_id>/', views.get_city, name='get-city'),
]
```

### Companies URLs (apps/companies/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    # Match ICompaniesService interface
    path('', views.list_companies, name='list-companies'),
    path('create/', views.create_company, name='create-company'),
    path('<uuid:company_id>/', views.get_company, name='get-company'),
    path('<uuid:company_id>/update/', views.update_company, name='update-company'),
]
```

### Buses URLs (apps/buses/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    # Match IBusesService interface
    path('', views.list_buses, name='list-buses'),
    path('create/', views.create_bus, name='create-bus'),
    path('<uuid:bus_id>/', views.get_bus, name='get-bus'),
    path('<uuid:bus_id>/update/', views.update_bus, name='update-bus'),
    path('<uuid:bus_id>/delete/', views.delete_bus, name='delete-bus'),
]
```

### Routes URLs (apps/routes/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    # Match IRoutesService interface
    path('', views.list_routes, name='list-routes'),
    path('create/', views.create_route, name='create-route'),
    path('<uuid:route_id>/', views.get_route, name='get-route'),
    path('<uuid:route_id>/update/', views.update_route, name='update-route'),
    path('<uuid:route_id>/delete/', views.delete_route, name='delete-route'),
]
```

### Trips URLs (apps/trips/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    # Match ITripsService interface
    path('', views.list_company_trips, name='list-trips'),
    path('search/', views.search_trips, name='search-trips'),
    path('create/', views.create_trip, name='create-trip'),
    path('<uuid:trip_id>/', views.get_trip, name='get-trip'),
    path('<uuid:trip_id>/update/', views.update_trip, name='update-trip'),
    path('<uuid:trip_id>/delete/', views.delete_trip, name='delete-trip'),
]
```

### Bookings URLs (apps/bookings/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    # Match IBookingsService interface
    path('', views.list_bookings, name='list-bookings'),
    path('all/', views.list_all_bookings, name='all-bookings'),
    path('create/', views.create_booking, name='create-booking'),
    path('<uuid:booking_id>/', views.get_booking, name='get-booking'),
    path('<uuid:booking_id>/update/', views.update_booking, name='update-booking'),
    path('<uuid:booking_id>/passengers/', views.get_booking_passengers, name='booking-passengers'),
]
```

### Functions URLs (apps/functions/urls.py)

```python
from django.urls import path
from apps.accounts import views

urlpatterns = [
    # Match IFunctionsService interface
    path('<str:function_name>/', views.invoke_function, name='invoke-function'),
]
```

---

## API Endpoints Summary

This table maps frontend interface methods to Django endpoints:

### IAuthService

| Frontend Method | HTTP | Endpoint | Description |
|-----------------|------|----------|-------------|
| `getSession()` | GET | `/api/v1/auth/me/` | Get current user |
| `signUp()` | POST | `/api/v1/auth/register/` | Register new user |
| `signIn()` | POST | `/api/v1/auth/login/` | Login user |
| `signOut()` | POST | `/api/v1/auth/logout/` | Logout user |
| `resetPasswordForEmail()` | POST | `/api/v1/auth/password-reset/` | Request password reset |
| `updatePassword()` | POST | `/api/v1/auth/password-change/` | Change password |
| `resendVerificationEmail()` | POST | `/api/v1/auth/resend-verification/` | Resend verification |

### ICitiesService

| Frontend Method | HTTP | Endpoint | Description |
|-----------------|------|----------|-------------|
| `getAll()` | GET | `/api/v1/cities/` | List all cities |
| `getById(id)` | GET | `/api/v1/cities/<id>/` | Get city by ID |

### ICompaniesService

| Frontend Method | HTTP | Endpoint | Description |
|-----------------|------|----------|-------------|
| `getAll(options)` | GET | `/api/v1/companies/` | List companies (paginated) |
| `getById(id)` | GET | `/api/v1/companies/<id>/` | Get company by ID |
| `getByOwnerId(ownerId)` | GET | `/api/v1/companies/?owner_id=xxx` | Get company by owner |
| `create(data, ownerId)` | POST | `/api/v1/companies/create/` | Create company |
| `update(id, data)` | PATCH | `/api/v1/companies/<id>/update/` | Update company |

### IBusesService

| Frontend Method | HTTP | Endpoint | Description |
|-----------------|------|----------|-------------|
| `getByCompanyId(companyId)` | GET | `/api/v1/buses/?company_id=xxx` | List buses by company |
| `getById(id)` | GET | `/api/v1/buses/<id>/` | Get bus by ID |
| `create(data)` | POST | `/api/v1/buses/create/` | Create bus |
| `update(id, data)` | PATCH | `/api/v1/buses/<id>/update/` | Update bus |
| `delete(id)` | DELETE | `/api/v1/buses/<id>/delete/` | Delete bus |

### IRoutesService

| Frontend Method | HTTP | Endpoint | Description |
|-----------------|------|----------|-------------|
| `getByCompanyId(companyId)` | GET | `/api/v1/routes/?company_id=xxx` | List routes by company |
| `getById(id)` | GET | `/api/v1/routes/<id>/` | Get route by ID |
| `create(data)` | POST | `/api/v1/routes/create/` | Create route |
| `update(id, data)` | PATCH | `/api/v1/routes/<id>/update/` | Update route |
| `delete(id)` | DELETE | `/api/v1/routes/<id>/delete/` | Delete route |

### ITripsService

| Frontend Method | HTTP | Endpoint | Description |
|-----------------|------|----------|-------------|
| `search(params)` | GET | `/api/v1/trips/search/` | Search trips |
| `getByCompanyId(companyId)` | GET | `/api/v1/trips/?company_id=xxx` | List trips by company |
| `getById(id)` | GET | `/api/v1/trips/<id>/` | Get trip by ID |
| `create(data)` | POST | `/api/v1/trips/create/` | Create trip |
| `update(id, data)` | PATCH | `/api/v1/trips/<id>/update/` | Update trip |
| `delete(id)` | DELETE | `/api/v1/trips/<id>/delete/` | Delete trip |

### IBookingsService

| Frontend Method | HTTP | Endpoint | Description |
|-----------------|------|----------|-------------|
| `getByUserId(userId)` | GET | `/api/v1/bookings/?user_id=xxx` | List user's bookings |
| `getByCompanyId(companyId)` | GET | `/api/v1/bookings/?company_id=xxx` | List company's bookings |
| `getAll(options)` | GET | `/api/v1/bookings/all/` | List all bookings (Admin) |
| `getById(id)` | GET | `/api/v1/bookings/<id>/` | Get booking by ID |
| `create(data, userId)` | POST | `/api/v1/bookings/create/` | Create booking |
| `update(id, data)` | PATCH | `/api/v1/bookings/<id>/update/` | Update booking |
| `getPassengers(bookingId)` | GET | `/api/v1/bookings/<id>/passengers/` | Get passengers |

### IProfilesService

| Frontend Method | HTTP | Endpoint | Description |
|-----------------|------|----------|-------------|
| `getById(id)` | GET | `/api/v1/profiles/<id>/` | Get profile by ID |
| `update(id, data)` | PATCH | `/api/v1/profiles/<id>/update/` | Update profile |
| `getAll(options)` | GET | `/api/v1/profiles/` | List all profiles (Admin) |

### IUserRolesService

| Frontend Method | HTTP | Endpoint | Description |
|-----------------|------|----------|-------------|
| `getByUserId(userId)` | GET | `/api/v1/auth/user-roles/?user_id=xxx` | List user roles |
| `hasRole(userId, role)` | GET | `/api/v1/auth/user-roles/check/?user_id=xxx&role=xxx` | Check role |
| `addRole(userId, role)` | POST | `/api/v1/auth/user-roles/add/` | Add role |
| `removeRole(userId, role)` | POST | `/api/v1/auth/user-roles/remove/` | Remove role |

### IFunctionsService

| Frontend Method | HTTP | Endpoint | Description |
|-----------------|------|----------|-------------|
| `invoke(functionName, body)` | POST | `/api/v1/functions/<functionName>/` | Invoke function |

---

## Pagination Helper (utils/pagination.py)

```python
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsPagination(PageNumberPagination):
    """
    Standard pagination matching frontend ApiListResult interface.
    Frontend expects: { data, total, page, limit }
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'current_page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'total_pages': self.page.paginator.num_pages,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })
```

---

## Permissions Helper (utils/permissions.py)

```python
from rest_framework.permissions import BasePermission
from apps.accounts.models import AppRole


class IsAdmin(BasePermission):
    """Permission for admin users only"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.roles.filter(role=AppRole.ADMIN).exists()


class IsCompanyOwner(BasePermission):
    """Permission for company owners"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.roles.filter(role=AppRole.COMPANY_ADMIN).exists()


class IsOwnerOrAdmin(BasePermission):
    """Permission for resource owner or admin"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.roles.filter(role=AppRole.ADMIN).exists():
            return True
        
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'company'):
            return obj.company.owner == request.user
        
        return False
```

---

## Background Tasks

### Expire Pending Bookings (apps/bookings/management/commands/expire_bookings.py)

```python
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.bookings.models import Booking, BookingStatus


class Command(BaseCommand):
    help = 'Expire pending bookings that have passed their hold time'

    def handle(self, *args, **options):
        expired_bookings = Booking.objects.filter(
            status=BookingStatus.PENDING,
            hold_expires_at__lt=timezone.now()
        )
        
        count = 0
        for booking in expired_bookings:
            booking.status = BookingStatus.EXPIRED
            booking.save()
            
            # Restore available seats
            booking.trip.available_seats += len(booking.seats)
            booking.trip.save()
            count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully expired {count} bookings')
        )
```

### Cron Setup

```bash
# Expire pending bookings every 5 minutes
*/5 * * * * cd /path/to/project && /path/to/venv/bin/python manage.py expire_bookings
```

---

## Environment Variables (.env.example)

```env
# Django
DJANGO_SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS - Add your frontend URLs
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@busbooking.com
```

---

## Frontend Integration Checklist

Before deploying, verify:

- [ ] All endpoints match the frontend interface methods in `src/services/api/interfaces.ts`
- [ ] Response field names use snake_case (frontend client handles camelCase conversion)
- [ ] Paginated endpoints return `results` array (not `data`)
- [ ] Authentication endpoints return `access` and `refresh` tokens
- [ ] Cities endpoint returns simple array (not paginated)
- [ ] Error responses include `error` key with message
- [ ] UUIDs are used for all primary keys
- [ ] ISO8601 datetime format for all timestamps
- [ ] Booking `ticket_code` follows `NB-XXXXXXXX` format
- [ ] CORS allows frontend origin

---

## Production Deployment

### Database Migration to PostgreSQL

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}
```

### Security Checklist

- [ ] Set `DEBUG=False`
- [ ] Generate strong `DJANGO_SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS` properly
- [ ] Set up HTTPS with SSL certificate
- [ ] Configure proper CORS origins
- [ ] Run `python manage.py check --deploy`

---

This documentation ensures the Django backend aligns perfectly with the React frontend's API abstraction layer, enabling seamless integration when switching from Supabase to Django.
