from rest_framework import serializers
from .models import Profile
from apps.accounts.serializers import UserRoleSerializer
from apps.accounts.models import UserRole

class ProfileSerializer(serializers.ModelSerializer):
    """Matches frontend ApiProfile interface plus email and roles"""
    email = serializers.EmailField(source='user.email', read_only=True)
    roles = serializers.SerializerMethodField()
    bookings_count = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'full_name', 'phone', 'email', 'roles', 'bookings_count', 'company_name', 'created_at', 'updated_at']

    def get_roles(self, obj):
        roles = UserRole.objects.filter(user=obj.user)
        return [r.role for r in roles]

    def get_bookings_count(self, obj):
        from apps.bookings.models import Booking
        return Booking.objects.filter(user=obj.user).count()

    def get_company_name(self, obj):
        from apps.companies.models import Company
        company = Company.objects.filter(owner=obj.user).first()
        return company.name if company else None
