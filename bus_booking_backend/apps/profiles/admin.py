from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'phone')
    list_filter = ('user__is_active', 'user__is_staff')
    search_fields = ('user__email', 'full_name', 'phone')
    ordering = ('user__email',)