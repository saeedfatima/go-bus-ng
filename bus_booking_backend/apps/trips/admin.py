from django.contrib import admin
from .models import Trip

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('route', 'bus', 'departure_time', 'arrival_time', 'price', 'available_seats', 'status')
    list_filter = ('status', 'departure_time')
    search_fields = ('route__name', 'bus__plate_number')
    ordering = ('departure_time',)