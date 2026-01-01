# Django Backend Structure for Bus Booking System

This document outlines the complete Django REST Framework backend structure for future integration.

## Project Structure

```
bus_booking_backend/
├── manage.py
├── requirements.txt
├── .env
├── bus_booking/                    # Main project directory
│   ├── __init__.py
│   ├── settings.py
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
└── utils/
    ├── __init__.py
    ├── pagination.py
    └── permissions.py
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
psycopg2-binary>=2.9.9
Pillow>=10.1.0
celery>=5.3.4
redis>=5.0.1
gunicorn>=21.2.0
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

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

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

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

CORS_ALLOWED_ORIGINS = os.getenv('CORS_ORIGINS', '').split(',')
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
from django.contrib.postgres.fields import ArrayField
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
    amenities = ArrayField(models.CharField(max_length=50), blank=True, default=list)
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
from django.contrib.postgres.fields import ArrayField
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
    seats = ArrayField(models.CharField(max_length=5))
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
        ordering = ['seat_number']

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


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'roles', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_roles(self, obj):
        return [role.role for role in obj.roles.all()]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'confirm_password', 'full_name', 'phone']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        # Create default passenger role
        UserRole.objects.create(user=user, role=AppRole.PASSENGER)
        # Create profile
        Profile.objects.create(user=user, full_name=user.full_name, phone=user.phone)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled')
        data['user'] = user
        return data


class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ['id', 'user', 'role']


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'email', 'full_name', 'phone', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
```

### 2. Cities Serializers (apps/cities/serializers.py)

```python
from rest_framework import serializers
from .models import City


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name', 'state', 'created_at']
        read_only_fields = ['id', 'created_at']
```

### 3. Companies Serializers (apps/companies/serializers.py)

```python
from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'logo_url', 'description', 'rating',
            'total_trips', 'is_verified', 'owner', 'owner_email',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'rating', 'total_trips', 'is_verified', 'created_at', 'updated_at']


class CompanyListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'logo_url', 'rating', 'total_trips', 'is_verified']
```

### 4. Buses Serializers (apps/buses/serializers.py)

```python
from rest_framework import serializers
from .models import Bus


class BusSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = Bus
        fields = [
            'id', 'company', 'company_name', 'plate_number', 'bus_type',
            'total_seats', 'amenities', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BusListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = ['id', 'plate_number', 'bus_type', 'total_seats', 'amenities', 'is_active']
```

### 5. Routes Serializers (apps/routes/serializers.py)

```python
from rest_framework import serializers
from .models import Route
from apps.cities.serializers import CitySerializer


class RouteSerializer(serializers.ModelSerializer):
    origin_city_detail = CitySerializer(source='origin_city', read_only=True)
    destination_city_detail = CitySerializer(source='destination_city', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = Route
        fields = [
            'id', 'company', 'company_name', 'origin_city', 'destination_city',
            'origin_city_detail', 'destination_city_detail', 'base_price',
            'duration_hours', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RouteListSerializer(serializers.ModelSerializer):
    origin = serializers.CharField(source='origin_city.name')
    destination = serializers.CharField(source='destination_city.name')

    class Meta:
        model = Route
        fields = ['id', 'origin', 'destination', 'base_price', 'duration_hours', 'is_active']
```

### 6. Trips Serializers (apps/trips/serializers.py)

```python
from rest_framework import serializers
from .models import Trip
from apps.routes.serializers import RouteSerializer
from apps.buses.serializers import BusListSerializer


class TripSerializer(serializers.ModelSerializer):
    route_detail = RouteSerializer(source='route', read_only=True)
    bus_detail = BusListSerializer(source='bus', read_only=True)
    company_name = serializers.CharField(source='route.company.name', read_only=True)
    company_id = serializers.UUIDField(source='route.company.id', read_only=True)

    class Meta:
        model = Trip
        fields = [
            'id', 'route', 'route_detail', 'bus', 'bus_detail', 'company_name',
            'company_id', 'departure_time', 'arrival_time', 'price',
            'available_seats', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TripSearchSerializer(serializers.ModelSerializer):
    origin = serializers.CharField(source='route.origin_city.name')
    destination = serializers.CharField(source='route.destination_city.name')
    company_name = serializers.CharField(source='route.company.name')
    company_logo = serializers.URLField(source='route.company.logo_url')
    company_rating = serializers.DecimalField(source='route.company.rating', max_digits=3, decimal_places=2)
    bus_type = serializers.CharField(source='bus.bus_type')
    amenities = serializers.ListField(source='bus.amenities')

    class Meta:
        model = Trip
        fields = [
            'id', 'origin', 'destination', 'company_name', 'company_logo',
            'company_rating', 'departure_time', 'arrival_time', 'price',
            'available_seats', 'bus_type', 'amenities', 'status'
        ]
```

