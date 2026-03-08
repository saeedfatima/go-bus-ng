from django.contrib import admin
from .models import Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'rating', 'total_trips', 'is_verified')
    list_filter = ('is_verified', 'rating')
    search_fields = ('name', 'owner__email')
    ordering = ('-created_at',)