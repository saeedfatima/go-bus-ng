# Django Backend Structure for Bus Booking System

This document outlines the complete Django REST Framework backend structure for future integration. The setup uses SQLite for simplicity during development with easy migration to PostgreSQL for production.

---

## Quick Start (5 minutes)

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
│   │   ├── management/
│   │   │   └── commands/
│   │   │       └── create_default_roles.py
│   │   └── tests.py
│   ├── companies/                  # Company management
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests.py
│   ├── buses/                      # Bus management
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests.py
│   ├── routes/                     # Route management
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests.py
│   ├── trips/                      # Trip management
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests.py
│   ├── bookings/                   # Booking management
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── pagination.py
│   │   ├── management/
│   │   │   └── commands/
│   │   │       ├── expire_bookings.py
│   │   │       └── send_reminders.py
│   │   └── tests.py
│   └── cities/                     # City management
│       ├── __init__.py
│       ├── admin.py
│       ├── apps.py
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

# CORS
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173,http://localhost:8080').split(',')
CORS_ALLOW_CREDENTIALS = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email (optional)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # Dev
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'  # Production
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@busbooking.com')
```

---

## Test Settings (bus_booking/settings_test.py)

```python
from .settings import *

# Use in-memory SQLite for faster tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Faster password hashing for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Disable debug mode
DEBUG = False

# Disable logging during tests
LOGGING = {}
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


class Profile(models.Model):
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

### 2. Cities App (apps/cities/models.py)

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

### 3. Companies App (apps/companies/models.py)

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

### 4. Buses App (apps/buses/models.py)

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
    # JSONField is database-agnostic (works with SQLite, PostgreSQL, MySQL)
    amenities = models.JSONField(default=list, blank=True)
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

### 5. Routes App (apps/routes/models.py)

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

### 6. Trips App (apps/trips/models.py)

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

### 7. Bookings App (apps/bookings/models.py)

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
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


class Booking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    # JSONField is database-agnostic (works with SQLite, PostgreSQL, MySQL)
    seats = models.JSONField(default=list)
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
from .models import User, UserRole, Profile, AppRole


class RegisterSerializer(serializers.ModelSerializer):
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
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'is_active', 'created_at', 'updated_at']

    def get_roles(self, obj):
        return [role.role for role in obj.roles.all()]


class UserRoleSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(source='user.id', read_only=True)

    class Meta:
        model = UserRole
        fields = ['id', 'user_id', 'role']


class ProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(source='user.id', read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'user_id', 'full_name', 'phone', 'created_at', 'updated_at']
```

### 2. Cities Serializers (apps/cities/serializers.py)

```python
from rest_framework import serializers
from .models import City


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name', 'state', 'created_at']
```

### 3. Companies Serializers (apps/companies/serializers.py)

```python
from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    owner_id = serializers.UUIDField(source='owner.id', read_only=True)

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'logo_url', 'description', 'rating',
            'total_trips', 'is_verified', 'owner_id', 'created_at', 'updated_at'
        ]


class CompanyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['name', 'logo_url', 'description']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
```

### 4. Buses Serializers (apps/buses/serializers.py)

```python
from rest_framework import serializers
from .models import Bus, BusType


class BusSerializer(serializers.ModelSerializer):
    company_id = serializers.UUIDField(source='company.id', read_only=True)

    class Meta:
        model = Bus
        fields = [
            'id', 'company_id', 'plate_number', 'bus_type',
            'total_seats', 'amenities', 'is_active', 'created_at', 'updated_at'
        ]


class BusCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = ['plate_number', 'bus_type', 'total_seats', 'amenities']
```

### 5. Routes Serializers (apps/routes/serializers.py)

```python
from rest_framework import serializers
from .models import Route
from apps.cities.serializers import CitySerializer


class RouteSerializer(serializers.ModelSerializer):
    origin_city = CitySerializer(read_only=True)
    destination_city = CitySerializer(read_only=True)
    origin_city_id = serializers.UUIDField(write_only=True)
    destination_city_id = serializers.UUIDField(write_only=True)
    company_id = serializers.UUIDField(source='company.id', read_only=True)

    class Meta:
        model = Route
        fields = [
            'id', 'company_id', 'origin_city', 'destination_city',
            'origin_city_id', 'destination_city_id',
            'base_price', 'duration_hours', 'is_active', 'created_at', 'updated_at'
        ]
```

### 6. Trips Serializers (apps/trips/serializers.py)

```python
from rest_framework import serializers
from .models import Trip
from apps.routes.serializers import RouteSerializer
from apps.buses.serializers import BusSerializer
from apps.companies.serializers import CompanySerializer


class TripSerializer(serializers.ModelSerializer):
    route = RouteSerializer(read_only=True)
    bus = BusSerializer(read_only=True)
    company = serializers.SerializerMethodField()
    route_id = serializers.UUIDField(write_only=True)
    bus_id = serializers.UUIDField(write_only=True)

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

### 7. Bookings Serializers (apps/bookings/serializers.py)

```python
from rest_framework import serializers
from .models import Booking, BookingPassenger
from apps.trips.serializers import TripSerializer


class BookingPassengerSerializer(serializers.ModelSerializer):
    booking_id = serializers.UUIDField(source='booking.id', read_only=True)

    class Meta:
        model = BookingPassenger
        fields = ['id', 'booking_id', 'full_name', 'phone', 'email', 'nin', 'seat_number', 'created_at']


class BookingSerializer(serializers.ModelSerializer):
    trip = TripSerializer(read_only=True)
    passengers = BookingPassengerSerializer(many=True, read_only=True)
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    trip_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'trip', 'trip_id', 'user_id', 'seats', 'total_amount', 'status',
            'ticket_code', 'passenger_name', 'passenger_phone', 'passenger_email',
            'hold_expires_at', 'payment_completed_at', 'cancelled_at',
            'cancellation_reason', 'passengers', 'created_at', 'updated_at'
        ]
        read_only_fields = ['ticket_code', 'status', 'hold_expires_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    passengers = BookingPassengerSerializer(many=True, required=False)

    class Meta:
        model = Booking
        fields = [
            'trip', 'seats', 'passenger_name', 'passenger_phone',
            'passenger_email', 'passengers'
        ]

    def create(self, validated_data):
        passengers_data = validated_data.pop('passengers', [])
        trip = validated_data['trip']
        seats = validated_data['seats']
        
        # Calculate total amount
        validated_data['total_amount'] = trip.price * len(seats)
        validated_data['user'] = self.context['request'].user
        
        # Set hold expiration (15 minutes from now)
        from django.utils import timezone
        from datetime import timedelta
        validated_data['hold_expires_at'] = timezone.now() + timedelta(minutes=15)
        
        booking = Booking.objects.create(**validated_data)
        
        # Create passengers
        for passenger_data in passengers_data:
            BookingPassenger.objects.create(booking=booking, **passenger_data)
        
        # Update available seats
        trip.available_seats -= len(seats)
        trip.save()
        
        return booking
```