### 7. Bookings Serializers (apps/bookings/serializers.py)

```python
from rest_framework import serializers
from .models import Booking, BookingPassenger
from apps.trips.serializers import TripSerializer


class BookingPassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingPassenger
        fields = ['id', 'full_name', 'phone', 'email', 'nin', 'seat_number', 'created_at']
        read_only_fields = ['id', 'created_at']


class BookingSerializer(serializers.ModelSerializer):
    passengers = BookingPassengerSerializer(many=True, read_only=True)
    trip_detail = TripSerializer(source='trip', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'trip', 'trip_detail', 'user', 'seats', 'total_amount',
            'status', 'ticket_code', 'passenger_name', 'passenger_phone',
            'passenger_email', 'passengers', 'hold_expires_at',
            'payment_completed_at', 'cancelled_at', 'cancellation_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ticket_code', 'created_at', 'updated_at']


class BookingCreateSerializer(serializers.Serializer):
    trip_id = serializers.UUIDField()
    seats = serializers.ListField(child=serializers.CharField(max_length=5), min_length=1)
    passengers = BookingPassengerSerializer(many=True)
    passenger_name = serializers.CharField(max_length=255)
    passenger_phone = serializers.CharField(max_length=20)
    passenger_email = serializers.EmailField()

    def validate(self, data):
        if len(data['seats']) != len(data['passengers']):
            raise serializers.ValidationError('Number of seats must match number of passengers')
        return data


class BookingListSerializer(serializers.ModelSerializer):
    origin = serializers.CharField(source='trip.route.origin_city.name')
    destination = serializers.CharField(source='trip.route.destination_city.name')
    departure_time = serializers.DateTimeField(source='trip.departure_time')
    company_name = serializers.CharField(source='trip.route.company.name')

    class Meta:
        model = Booking
        fields = [
            'id', 'ticket_code', 'origin', 'destination', 'departure_time',
            'company_name', 'seats', 'total_amount', 'status', 'created_at'
        ]
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
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })


class SeatsPagination(PageNumberPagination):
    """Pagination for seat selection in booking page"""
    page_size = 12  # Show 12 seats per page (good for grid layout)
    page_size_query_param = 'page_size'
    max_page_size = 48

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'seats': data
        })


class BookingsPagination(PageNumberPagination):
    """Pagination for bookings list"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class TripsPagination(PageNumberPagination):
    """Pagination for trip search results"""
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 50
```

---

## Permissions (utils/permissions.py)

```python
from rest_framework import permissions
from apps.accounts.models import AppRole


class IsAdmin(permissions.BasePermission):
    """Allow access only to admin users"""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.roles.filter(role=AppRole.ADMIN).exists()


class IsCompanyOwner(permissions.BasePermission):
    """Allow access only to company owners"""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.roles.filter(role=AppRole.COMPANY_ADMIN).exists()

    def has_object_permission(self, request, view, obj):
        # Check if user owns the company
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'company'):
            return obj.company.owner == request.user
        if hasattr(obj, 'route'):
            return obj.route.company.owner == request.user
        return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access to owner or admin"""

    def has_object_permission(self, request, view, obj):
        if request.user.roles.filter(role=AppRole.ADMIN).exists():
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        return False


class IsPassenger(permissions.BasePermission):
    """Allow access to passengers"""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.roles.filter(role=AppRole.PASSENGER).exists()
```

---

## Views (Function-Based with @api_view)

