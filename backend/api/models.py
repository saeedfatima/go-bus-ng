from django.db import models
from django.contrib.auth.models import User

class City(models.Model):
    name = models.CharField(max_length=100)
    state = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name}, {self.state}"

class Company(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company', null=True, blank=True)
    name = models.CharField(max_length=100)
    logo = models.URLField(max_length=500)
    rating = models.FloatField(default=0.0)
    total_trips = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Bus(models.Model):
    BUS_TYPES = [
        ('standard', 'Standard'),
        ('luxury', 'Luxury'),
        ('executive', 'Executive'),
    ]
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='buses')
    plate_number = models.CharField(max_length=20)
    bus_type = models.CharField(max_length=20, choices=BUS_TYPES)
    total_seats = models.IntegerField()
    amenities = models.JSONField(default=list)

    def __str__(self):
        return f"{self.plate_number} ({self.company.name})"

class Route(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='routes')
    origin = models.ForeignKey(City, on_delete=models.CASCADE, related_name='routes_from')
    destination = models.ForeignKey(City, on_delete=models.CASCADE, related_name='routes_to')
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_hours = models.FloatField()

    def __str__(self):
        return f"{self.origin.name} to {self.destination.name}"

class Trip(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('boarding', 'Boarding'),
        ('departed', 'Departed'),
        ('arrived', 'Arrived'),
        ('cancelled', 'Cancelled'),
    ]
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='trips')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='trips')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='trips')
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    available_seats = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')

    def __str__(self):
        return f"{self.route} on {self.departure_time}"

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    seats = models.JSONField(default=list)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    ticket_code = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    passenger_name = models.CharField(max_length=100, blank=True, null=True)
    passenger_email = models.EmailField(blank=True, null=True)
    passenger_phone = models.CharField(max_length=20, blank=True, null=True)
    hold_expires_at = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.pk:  # New booking
            # Decrease available seats
            self.trip.available_seats -= len(self.seats)
            self.trip.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking {self.ticket_code} for {self.user.username}"

class BookingPassenger(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='passengers')
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    nin = models.CharField(max_length=20, blank=True, null=True)
    seat_number = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.full_name} ({self.seat_number})"
