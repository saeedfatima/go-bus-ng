from django.contrib import admin
from .models import User, UserRole

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'phone', 'is_active', 'is_staff', 'is_email_verified')
    list_filter = ('is_active', 'is_staff', 'is_email_verified')
    search_fields = ('email', 'full_name', 'phone')
    ordering = ('-created_at',)

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)
    search_fields = ('user__email',)