### 1. Accounts Views (apps/accounts/views.py)

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import UserRole, Profile, AppRole
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    UserRoleSerializer, ProfileSerializer
)
from utils.permissions import IsAdmin
from utils.pagination import StandardResultsPagination

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user and return tokens"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user by blacklisting refresh token"""
    try:
        refresh_token = request.data.get('refresh_token')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current authenticated user"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get or update user profile"""
    try:
        profile = Profile.objects.get(user=request.user)
    except Profile.DoesNotExist:
        profile = Profile.objects.create(user=request.user)

    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    serializer = ProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdmin])
def list_users(request):
    """List all users (Admin only)"""
    paginator = StandardResultsPagination()
    users = User.objects.all()
    
    # Search filter
    search = request.query_params.get('search', '')
    if search:
        users = users.filter(email__icontains=search) | users.filter(full_name__icontains=search)
    
    result_page = paginator.paginate_queryset(users, request)
    serializer = UserSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def assign_role(request):
    """Assign role to user (Admin only)"""
    user_id = request.data.get('user_id')
    role = request.data.get('role')

    if role not in [choice[0] for choice in AppRole.choices]:
        return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    user_role, created = UserRole.objects.get_or_create(user=user, role=role)
    if not created:
        return Response({'message': 'User already has this role'}, status=status.HTTP_200_OK)

    return Response({'message': f'Role {role} assigned to user'}, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def remove_role(request, user_id, role):
    """Remove role from user (Admin only)"""
    try:
        user_role = UserRole.objects.get(user_id=user_id, role=role)
        user_role.delete()
        return Response({'message': 'Role removed successfully'}, status=status.HTTP_200_OK)
    except UserRole.DoesNotExist:
        return Response({'error': 'Role not found'}, status=status.HTTP_404_NOT_FOUND)
```

### 2. Cities Views (apps/cities/views.py)

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import City
from .serializers import CitySerializer
from utils.pagination import StandardResultsPagination
from utils.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([AllowAny])
def list_cities(request):
    """List all cities with optional search"""
    cities = City.objects.all()
    
    search = request.query_params.get('search', '')
    if search:
        cities = cities.filter(name__icontains=search) | cities.filter(state__icontains=search)
    
    state = request.query_params.get('state', '')
    if state:
        cities = cities.filter(state__iexact=state)
    
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
        serializer = CitySerializer(city)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAdmin])
def create_city(request):
    """Create a new city (Admin only)"""
    serializer = CitySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdmin])
def update_city(request, city_id):
    """Update a city (Admin only)"""
    try:
        city = City.objects.get(id=city_id)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = CitySerializer(city, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def delete_city(request, city_id):
    """Delete a city (Admin only)"""
    try:
        city = City.objects.get(id=city_id)
        city.delete()
        return Response({'message': 'City deleted successfully'}, status=status.HTTP_200_OK)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)
```

### 3. Companies Views (apps/companies/views.py)

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Company
from .serializers import CompanySerializer, CompanyListSerializer
from apps.accounts.models import UserRole, AppRole
from utils.pagination import StandardResultsPagination
from utils.permissions import IsCompanyOwner, IsAdmin


@api_view(['GET'])
@permission_classes([AllowAny])
def list_companies(request):
    """List all verified companies"""
    companies = Company.objects.filter(is_verified=True)
    
    search = request.query_params.get('search', '')
    if search:
        companies = companies.filter(name__icontains=search)
    
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(companies, request)
    serializer = CompanyListSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_company(request, company_id):
    """Get company details"""
    try:
        company = Company.objects.get(id=company_id)
        serializer = CompanySerializer(company)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_company(request):
    """Create a new company"""
    data = request.data.copy()
    data['owner'] = request.user.id
    
    serializer = CompanySerializer(data=data)
    if serializer.is_valid():
        company = serializer.save()
        # Assign company_admin role to the owner
        UserRole.objects.get_or_create(user=request.user, role=AppRole.COMPANY_ADMIN)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsCompanyOwner])
