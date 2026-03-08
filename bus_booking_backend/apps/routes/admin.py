from django.contrib import admin
from .models import Route

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('origin_city', 'destination_city', 'company', 'base_price', 'duration_hours', 'is_active')
    list_filter = ('is_active', 'company')
    search_fields = ('origin_city__name', 'destination_city__name', 'company__name')
    ordering = ('-created_at',)
