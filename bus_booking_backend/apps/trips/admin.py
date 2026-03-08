from django.contrib import admin
from .models import Trip

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('id', 'route', 'departure_time', 'status')
    list_filter = ('status', 'departure_time')
    search_fields = ('id', 'bus__plate_number')
    ordering = ('-departure_time',)