def update_company(request, company_id):
    """Update company details (Owner only)"""
    try:
        company = Company.objects.get(id=company_id, owner=request.user)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

    serializer = CompanySerializer(company, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_company(request):
    """Get current user's company"""
    try:
        company = Company.objects.get(owner=request.user)
        serializer = CompanySerializer(company)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Company.DoesNotExist:
        return Response({'error': 'No company found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsAdmin])
def verify_company(request, company_id):
    """Verify or unverify a company (Admin only)"""
    try:
        company = Company.objects.get(id=company_id)
        company.is_verified = request.data.get('is_verified', True)
        company.save()
        return Response({'message': f'Company verification updated'}, status=status.HTTP_200_OK)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAdmin])
def list_all_companies(request):
    """List all companies including unverified (Admin only)"""
    companies = Company.objects.all()
    
    is_verified = request.query_params.get('is_verified')
    if is_verified is not None:
        companies = companies.filter(is_verified=is_verified.lower() == 'true')
    
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(companies, request)
    serializer = CompanySerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)
```

### 4. Buses Views (apps/buses/views.py)

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Bus
from .serializers import BusSerializer, BusListSerializer
from apps.companies.models import Company
from utils.pagination import StandardResultsPagination
from utils.permissions import IsCompanyOwner


@api_view(['GET'])
@permission_classes([AllowAny])
def list_buses(request, company_id):
    """List all buses for a company"""
    buses = Bus.objects.filter(company_id=company_id, is_active=True)
    
    bus_type = request.query_params.get('bus_type', '')
    if bus_type:
        buses = buses.filter(bus_type=bus_type)
    
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(buses, request)
    serializer = BusListSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_bus(request, bus_id):
    """Get bus details"""
    try:
        bus = Bus.objects.get(id=bus_id)
        serializer = BusSerializer(bus)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Bus.DoesNotExist:
        return Response({'error': 'Bus not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsCompanyOwner])
def create_bus(request):
    """Create a new bus (Company owner only)"""
    try:
        company = Company.objects.get(owner=request.user)
    except Company.DoesNotExist:
        return Response({'error': 'You do not own a company'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()
    data['company'] = company.id
    
    serializer = BusSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsCompanyOwner])
def update_bus(request, bus_id):
    """Update bus details (Company owner only)"""
    try:
        bus = Bus.objects.get(id=bus_id, company__owner=request.user)
    except Bus.DoesNotExist:
        return Response({'error': 'Bus not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

    serializer = BusSerializer(bus, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsCompanyOwner])
def delete_bus(request, bus_id):
    """Delete a bus (Company owner only)"""
    try:
        bus = Bus.objects.get(id=bus_id, company__owner=request.user)
        bus.delete()
        return Response({'message': 'Bus deleted successfully'}, status=status.HTTP_200_OK)
    except Bus.DoesNotExist:
        return Response({'error': 'Bus not found or access denied'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsCompanyOwner])
def my_buses(request):
    """Get all buses for current user's company"""
    try:
        company = Company.objects.get(owner=request.user)
        buses = Bus.objects.filter(company=company)
        
        paginator = StandardResultsPagination()
        result_page = paginator.paginate_queryset(buses, request)
        serializer = BusSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    except Company.DoesNotExist:
        return Response({'error': 'You do not own a company'}, status=status.HTTP_403_FORBIDDEN)
```

### 5. Routes Views (apps/routes/views.py)

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Route
from .serializers import RouteSerializer, RouteListSerializer
from apps.companies.models import Company
from utils.pagination import StandardResultsPagination
from utils.permissions import IsCompanyOwner