---

## Pagination (utils/pagination.py)

```python
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsPagination(PageNumberPagination):
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


class SeatsPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class BookingsPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 50


class TripsPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50
```

---

## Permissions (utils/permissions.py)

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
        
        # Check ownership based on object type
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'company'):
            return obj.company.owner == request.user
        
        return False


class IsPassenger(BasePermission):
    """Permission for passengers"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.roles.filter(role=AppRole.PASSENGER).exists()
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

from .models import User, UserRole, Profile, AppRole
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    UserRoleSerializer, ProfileSerializer
)
from utils.permissions import IsAdmin


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
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
    """Login user and return JWT tokens"""
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
    """Logout user by blacklisting refresh token"""
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
    """Get current authenticated user"""
    return Response(UserSerializer(request.user).data)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get or update user profile"""
    try:
        user_profile = Profile.objects.get(user=request.user)
    except Profile.DoesNotExist:
        user_profile = Profile.objects.create(user=request.user)

    if request.method == 'GET':
        return Response(ProfileSerializer(user_profile).data)

    serializer = ProfileSerializer(user_profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_roles(request):
    """List roles for a user"""
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    roles = UserRole.objects.filter(user_id=user_id)
    return Response(UserRoleSerializer(roles, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_user_role(request):
    """Check if user has specific role"""
    user_id = request.query_params.get('user_id')
    role = request.query_params.get('role')
    
    if not user_id or not role:
        return Response({'error': 'user_id and role required'}, status=status.HTTP_400_BAD_REQUEST)
    
    has_role = UserRole.objects.filter(user_id=user_id, role=role).exists()
    return Response({'has_role': has_role})


@api_view(['GET'])
@permission_classes([IsAdmin])
def list_users(request):
    """List all users (Admin only)"""
    users = User.objects.all()
    return Response(UserSerializer(users, many=True).data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def assign_role(request):
    """Assign role to user (Admin only)"""
    user_id = request.data.get('user_id')
    role = request.data.get('role')
    
    if not user_id or not role:
        return Response({'error': 'user_id and role required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if role not in [r[0] for r in AppRole.choices]:
        return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    user_role, created = UserRole.objects.get_or_create(user=user, role=role)
    return Response(UserRoleSerializer(user_role).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def remove_role(request, user_id, role):
    """Remove role from user (Admin only)"""
    try:
        user_role = UserRole.objects.get(user_id=user_id, role=role)
        user_role.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except UserRole.DoesNotExist:
        return Response({'error': 'Role not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset(request):
    """Request password reset email"""
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        # TODO: Send password reset email
        return Response({'message': 'Password reset email sent'})
    except User.DoesNotExist:
        # Return success even if user doesn't exist (security)
        return Response({'message': 'Password reset email sent'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def password_change(request):
    """Change user password"""
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response({'error': 'old_password and new_password required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not request.user.check_password(old_password):
        return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
    
    request.user.set_password(new_password)
    request.user.save()
    return Response({'message': 'Password changed successfully'})
```

### 2. Cities Views (apps/cities/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import City
from .serializers import CitySerializer
from utils.permissions import IsAdmin
from utils.pagination import StandardResultsPagination


@api_view(['GET'])
@permission_classes([AllowAny])
def list_cities(request):
    """List all cities"""
    cities = City.objects.all()
    
    # Search
    search = request.query_params.get('search')
    if search:
        cities = cities.filter(name__icontains=search)
    
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(cities, request)
    serializer = CitySerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_city(request, city_id):
    """Get city by ID"""
    try:
        city = City.objects.get(id=city_id)
        return Response(CitySerializer(city).data)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAdmin])
def create_city(request):
    """Create city (Admin only)"""
    serializer = CitySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdmin])
def update_city(request, city_id):
    """Update city (Admin only)"""
    try:
        city = City.objects.get(id=city_id)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = CitySerializer(city, data=request.data, partial=request.method == 'PATCH')
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def delete_city(request, city_id):
    """Delete city (Admin only)"""
    try:
        city = City.objects.get(id=city_id)
        city.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)
```

### 3. Companies Views (apps/companies/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Company
from .serializers import CompanySerializer, CompanyCreateSerializer
from apps.accounts.models import AppRole, UserRole
from utils.permissions import IsAdmin, IsOwnerOrAdmin
from utils.pagination import StandardResultsPagination


@api_view(['GET'])
@permission_classes([AllowAny])
def list_companies(request):
    """List verified companies"""
    companies = Company.objects.filter(is_verified=True)
    
    # Filter by owner
    owner_id = request.query_params.get('owner_id')
    if owner_id:
        companies = Company.objects.filter(owner_id=owner_id)
    
    # Search
    search = request.query_params.get('search')
    if search:
        companies = companies.filter(name__icontains=search)
    
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(companies, request)
    serializer = CompanySerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdmin])
def list_all_companies(request):
    """List all companies (Admin only)"""
    companies = Company.objects.all()
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(companies, request)
    serializer = CompanySerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_company(request, company_id):
    """Get company by ID"""
    try:
        company = Company.objects.get(id=company_id)
        return Response(CompanySerializer(company).data)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_company(request):
    """Get current user's company"""
    try:
        company = Company.objects.get(owner=request.user)
        return Response(CompanySerializer(company).data)
    except Company.DoesNotExist:
        return Response({'error': 'No company found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_company(request):
    """Create a new company"""
    serializer = CompanyCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        company = serializer.save()
        # Assign company_admin role
        UserRole.objects.get_or_create(user=request.user, role=AppRole.COMPANY_ADMIN)
        return Response(CompanySerializer(company).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsOwnerOrAdmin])
def update_company(request, company_id):
    """Update company"""
    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check permission
    if company.owner != request.user and not request.user.roles.filter(role=AppRole.ADMIN).exists():
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = CompanySerializer(company, data=request.data, partial=request.method == 'PATCH')
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAdmin])
def verify_company(request, company_id):
    """Verify company (Admin only)"""
    try:
        company = Company.objects.get(id=company_id)
        company.is_verified = True
        company.save()
        return Response(CompanySerializer(company).data)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)
```

### 4. Buses Views (apps/buses/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Bus
from .serializers import BusSerializer, BusCreateSerializer
from apps.accounts.models import AppRole
from utils.permissions import IsCompanyOwner, IsOwnerOrAdmin
from utils.pagination import StandardResultsPagination


@api_view(['GET'])
@permission_classes([IsCompanyOwner])
def list_buses(request):
    """List buses for a company"""
    company = request.user.companies.first()
    if not company:
        return Response({'error': 'No company found'}, status=status.HTTP_404_NOT_FOUND)
    
    buses = Bus.objects.filter(company=company)
    
    # Filter by company_id (for admin access)
    company_id = request.query_params.get('company_id')
    if company_id:
        if request.user.roles.filter(role=AppRole.ADMIN).exists():
            buses = Bus.objects.filter(company_id=company_id)
        elif str(company.id) == company_id:
            buses = Bus.objects.filter(company_id=company_id)
        else:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Filter by active status
    is_active = request.query_params.get('is_active')
    if is_active is not None:
        buses = buses.filter(is_active=is_active.lower() == 'true')
    
    # Search by plate number
    search = request.query_params.get('search')
    if search:
        buses = buses.filter(plate_number__icontains=search)
    
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(buses, request)
    serializer = BusSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsCompanyOwner])
def get_bus(request, bus_id):
    """Get bus details"""
    try:
        bus = Bus.objects.select_related('company').get(id=bus_id)
        
        # Check ownership
        if bus.company.owner != request.user and not request.user.roles.filter(role=AppRole.ADMIN).exists():
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        return Response(BusSerializer(bus).data)
    except Bus.DoesNotExist:
        return Response({'error': 'Bus not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsCompanyOwner])
def create_bus(request):
    """Create a new bus"""
    company = request.user.companies.first()
    if not company:
        return Response({'error': 'No company found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = BusCreateSerializer(data=request.data)
    if serializer.is_valid():
        bus = serializer.save(company=company)
        return Response(BusSerializer(bus).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsCompanyOwner])
def update_bus(request, bus_id):
    """Update bus details"""
    try:
        bus = Bus.objects.select_related('company').get(id=bus_id)
    except Bus.DoesNotExist:
        return Response({'error': 'Bus not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check ownership
    if bus.company.owner != request.user and not request.user.roles.filter(role=AppRole.ADMIN).exists():
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = BusSerializer(bus, data=request.data, partial=request.method == 'PATCH')
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsCompanyOwner])
def delete_bus(request, bus_id):
    """Delete a bus"""
    try:
        bus = Bus.objects.select_related('company').get(id=bus_id)
    except Bus.DoesNotExist:
        return Response({'error': 'Bus not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check ownership
    if bus.company.owner != request.user and not request.user.roles.filter(role=AppRole.ADMIN).exists():
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Check if bus has active trips
    from apps.trips.models import Trip, TripStatus
    active_trips = Trip.objects.filter(
        bus=bus,
        status__in=[TripStatus.SCHEDULED, TripStatus.BOARDING]
    ).exists()
    
    if active_trips:
        return Response(
            {'error': 'Cannot delete bus with active trips'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    bus.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PATCH'])
@permission_classes([IsCompanyOwner])
def toggle_bus_status(request, bus_id):
    """Toggle bus active status"""
    try:
        bus = Bus.objects.select_related('company').get(id=bus_id)
    except Bus.DoesNotExist:
        return Response({'error': 'Bus not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check ownership
    if bus.company.owner != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    bus.is_active = not bus.is_active
    bus.save()
    return Response(BusSerializer(bus).data)
```

### 5. Routes Views (apps/routes/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Route
from .serializers import RouteSerializer
from apps.cities.models import City
from apps.accounts.models import AppRole
from utils.permissions import IsCompanyOwner, IsOwnerOrAdmin
from utils.pagination import StandardResultsPagination


@api_view(['GET'])
@permission_classes([AllowAny])
def list_routes(request):
    """List routes (public for searching, filtered for company owners)"""
    routes = Route.objects.filter(is_active=True).select_related(
        'origin_city', 'destination_city', 'company'
    )
    
    # Filter by company_id
    company_id = request.query_params.get('company_id')
    if company_id:
        routes = Route.objects.filter(company_id=company_id).select_related(
            'origin_city', 'destination_city', 'company'
        )
    
    # Filter by origin city
    origin_city_id = request.query_params.get('origin_city_id')
    if origin_city_id:
        routes = routes.filter(origin_city_id=origin_city_id)
    
    # Filter by destination city
    destination_city_id = request.query_params.get('destination_city_id')
    if destination_city_id:
        routes = routes.filter(destination_city_id=destination_city_id)
    
    # Filter by active status (for company owners)
    is_active = request.query_params.get('is_active')
    if is_active is not None:
        routes = routes.filter(is_active=is_active.lower() == 'true')
    
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(routes, request)
    serializer = RouteSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsCompanyOwner])
def my_routes(request):
    """Get routes for current user's company"""
    company = request.user.companies.first()
    if not company:
        return Response({'error': 'No company found'}, status=status.HTTP_404_NOT_FOUND)
    
    routes = Route.objects.filter(company=company).select_related(
        'origin_city', 'destination_city'
    )
    
    # Filter by active status
    is_active = request.query_params.get('is_active')
    if is_active is not None:
        routes = routes.filter(is_active=is_active.lower() == 'true')
    
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(routes, request)
    serializer = RouteSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_route(request, route_id):
    """Get route details"""
    try:
        route = Route.objects.select_related(
            'origin_city', 'destination_city', 'company'
        ).get(id=route_id)
        return Response(RouteSerializer(route).data)
    except Route.DoesNotExist:
        return Response({'error': 'Route not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsCompanyOwner])
def create_route(request):
    """Create a new route"""
    company = request.user.companies.first()
    if not company:
        return Response({'error': 'No company found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Validate cities exist
    origin_city_id = request.data.get('origin_city_id')
    destination_city_id = request.data.get('destination_city_id')
    
    if origin_city_id == destination_city_id:
        return Response(
            {'error': 'Origin and destination cities must be different'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        origin_city = City.objects.get(id=origin_city_id)
        destination_city = City.objects.get(id=destination_city_id)
    except City.DoesNotExist:
        return Response({'error': 'Invalid city ID'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check for duplicate route
    existing_route = Route.objects.filter(
        company=company,
        origin_city=origin_city,
        destination_city=destination_city
    ).exists()
    
    if existing_route:
        return Response(
            {'error': 'Route already exists for this company'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    route = Route.objects.create(
        company=company,
        origin_city=origin_city,
        destination_city=destination_city,
        base_price=request.data.get('base_price'),
        duration_hours=request.data.get('duration_hours'),
        is_active=request.data.get('is_active', True)
    )
    
    return Response(RouteSerializer(route).data, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsCompanyOwner])
def update_route(request, route_id):
    """Update route details"""
    try:
        route = Route.objects.select_related('company').get(id=route_id)
    except Route.DoesNotExist:
        return Response({'error': 'Route not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check ownership
    if route.company.owner != request.user and not request.user.roles.filter(role=AppRole.ADMIN).exists():
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Handle city updates
    origin_city_id = request.data.get('origin_city_id')
    destination_city_id = request.data.get('destination_city_id')
    
    if origin_city_id:
        try:
            route.origin_city = City.objects.get(id=origin_city_id)
        except City.DoesNotExist:
            return Response({'error': 'Invalid origin city ID'}, status=status.HTTP_400_BAD_REQUEST)
    
    if destination_city_id:
        try:
            route.destination_city = City.objects.get(id=destination_city_id)
        except City.DoesNotExist:
            return Response({'error': 'Invalid destination city ID'}, status=status.HTTP_400_BAD_REQUEST)
    
    if route.origin_city == route.destination_city:
        return Response(
            {'error': 'Origin and destination cities must be different'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update other fields
    if 'base_price' in request.data:
        route.base_price = request.data['base_price']
    if 'duration_hours' in request.data:
        route.duration_hours = request.data['duration_hours']
    if 'is_active' in request.data:
        route.is_active = request.data['is_active']
    
    route.save()
    return Response(RouteSerializer(route).data)


@api_view(['DELETE'])
@permission_classes([IsCompanyOwner])
def delete_route(request, route_id):
    """Delete a route"""
    try:
        route = Route.objects.select_related('company').get(id=route_id)
    except Route.DoesNotExist:
        return Response({'error': 'Route not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check ownership
    if route.company.owner != request.user and not request.user.roles.filter(role=AppRole.ADMIN).exists():
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Check if route has active trips
    from apps.trips.models import Trip, TripStatus
    active_trips = Trip.objects.filter(
        route=route,
        status__in=[TripStatus.SCHEDULED, TripStatus.BOARDING]
    ).exists()
    
    if active_trips:
        return Response(
            {'error': 'Cannot delete route with active trips'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    route.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PATCH'])
@permission_classes([IsCompanyOwner])
def toggle_route_status(request, route_id):
    """Toggle route active status"""
    try:
        route = Route.objects.select_related('company').get(id=route_id)
    except Route.DoesNotExist:
        return Response({'error': 'Route not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check ownership
    if route.company.owner != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    route.is_active = not route.is_active
    route.save()
    return Response(RouteSerializer(route).data)
```

### 6. Trips Views (apps/trips/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from .models import Trip, TripStatus
from .serializers import TripSerializer, TripSearchSerializer
from apps.accounts.models import AppRole
from utils.permissions import IsCompanyOwner
from utils.pagination import TripsPagination, SeatsPagination


@api_view(['GET'])
@permission_classes([AllowAny])
def search_trips(request):
    """
    Search trips with parameters:
    - origin_city_id: UUID
    - destination_city_id: UUID
    - departure_date: YYYY-MM-DD
    - min_seats: minimum available seats (default: 1)
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
    
    paginator = TripsPagination()
    result_page = paginator.paginate_queryset(trips, request)
    serializer = TripSearchSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_trip(request, trip_id):
    """Get trip details with full nested data"""
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
@permission_classes([AllowAny])
def get_trip_seats(request, trip_id):
    """Get available and booked seats for a trip"""
    try:
        trip = Trip.objects.prefetch_related('bookings').get(id=trip_id)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get all booked seats
    booked_seats = set()
    for booking in trip.bookings.exclude(status__in=['cancelled', 'expired']):
        booked_seats.update(booking.seats)
    
    # Generate all seats
    total_seats = trip.bus.total_seats
    all_seats = []
    for i in range(1, total_seats + 1):
        seat_number = str(i)
        all_seats.append({
            'seat_number': seat_number,
            'is_available': seat_number not in booked_seats
        })
    
    paginator = SeatsPagination()
    result_page = paginator.paginate_queryset(all_seats, request)
    return paginator.get_paginated_response(result_page)


@api_view(['GET'])
@permission_classes([IsCompanyOwner])
def my_trips(request):
    """Get trips for current user's company"""
    try:
        company = request.user.companies.first()
        if not company:
            return Response({'error': 'No company found'}, status=status.HTTP_404_NOT_FOUND)
        
        trips = Trip.objects.filter(route__company=company).select_related(
            'route__origin_city',
            'route__destination_city',
            'bus'
        )
        
        paginator = TripsPagination()
        result_page = paginator.paginate_queryset(trips, request)
        serializer = TripSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsCompanyOwner])
def create_trip(request):
    """Create a new trip"""
    serializer = TripSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsCompanyOwner])
def update_trip(request, trip_id):
    """Update trip"""
    try:
        trip = Trip.objects.get(id=trip_id)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check ownership
    if trip.route.company.owner != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = TripSerializer(trip, data=request.data, partial=request.method == 'PATCH')
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsCompanyOwner])
def delete_trip(request, trip_id):
    """Delete trip"""
    try:
        trip = Trip.objects.get(id=trip_id)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check ownership
    if trip.route.company.owner != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    trip.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
```

### 5. Bookings Views (apps/bookings/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from .models import Booking, BookingPassenger, BookingStatus
from .serializers import BookingSerializer, BookingCreateSerializer, BookingPassengerSerializer
from apps.accounts.models import AppRole
from utils.permissions import IsAdmin, IsCompanyOwner
from utils.pagination import BookingsPagination


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_bookings(request):
    """Get current user's bookings"""
    bookings = Booking.objects.filter(user=request.user).select_related(
        'trip__route__origin_city',
        'trip__route__destination_city',
        'trip__route__company',
        'trip__bus'
    )
    
    # Filter by user_id (for admin access)
    user_id = request.query_params.get('user_id')
    if user_id and request.user.roles.filter(role=AppRole.ADMIN).exists():
        bookings = Booking.objects.filter(user_id=user_id)
    
    paginator = BookingsPagination()
    result_page = paginator.paginate_queryset(bookings, request)
    serializer = BookingSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdmin])
def all_bookings(request):
    """Get all bookings (Admin only)"""
    bookings = Booking.objects.all().select_related(
        'trip__route__origin_city',
        'trip__route__destination_city',
        'trip__route__company',
        'trip__bus',
        'user'
    )
    
    paginator = BookingsPagination()
    result_page = paginator.paginate_queryset(bookings, request)
    serializer = BookingSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsCompanyOwner])
def company_bookings(request):
    """Get bookings for current user's company"""
    company = request.user.companies.first()
    if not company:
        return Response({'error': 'No company found'}, status=status.HTTP_404_NOT_FOUND)
    
    bookings = Booking.objects.filter(trip__route__company=company).select_related(
        'trip__route__origin_city',
        'trip__route__destination_city',
        'trip__bus',
        'user'
    )
    
    # Filter by company_id
    company_id = request.query_params.get('company_id')
    if company_id:
        bookings = Booking.objects.filter(trip__route__company_id=company_id)
    
    paginator = BookingsPagination()
    result_page = paginator.paginate_queryset(bookings, request)
    serializer = BookingSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_booking(request, booking_id):
    """Get booking details"""
    try:
        booking = Booking.objects.select_related(
            'trip__route__origin_city',
            'trip__route__destination_city',
            'trip__route__company',
            'trip__bus'
        ).prefetch_related('passengers').get(id=booking_id)
        
        # Check ownership
        if booking.user != request.user and not request.user.roles.filter(role=AppRole.ADMIN).exists():
            if booking.trip.route.company.owner != request.user:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        return Response(BookingSerializer(booking).data)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_passengers(request, booking_id):
    """Get passengers for a booking"""
    try:
        booking = Booking.objects.get(id=booking_id)
        
        # Check ownership
        if booking.user != request.user and not request.user.roles.filter(role=AppRole.ADMIN).exists():
            if booking.trip.route.company.owner != request.user:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        passengers = BookingPassenger.objects.filter(booking=booking)
        serializer = BookingPassengerSerializer(passengers, many=True)
        return Response(serializer.data)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    """Create a new booking"""
    serializer = BookingCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        booking = serializer.save()
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request, booking_id):
    """Confirm payment for a booking"""
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
        
        if booking.status != BookingStatus.PENDING:
            return Response({'error': 'Booking is not pending'}, status=status.HTTP_400_BAD_REQUEST)
        
        if booking.hold_expires_at and booking.hold_expires_at < timezone.now():
            booking.status = BookingStatus.EXPIRED
            booking.save()
            return Response({'error': 'Booking has expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = BookingStatus.CONFIRMED
        booking.payment_completed_at = timezone.now()
        booking.save()
        
        return Response(BookingSerializer(booking).data)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    """Cancel a booking"""
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
        
        if booking.status == BookingStatus.CANCELLED:
            return Response({'error': 'Booking already cancelled'}, status=status.HTTP_400_BAD_REQUEST)
        
        reason = request.data.get('reason', '')
        booking.status = BookingStatus.CANCELLED
        booking.cancelled_at = timezone.now()
        booking.cancellation_reason = reason
        booking.save()
        
        # Restore available seats
        booking.trip.available_seats += len(booking.seats)
        booking.trip.save()
        
        return Response(BookingSerializer(booking).data)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
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
        description="API for bus booking system",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/cities/', include('apps.cities.urls')),
    path('api/v1/companies/', include('apps.companies.urls')),
    path('api/v1/buses/', include('apps.buses.urls')),
    path('api/v1/routes/', include('apps.routes.urls')),
    path('api/v1/trips/', include('apps.trips.urls')),
    path('api/v1/bookings/', include('apps.bookings.urls')),
    
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
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', views.me, name='me'),
    path('profile/', views.profile, name='profile'),
    path('password-reset/', views.password_reset, name='password-reset'),
    path('password-change/', views.password_change, name='password-change'),
    path('users/', views.list_users, name='list-users'),
    path('roles/assign/', views.assign_role, name='assign-role'),
    path('roles/<uuid:user_id>/<str:role>/', views.remove_role, name='remove-role'),
    path('user-roles/', views.list_user_roles, name='list-user-roles'),
    path('user-roles/check/', views.check_user_role, name='check-user-role'),
]
```

### Cities URLs (apps/cities/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_cities, name='list-cities'),
    path('<uuid:city_id>/', views.get_city, name='get-city'),
    path('create/', views.create_city, name='create-city'),
    path('<uuid:city_id>/update/', views.update_city, name='update-city'),
    path('<uuid:city_id>/delete/', views.delete_city, name='delete-city'),
]
```

### Companies URLs (apps/companies/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_companies, name='list-companies'),
    path('all/', views.list_all_companies, name='list-all-companies'),
    path('my/', views.my_company, name='my-company'),
    path('<uuid:company_id>/', views.get_company, name='get-company'),
    path('create/', views.create_company, name='create-company'),
    path('<uuid:company_id>/update/', views.update_company, name='update-company'),
    path('<uuid:company_id>/verify/', views.verify_company, name='verify-company'),
]
```

### Buses URLs (apps/buses/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_buses, name='list-buses'),
    path('<uuid:bus_id>/', views.get_bus, name='get-bus'),
    path('create/', views.create_bus, name='create-bus'),
    path('<uuid:bus_id>/update/', views.update_bus, name='update-bus'),
    path('<uuid:bus_id>/delete/', views.delete_bus, name='delete-bus'),
    path('<uuid:bus_id>/toggle-status/', views.toggle_bus_status, name='toggle-bus-status'),
]
```

### Routes URLs (apps/routes/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_routes, name='list-routes'),
    path('my/', views.my_routes, name='my-routes'),
    path('<uuid:route_id>/', views.get_route, name='get-route'),
    path('create/', views.create_route, name='create-route'),
    path('<uuid:route_id>/update/', views.update_route, name='update-route'),
    path('<uuid:route_id>/delete/', views.delete_route, name='delete-route'),
    path('<uuid:route_id>/toggle-status/', views.toggle_route_status, name='toggle-route-status'),
]
```

### Trips URLs (apps/trips/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.search_trips, name='search-trips'),
    path('my/', views.my_trips, name='my-trips'),
    path('<uuid:trip_id>/', views.get_trip, name='get-trip'),
    path('<uuid:trip_id>/seats/', views.get_trip_seats, name='get-trip-seats'),
    path('create/', views.create_trip, name='create-trip'),
    path('<uuid:trip_id>/update/', views.update_trip, name='update-trip'),
    path('<uuid:trip_id>/delete/', views.delete_trip, name='delete-trip'),
]
```

### Bookings URLs (apps/bookings/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.my_bookings, name='my-bookings'),
    path('all/', views.all_bookings, name='all-bookings'),
    path('company/', views.company_bookings, name='company-bookings'),
    path('<uuid:booking_id>/', views.get_booking, name='get-booking'),
    path('<uuid:booking_id>/passengers/', views.booking_passengers, name='booking-passengers'),
    path('create/', views.create_booking, name='create-booking'),
    path('<uuid:booking_id>/confirm-payment/', views.confirm_payment, name='confirm-payment'),
    path('<uuid:booking_id>/cancel/', views.cancel_booking, name='cancel-booking'),
]
```

---

## API Endpoints Summary

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| **Authentication** |
| `/api/v1/auth/register/` | POST | Register new user | No |
| `/api/v1/auth/login/` | POST | Login user | No |
| `/api/v1/auth/logout/` | POST | Logout user | Yes |
| `/api/v1/auth/refresh/` | POST | Refresh access token | No |
| `/api/v1/auth/me/` | GET | Get current user | Yes |
| `/api/v1/auth/profile/` | GET, PUT, PATCH | User profile | Yes |
| `/api/v1/auth/password-reset/` | POST | Request password reset | No |
| `/api/v1/auth/password-change/` | POST | Change password | Yes |
| `/api/v1/auth/users/` | GET | List users (Admin) | Admin |
| `/api/v1/auth/roles/assign/` | POST | Assign role (Admin) | Admin |
| `/api/v1/auth/roles/{user_id}/{role}/` | DELETE | Remove role (Admin) | Admin |
| `/api/v1/auth/user-roles/` | GET | List user roles | Yes |
| `/api/v1/auth/user-roles/check/` | GET | Check user role | Yes |
| **Cities** |
| `/api/v1/cities/` | GET | List cities | No |
| `/api/v1/cities/{id}/` | GET | Get city | No |
| `/api/v1/cities/create/` | POST | Create city (Admin) | Admin |
| `/api/v1/cities/{id}/update/` | PUT, PATCH | Update city (Admin) | Admin |
| `/api/v1/cities/{id}/delete/` | DELETE | Delete city (Admin) | Admin |
| **Companies** |
| `/api/v1/companies/` | GET | List verified companies | No |
| `/api/v1/companies/all/` | GET | List all companies (Admin) | Admin |
| `/api/v1/companies/my/` | GET | Get my company | Owner |
| `/api/v1/companies/{id}/` | GET | Get company | No |
| `/api/v1/companies/create/` | POST | Create company | Yes |
| `/api/v1/companies/{id}/update/` | PUT, PATCH | Update company | Owner |
| `/api/v1/companies/{id}/verify/` | PATCH | Verify company (Admin) | Admin |
| **Buses** |
| `/api/v1/buses/` | GET | List buses (filter by company_id) | Owner |
| `/api/v1/buses/{id}/` | GET | Get bus details | Owner |
| `/api/v1/buses/create/` | POST | Create bus | Owner |
| `/api/v1/buses/{id}/update/` | PUT, PATCH | Update bus | Owner |
| `/api/v1/buses/{id}/delete/` | DELETE | Delete bus | Owner |
| `/api/v1/buses/{id}/toggle-status/` | PATCH | Toggle bus active status | Owner |
| **Routes** |
| `/api/v1/routes/` | GET | List routes (filter by company_id) | No |
| `/api/v1/routes/my/` | GET | My company's routes | Owner |
| `/api/v1/routes/{id}/` | GET | Get route details | No |
| `/api/v1/routes/create/` | POST | Create route | Owner |
| `/api/v1/routes/{id}/update/` | PUT, PATCH | Update route | Owner |
| `/api/v1/routes/{id}/delete/` | DELETE | Delete route | Owner |
| `/api/v1/routes/{id}/toggle-status/` | PATCH | Toggle route active status | Owner |
| **Trips** |
| `/api/v1/trips/search/` | GET | Search trips | No |
| `/api/v1/trips/my/` | GET | My company's trips | Owner |
| `/api/v1/trips/{id}/` | GET | Get trip | No |
| `/api/v1/trips/{id}/seats/` | GET | Get seats (paginated) | No |
| `/api/v1/trips/create/` | POST | Create trip | Owner |
| `/api/v1/trips/{id}/update/` | PUT, PATCH | Update trip | Owner |
| `/api/v1/trips/{id}/delete/` | DELETE | Delete trip | Owner |
| **Bookings** |
| `/api/v1/bookings/` | GET | My bookings (paginated) | Yes |
| `/api/v1/bookings/all/` | GET | All bookings (Admin) | Admin |
| `/api/v1/bookings/company/` | GET | Company bookings | Owner |
| `/api/v1/bookings/{id}/` | GET | Get booking | Yes |
| `/api/v1/bookings/{id}/passengers/` | GET | Get passengers | Yes |
| `/api/v1/bookings/create/` | POST | Create booking | Yes |
| `/api/v1/bookings/{id}/confirm-payment/` | POST | Confirm payment | Yes |
| `/api/v1/bookings/{id}/cancel/` | POST | Cancel booking | Yes |

---

## Environment Variables (.env.example)

```env
# Django
DJANGO_SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080

# Email (optional - uses console backend in development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@busbooking.com

# Payment Gateway (optional)
PAYSTACK_SECRET_KEY=your-paystack-secret
FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret
```

---

## Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │     │   Profile    │     │  UserRole    │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │◄───►│ user (FK)    │     │ user (FK)    │
│ email        │     │ full_name    │     │ role         │
│ full_name    │     │ phone        │     └──────────────┘
│ phone        │     └──────────────┘
│ password     │
└──────┬───────┘
       │
       │ owns
       ▼
┌──────────────┐
│   Company    │
├──────────────┤
│ id (PK)      │──────────────────────────────────────┐
│ owner (FK)   │                                      │
│ name         │                                      │
│ logo_url     │                                      │
│ rating       │                                      │
│ is_verified  │                                      │
└──────┬───────┘                                      │
       │                                              │
       │ has                                          │
       ▼                                              │
┌──────────────┐     ┌──────────────┐                │
│    Bus       │     │    Route     │                │
├──────────────┤     ├──────────────┤                │
│ id (PK)      │     │ id (PK)      │◄───────────────┘
│ company (FK) │     │ company (FK) │
│ plate_number │     │ origin (FK)  │──────► City
│ bus_type     │     │ dest (FK)    │──────► City
│ total_seats  │     │ base_price   │
│ amenities    │     │ duration     │
└──────┬───────┘     └──────┬───────┘
       │                    │
       │         ┌──────────┘
       ▼         ▼
┌─────────────────────┐
│        Trip         │
├─────────────────────┤
│ id (PK)             │
│ route (FK)          │
│ bus (FK)            │
│ departure_time      │
│ arrival_time        │
│ price               │
│ available_seats     │
│ status              │
└──────────┬──────────┘
           │
           │ has
           ▼
┌─────────────────────┐     ┌────────────────────┐
│      Booking        │     │  BookingPassenger  │
├─────────────────────┤     ├────────────────────┤
│ id (PK)             │◄───►│ booking (FK)       │
│ trip (FK)           │     │ full_name          │
│ user (FK)           │     │ phone              │
│ seats (JSON)        │     │ email              │
│ total_amount        │     │ nin                │
│ status              │     │ seat_number        │
│ ticket_code         │     └────────────────────┘
│ passenger_name      │
│ passenger_email     │
│ passenger_phone     │
│ hold_expires_at     │
│ payment_completed_at│
└─────────────────────┘
```

---

## Sample Data Fixtures (fixtures/sample_data.json)

```json
[
  {
    "model": "cities.city",
    "pk": "550e8400-e29b-41d4-a716-446655440001",
    "fields": {
      "name": "Lagos",
      "state": "Lagos",
      "created_at": "2024-01-01T00:00:00Z"
    }
  },
  {
    "model": "cities.city",
    "pk": "550e8400-e29b-41d4-a716-446655440002",
    "fields": {
      "name": "Abuja",
      "state": "FCT",
      "created_at": "2024-01-01T00:00:00Z"
    }
  },
  {
    "model": "cities.city",
    "pk": "550e8400-e29b-41d4-a716-446655440003",
    "fields": {
      "name": "Port Harcourt",
      "state": "Rivers",
      "created_at": "2024-01-01T00:00:00Z"
    }
  },
  {
    "model": "cities.city",
    "pk": "550e8400-e29b-41d4-a716-446655440004",
    "fields": {
      "name": "Kano",
      "state": "Kano",
      "created_at": "2024-01-01T00:00:00Z"
    }
  },
  {
    "model": "cities.city",
    "pk": "550e8400-e29b-41d4-a716-446655440005",
    "fields": {
      "name": "Ibadan",
      "state": "Oyo",
      "created_at": "2024-01-01T00:00:00Z"
    }
  },
  {
    "model": "cities.city",
    "pk": "550e8400-e29b-41d4-a716-446655440006",
    "fields": {
      "name": "Benin City",
      "state": "Edo",
      "created_at": "2024-01-01T00:00:00Z"
    }
  },
  {
    "model": "cities.city",
    "pk": "550e8400-e29b-41d4-a716-446655440007",
    "fields": {
      "name": "Enugu",
      "state": "Enugu",
      "created_at": "2024-01-01T00:00:00Z"
    }
  },
  {
    "model": "cities.city",
    "pk": "550e8400-e29b-41d4-a716-446655440008",
    "fields": {
      "name": "Calabar",
      "state": "Cross River",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
]
```

---

## Background Tasks (Management Commands)

Without Celery/Redis, use Django management commands for background tasks:

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

### Send Departure Reminders (apps/bookings/management/commands/send_reminders.py)

```python
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
from apps.bookings.models import Booking, BookingStatus


class Command(BaseCommand):
    help = 'Send departure reminders for bookings departing in 24 hours'

    def handle(self, *args, **options):
        tomorrow = timezone.now() + timedelta(hours=24)
        today = timezone.now()
        
        bookings = Booking.objects.filter(
            status=BookingStatus.CONFIRMED,
            trip__departure_time__range=(today, tomorrow)
        ).select_related('trip__route__origin_city', 'trip__route__destination_city')
        
        count = 0
        for booking in bookings:
            try:
                send_mail(
                    subject=f'Reminder: Your trip tomorrow - {booking.ticket_code}',
                    message=f'''
Dear {booking.passenger_name},

This is a reminder that your trip is tomorrow!

Ticket Code: {booking.ticket_code}
Route: {booking.trip.route.origin_city.name} to {booking.trip.route.destination_city.name}
Departure: {booking.trip.departure_time.strftime('%Y-%m-%d %H:%M')}
Seats: {', '.join(booking.seats)}

Please arrive at least 30 minutes before departure.

Safe travels!
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[booking.passenger_email],
                    fail_silently=True
                )
                count += 1
            except Exception as e:
                self.stderr.write(f'Failed to send reminder for {booking.ticket_code}: {e}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Sent {count} departure reminders')
        )
```

### Scheduling with Cron

```bash
# Edit crontab
crontab -e

# Add these lines:
# Expire pending bookings every 5 minutes
*/5 * * * * cd /path/to/project && /path/to/venv/bin/python manage.py expire_bookings

# Send departure reminders daily at 8 AM
0 8 * * * cd /path/to/project && /path/to/venv/bin/python manage.py send_reminders
```

---

## Testing Strategy

### Test Configuration (pytest.ini)

```ini
[pytest]
DJANGO_SETTINGS_MODULE = bus_booking.settings_test
python_files = tests.py test_*.py *_test.py
addopts = -v --tb=short
```

### Test Fixtures (tests/conftest.py)

```python
import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User, UserRole, AppRole


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user():
    def _create_user(email='test@example.com', password='testpass123', **kwargs):
        user = User.objects.create_user(email=email, password=password, **kwargs)
        UserRole.objects.create(user=user, role=AppRole.PASSENGER)
        return user
    return _create_user


@pytest.fixture
def authenticated_client(api_client, create_user):
    user = create_user()
    api_client.force_authenticate(user=user)
    return api_client, user


@pytest.fixture
def admin_client(api_client, create_user):
    user = create_user(email='admin@example.com')
    UserRole.objects.create(user=user, role=AppRole.ADMIN)
    api_client.force_authenticate(user=user)
    return api_client, user
```

### Example Unit Tests (tests/test_unit/test_models.py)

```python
import pytest
from apps.accounts.models import User, UserRole, AppRole
from apps.cities.models import City


@pytest.mark.django_db
class TestUserModel:
    def test_create_user(self):
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            full_name='Test User'
        )
        assert user.email == 'test@example.com'
        assert user.full_name == 'Test User'
        assert user.check_password('testpass123')
    
    def test_create_superuser(self):
        user = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123'
        )
        assert user.is_staff
        assert user.is_superuser


@pytest.mark.django_db
class TestCityModel:
    def test_create_city(self):
        city = City.objects.create(name='Lagos', state='Lagos')
        assert str(city) == 'Lagos, Lagos'
```

### Example Integration Tests (tests/test_integration/test_auth.py)

```python
import pytest
from django.urls import reverse


@pytest.mark.django_db
class TestAuthEndpoints:
    def test_register(self, api_client):
        response = api_client.post('/api/v1/auth/register/', {
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'full_name': 'New User'
        })
        assert response.status_code == 201
        assert 'access' in response.data
        assert 'refresh' in response.data
    
    def test_login(self, api_client, create_user):
        create_user(email='login@example.com', password='loginpass')
        response = api_client.post('/api/v1/auth/login/', {
            'email': 'login@example.com',
            'password': 'loginpass'
        })
        assert response.status_code == 200
        assert 'access' in response.data
    
    def test_me(self, authenticated_client):
        client, user = authenticated_client
        response = client.get('/api/v1/auth/me/')
        assert response.status_code == 200
        assert response.data['email'] == user.email
```

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=apps --cov-report=html

# Run specific test file
pytest tests/test_unit/test_models.py

# Run in parallel
pytest -n auto
```

---

## CI/CD Pipeline (.github/workflows/django.yml)

```yaml
name: Django CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Cache pip packages
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}
        restore-keys: |
          ${{ runner.os }}-pip-
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: Run migrations
      env:
        DJANGO_SECRET_KEY: test-secret-key
        DEBUG: 'True'
      run: |
        python manage.py migrate
    
    - name: Run tests
      env:
        DJANGO_SECRET_KEY: test-secret-key
        DEBUG: 'True'
      run: |
        pytest --cov=apps --cov-report=xml --junitxml=test-results.xml -n auto
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: coverage.xml
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: test-results.xml

  lint:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install linters
      run: |
        pip install flake8 black isort
    
    - name: Run flake8
      run: flake8 apps/ --max-line-length=120
    
    - name: Check black formatting
      run: black --check apps/
    
    - name: Check import sorting
      run: isort --check-only apps/
```

---

## Production Deployment Notes

### Database Options for Production

SQLite is ideal for development and testing. For production, consider:

**Option 1: PostgreSQL (Recommended)**
```bash
pip install psycopg2-binary
```

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

**Option 2: MySQL**
```bash
pip install mysqlclient
```

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '3306'),
    }
}
```

### WSGI Server Setup

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn bus_booking.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /static/ {
        alias /path/to/project/staticfiles/;
    }

    location /media/ {
        alias /path/to/project/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
- [ ] Collect static files: `python manage.py collectstatic`
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Set up rate limiting

### Deployment Commands

```bash
# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate --noinput

# Create superuser
python manage.py createsuperuser

# Security check
python manage.py check --deploy
```

---

## Frontend Integration Notes

1. **JWT Tokens**: Store JWT tokens securely and include them in API requests via the `Authorization: Bearer <token>` header.

2. **Pagination**: All list endpoints support pagination with `page` and `page_size` query parameters. Response includes `count`, `current_page`, `total_pages`, `next`, `previous`, and `results`.

3. **Search/Filter**: Most list endpoints support search and filter query parameters (e.g., `?search=lagos`, `?company_id=xxx`).

4. **Seat Selection**: The `/api/v1/trips/{id}/seats/` endpoint returns paginated seats for the booking page.

5. **Multi-Passenger Booking**: The booking creation endpoint accepts multiple passengers linked to individual seats.

6. **Role-Based Access**: Three roles are supported - `admin`, `company_admin`, and `passenger`.

7. **API Response Format**: All responses use snake_case. Frontend mappers should convert to camelCase as needed.

8. **Error Handling**: Errors return JSON with `error` key and appropriate HTTP status codes.

---

This structure mirrors the current Lovable Cloud schema and provides a complete reference for Django backend integration. The SQLite configuration enables quick local development while maintaining easy migration paths to production databases.
