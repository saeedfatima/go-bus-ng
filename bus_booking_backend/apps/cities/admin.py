from django.contrib import admin
from .models import City

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'state', 'created_at')
    list_filter = ('state',)
    search_fields = ('name', 'state')
    ordering = ('name',)