@api_view(['GET'])
@permission_classes([AllowAny])
def list_routes(request):
    """List all active routes"""
    routes = Route.objects.filter(is_active=True)
    
    origin = request.query_params.get('origin', '')
    destination = request.query_params.get('destination', '')
    company_id = request.query_params.get('company_id', '')
    
    if origin:
        routes = routes.filter(origin_city__name__icontains=origin)
    if destination:
        routes = routes.filter(destination_city__name__icontains=destination)
    if company_id:
        routes = routes.filter(company_id=company_id)
    
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(routes, request)
    serializer = RouteListSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_route(request, route_id):
    """Get route details"""
    try:
        route = Route.objects.get(id=route_id)
        serializer = RouteSerializer(route)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Route.DoesNotExist:
        return Response({'error': 'Route not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsCompanyOwner])
def create_route(request):
    """Create a new route (Company owner only)"""
    try:
        company = Company.objects.get(owner=request.user)
    except Company.DoesNotExist:
        return Response({'error': 'You do not own a company'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()
    data['company'] = company.id
    
    serializer = RouteSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsCompanyOwner])
def update_route(request, route_id):
    """Update route (Company owner only)"""
    try:
        route = Route.objects.get(id=route_id, company__owner=request.user)
    except Route.DoesNotExist:
        return Response({'error': 'Route not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

    serializer = RouteSerializer(route, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsCompanyOwner])
def delete_route(request, route_id):
    """Delete a route (Company owner only)"""
    try:
        route = Route.objects.get(id=route_id, company__owner=request.user)
        route.delete()
        return Response({'message': 'Route deleted successfully'}, status=status.HTTP_200_OK)
    except Route.DoesNotExist:
        return Response({'error': 'Route not found or access denied'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsCompanyOwner])
def my_routes(request):
    """Get all routes for current user's company"""
    try:
        company = Company.objects.get(owner=request.user)
        routes = Route.objects.filter(company=company)
        
        paginator = StandardResultsPagination()
        result_page = paginator.paginate_queryset(routes, request)
        serializer = RouteSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    except Company.DoesNotExist:
        return Response({'error': 'You do not own a company'}, status=status.HTTP_403_FORBIDDEN)
```

### 6. Trips Views (apps/trips/views.py)

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime
from .models import Trip, TripStatus
from .serializers import TripSerializer, TripSearchSerializer
from apps.companies.models import Company
from apps.routes.models import Route
from utils.pagination import TripsPagination, StandardResultsPagination, SeatsPagination
from utils.permissions import IsCompanyOwner


@api_view(['GET'])
@permission_classes([AllowAny])
def search_trips(request):
    """Search for available trips"""
    origin = request.query_params.get('origin', '')
    destination = request.query_params.get('destination', '')
    date = request.query_params.get('date', '')
    passengers = int(request.query_params.get('passengers', 1))

    trips = Trip.objects.filter(
        status=TripStatus.SCHEDULED,
        available_seats__gte=passengers
    ).select_related(
        'route__origin_city',
        'route__destination_city',
        'route__company',
        'bus'
    )

    if origin:
        trips = trips.filter(route__origin_city__name__icontains=origin)
    if destination:
        trips = trips.filter(route__destination_city__name__icontains=destination)
    if date:
        trip_date = datetime.strptime(date, '%Y-%m-%d').date()
        trips = trips.filter(departure_time__date=trip_date)
    
    # Only show future trips
    trips = trips.filter(departure_time__gt=timezone.now())
    
    # Sort by departure time
    trips = trips.order_by('departure_time')

    paginator = TripsPagination()
    result_page = paginator.paginate_queryset(trips, request)
    serializer = TripSearchSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_trip(request, trip_id):
    """Get trip details"""
    try:
        trip = Trip.objects.select_related(
            'route__origin_city',
            'route__destination_city',
            'route__company',
            'bus'
        ).get(id=trip_id)
        serializer = TripSerializer(trip)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_trip_seats(request, trip_id):
    """Get available seats for a trip with pagination"""
    try:
        trip = Trip.objects.get(id=trip_id)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)

    # Get booked seats from confirmed bookings
    from apps.bookings.models import Booking, BookingStatus
    booked_seats = set()
    bookings = Booking.objects.filter(
        trip=trip,
        status__in=[BookingStatus.PENDING, BookingStatus.CONFIRMED]
    )
    for booking in bookings:
        booked_seats.update(booking.seats)

    # Generate all seats based on bus capacity
    total_seats = trip.bus.total_seats
    all_seats = []
    for i in range(1, total_seats + 1):
        seat_number = str(i)
        row = (i - 1) // 4 + 1
        column = (i - 1) % 4 + 1
        all_seats.append({
            'number': seat_number,
            'row': row,
            'column': column,
            'is_available': seat_number not in booked_seats,
            'type': 'premium' if row <= 2 else 'standard'
        })

    # Paginate seats
    paginator = SeatsPagination()
    result_page = paginator.paginate_queryset(all_seats, request)
    return paginator.get_paginated_response(result_page)


@api_view(['POST'])
@permission_classes([IsCompanyOwner])
def create_trip(request):
    """Create a new trip (Company owner only)"""
    try:
        company = Company.objects.get(owner=request.user)
    except Company.DoesNotExist:
        return Response({'error': 'You do not own a company'}, status=status.HTTP_403_FORBIDDEN)

    # Verify route belongs to company
    route_id = request.data.get('route')
    try:
        route = Route.objects.get(id=route_id, company=company)
    except Route.DoesNotExist:
        return Response({'error': 'Route not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

    serializer = TripSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsCompanyOwner])
def update_trip(request, trip_id):
    """Update trip (Company owner only)"""
    try:
        trip = Trip.objects.get(id=trip_id, route__company__owner=request.user)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

    serializer = TripSerializer(trip, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsCompanyOwner])
def delete_trip(request, trip_id):
    """Delete a trip (Company owner only)"""
    try:
        trip = Trip.objects.get(id=trip_id, route__company__owner=request.user)
        trip.delete()
        return Response({'message': 'Trip deleted successfully'}, status=status.HTTP_200_OK)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found or access denied'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsCompanyOwner])
def my_trips(request):
    """Get all trips for current user's company"""
    try:
        company = Company.objects.get(owner=request.user)
        trips = Trip.objects.filter(route__company=company).order_by('-departure_time')
        
        # Filter by status
        trip_status = request.query_params.get('status', '')
        if trip_status:
            trips = trips.filter(status=trip_status)
        
        paginator = StandardResultsPagination()
        result_page = paginator.paginate_queryset(trips, request)
        serializer = TripSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    except Company.DoesNotExist:
        return Response({'error': 'You do not own a company'}, status=status.HTTP_403_FORBIDDEN)
```

### 7. Bookings Views (apps/bookings/views.py)

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
from .models import Booking, BookingPassenger, BookingStatus
from .serializers import (
    BookingSerializer, BookingCreateSerializer, BookingListSerializer,
    BookingPassengerSerializer
)
from apps.trips.models import Trip
from apps.companies.models import Company
from utils.pagination import BookingsPagination, StandardResultsPagination
from utils.permissions import IsCompanyOwner, IsAdmin, IsOwnerOrAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_bookings(request):
    """Get current user's bookings"""
    bookings = Booking.objects.filter(user=request.user).order_by('-created_at')
    
    # Filter by status
    booking_status = request.query_params.get('status', '')
    if booking_status:
        bookings = bookings.filter(status=booking_status)
    
    paginator = BookingsPagination()
    result_page = paginator.paginate_queryset(bookings, request)
    serializer = BookingListSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_booking(request, booking_id):
    """Get booking details"""
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    """Create a new booking with multiple passengers"""
    serializer = BookingCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    validated_data = serializer.validated_data
    trip_id = validated_data['trip_id']
    seats = validated_data['seats']
    passengers_data = validated_data['passengers']

    try:
        trip = Trip.objects.select_for_update().get(id=trip_id)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)

    # Check seat availability
    if trip.available_seats < len(seats):
        return Response({'error': 'Not enough available seats'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if seats are already booked
    existing_bookings = Booking.objects.filter(
        trip=trip,
        status__in=[BookingStatus.PENDING, BookingStatus.CONFIRMED]
    )
    booked_seats = set()
    for booking in existing_bookings:
        booked_seats.update(booking.seats)

    for seat in seats:
        if seat in booked_seats:
            return Response(
                {'error': f'Seat {seat} is already booked'},
                status=status.HTTP_400_BAD_REQUEST
            )

    with transaction.atomic():
        # Calculate total amount
        total_amount = trip.price * len(seats)

        # Create booking
        booking = Booking.objects.create(
            trip=trip,
            user=request.user,
            seats=seats,
            total_amount=total_amount,
            passenger_name=validated_data['passenger_name'],
            passenger_phone=validated_data['passenger_phone'],
            passenger_email=validated_data['passenger_email'],
            hold_expires_at=timezone.now() + timedelta(minutes=15),
            status=BookingStatus.PENDING
        )

        # Create passengers
        for i, passenger_data in enumerate(passengers_data):
            BookingPassenger.objects.create(
                booking=booking,
                seat_number=seats[i],
                **passenger_data
            )

        # Update available seats
        trip.available_seats -= len(seats)
        trip.save()

    return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request, booking_id):
    """Confirm booking payment"""
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

    if booking.status != BookingStatus.PENDING:
        return Response({'error': 'Booking is not pending'}, status=status.HTTP_400_BAD_REQUEST)

    if booking.hold_expires_at and booking.hold_expires_at < timezone.now():
        booking.status = BookingStatus.EXPIRED
        booking.save()
        # Release seats
        booking.trip.available_seats += len(booking.seats)
        booking.trip.save()
        return Response({'error': 'Booking has expired'}, status=status.HTTP_400_BAD_REQUEST)

    booking.status = BookingStatus.CONFIRMED
    booking.payment_completed_at = timezone.now()
    booking.save()

    return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    """Cancel a booking"""
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

    if booking.status == BookingStatus.CANCELLED:
        return Response({'error': 'Booking is already cancelled'}, status=status.HTTP_400_BAD_REQUEST)

    cancellation_reason = request.data.get('reason', 'User requested cancellation')

    with transaction.atomic():
        booking.status = BookingStatus.CANCELLED
        booking.cancelled_at = timezone.now()
        booking.cancellation_reason = cancellation_reason
        booking.save()

        # Release seats
        booking.trip.available_seats += len(booking.seats)
        booking.trip.save()

    return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsCompanyOwner])
def company_bookings(request):
    """Get all bookings for company's trips"""
    try:
        company = Company.objects.get(owner=request.user)
    except Company.DoesNotExist:
        return Response({'error': 'You do not own a company'}, status=status.HTTP_403_FORBIDDEN)

    bookings = Booking.objects.filter(
        trip__route__company=company
    ).order_by('-created_at')

    # Filter by status
    booking_status = request.query_params.get('status', '')
    if booking_status:
        bookings = bookings.filter(status=booking_status)

    # Search
    search = request.query_params.get('search', '')
    if search:
        bookings = bookings.filter(
            ticket_code__icontains=search
        ) | bookings.filter(
            passenger_name__icontains=search
        ) | bookings.filter(
            passenger_phone__icontains=search
        )

    paginator = BookingsPagination()
    result_page = paginator.paginate_queryset(bookings, request)
    serializer = BookingSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdmin])
