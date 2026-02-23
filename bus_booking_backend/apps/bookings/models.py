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
    chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return 'NB-' + ''.join(random.choices(chars, k=8))

class Booking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
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
    nin = models.CharField(max_length=20, blank=True, null=True)
    seat_number = models.CharField(max_length=5)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'booking_passengers'
        unique_together = ['booking', 'seat_number']

    def __str__(self):
        return f"{self.full_name} - Seat {self.seat_number}"
