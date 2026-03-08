from django.contrib import admin
from .models import Booking, BookingPassenger

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('ticket_code', 'passenger_name', 'trip', 'status', 'total_amount', 'created_at')
    list_filter = ('status',)
    search_fields = ('ticket_code', 'passenger_name', 'passenger_email', 'passenger_phone')
    ordering = ('-created_at',)

@admin.register(BookingPassenger)
class BookingPassengerAdmin(admin.ModelAdmin):
    list_display = ('booking', 'full_name', 'seat_number', 'phone')
    search_fields = ('full_name', 'booking__ticket_code')
    ordering = ('-created_at',)