def all_bookings(request):
    """Get all bookings (Admin only)"""
    bookings = Booking.objects.all().order_by('-created_at')

    # Filter by status
    booking_status = request.query_params.get('status', '')
    if booking_status:
        bookings = bookings.filter(status=booking_status)

    # Search
    search = request.query_params.get('search', '')
    if search:
        bookings = bookings.filter(
            ticket_code__icontains=search
        ) | bookings.filter(
            passenger_name__icontains=search
        ) | bookings.filter(
            passenger_email__icontains=search
        )

    paginator = BookingsPagination()
    result_page = paginator.paginate_queryset(bookings, request)
    serializer = BookingSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_passengers(request, booking_id):
    """Get passengers for a booking with pagination"""
    try:
        booking = Booking.objects.get(id=booking_id)
        # Check access
        is_owner = booking.user == request.user
        is_company_owner = booking.trip.route.company.owner == request.user
        is_admin = request.user.roles.filter(role='admin').exists()
        
        if not (is_owner or is_company_owner or is_admin):
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

    passengers = BookingPassenger.objects.filter(booking=booking)
    paginator = StandardResultsPagination()
    result_page = paginator.paginate_queryset(passengers, request)
    serializer = BookingPassengerSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)
```

---

## URL Configuration

### Main URLs (bus_booking/urls.py)

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="Bus Booking API",
        default_version='v1',
        description="API for bus ticket booking system",
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
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
```

