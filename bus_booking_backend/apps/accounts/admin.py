from django.contrib import admin
from .models import UserRole, User


admin.site.register(User)
admin.site.register(UserRole)
