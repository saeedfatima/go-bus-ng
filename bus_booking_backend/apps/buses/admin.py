from django.contrib import admin
from .models import Bus

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ('plate_number', 'company', 'bus_type', 'total_seats', 'is_active')
    list_filter = ('bus_type', 'is_active', 'company')
    search_fields = ('plate_number', 'company__name')
    ordering = ('-created_at',)