### Accounts URLs (apps/accounts/urls.py)

```python
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('me/', views.get_current_user, name='current-user'),
    path('profile/', views.profile, name='profile'),
    path('users/', views.list_users, name='list-users'),
    path('roles/assign/', views.assign_role, name='assign-role'),
    path('roles/<uuid:user_id>/<str:role>/', views.remove_role, name='remove-role'),
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
    path('company/<uuid:company_id>/', views.list_buses, name='list-buses'),
    path('my/', views.my_buses, name='my-buses'),
    path('<uuid:bus_id>/', views.get_bus, name='get-bus'),
    path('create/', views.create_bus, name='create-bus'),
    path('<uuid:bus_id>/update/', views.update_bus, name='update-bus'),
    path('<uuid:bus_id>/delete/', views.delete_bus, name='delete-bus'),
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
| `/api/v1/auth/me/` | GET | Get current user | Yes |
| `/api/v1/auth/profile/` | GET, PUT, PATCH | User profile | Yes |
| `/api/v1/auth/users/` | GET | List users (Admin) | Admin |
| `/api/v1/auth/roles/assign/` | POST | Assign role (Admin) | Admin |
| `/api/v1/auth/roles/{user_id}/{role}/` | DELETE | Remove role (Admin) | Admin |
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
| `/api/v1/buses/company/{company_id}/` | GET | List company buses | No |
| `/api/v1/buses/my/` | GET | My company's buses | Owner |
| `/api/v1/buses/{id}/` | GET | Get bus | No |
| `/api/v1/buses/create/` | POST | Create bus | Owner |
| `/api/v1/buses/{id}/update/` | PUT, PATCH | Update bus | Owner |
| `/api/v1/buses/{id}/delete/` | DELETE | Delete bus | Owner |
| **Routes** |
| `/api/v1/routes/` | GET | List routes | No |
| `/api/v1/routes/my/` | GET | My company's routes | Owner |
| `/api/v1/routes/{id}/` | GET | Get route | No |
| `/api/v1/routes/create/` | POST | Create route | Owner |
| `/api/v1/routes/{id}/update/` | PUT, PATCH | Update route | Owner |
| `/api/v1/routes/{id}/delete/` | DELETE | Delete route | Owner |
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
| `/api/v1/bookings/{id}/passengers/` | GET | Get passengers (paginated) | Yes |
| `/api/v1/bookings/create/` | POST | Create booking | Yes |
| `/api/v1/bookings/{id}/confirm-payment/` | POST | Confirm payment | Yes |
| `/api/v1/bookings/{id}/cancel/` | POST | Cancel booking | Yes |

---

## Environment Variables (.env)

```env
# Django
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database
DB_NAME=bus_booking
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ORIGINS=http://localhost:3000,https://your-frontend.com

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

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
┌──────────────────┐
│      Trip        │
├──────────────────┤
│ id (PK)          │
│ route (FK)       │
│ bus (FK)         │
│ departure_time   │
│ arrival_time     │
│ price            │
│ available_seats  │
│ status           │
└────────┬─────────┘
         │
         │ has
         ▼
┌──────────────────┐     ┌────────────────────┐
│    Booking       │     │ BookingPassenger   │
├──────────────────┤     ├────────────────────┤
│ id (PK)          │◄────│ booking (FK)       │
│ trip (FK)        │     │ full_name          │
│ user (FK)        │     │ phone              │
│ seats            │     │ email              │
│ total_amount     │     │ nin                │
│ status           │     │ seat_number        │
│ ticket_code      │     └────────────────────┘
│ passenger_name   │
│ passenger_phone  │
└──────────────────┘
```

---

## Notes for Integration

1. **JWT Tokens**: The React frontend should store JWT tokens securely and include them in API requests via the `Authorization: Bearer <token>` header.

2. **Pagination**: All list endpoints support pagination with `page` and `page_size` query parameters.

3. **Search/Filter**: Most list endpoints support search and filter query parameters.

4. **Seat Selection**: The `/api/v1/trips/{id}/seats/` endpoint returns paginated seats for the booking page.

5. **Multi-Passenger Booking**: The booking creation endpoint accepts multiple passengers linked to individual seats.

6. **Role-Based Access**: Three roles are supported - `admin`, `company_admin`, and `passenger`.

This structure mirrors the current Supabase schema and provides a complete reference for future Django integration.
