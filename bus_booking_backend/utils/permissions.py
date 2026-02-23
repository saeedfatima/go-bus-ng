from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        # We perform a lazy import to avoid circular dependency issues if models import this file
        # though usually models don't import permissions.
        # But User model is in accounts.
        return request.user and request.user.is_authenticated and request.user.roles.filter(role='admin').exists()
