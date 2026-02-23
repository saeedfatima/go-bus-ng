from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserRole, AppRole
# Assuming apps.profiles.models exists and has Profile
from apps.profiles.models import Profile


class RegisterSerializer(serializers.ModelSerializer):
    """
    Registration serializer matching frontend signUp interface.
    Creates user, profile, and assigns passenger role.
    """
    password = serializers.CharField(write_only=True, min_length=6)
    phone = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'phone']

    def create(self, validated_data):
        try:
            user = User.objects.create_user(**validated_data)
            # Assign default passenger role
            UserRole.objects.create(user=user, role=AppRole.PASSENGER)
            # Create profile
            Profile.objects.create(
                user=user,
                full_name=user.full_name or '',
                phone=user.phone or ''
            )
            return user
        except Exception as e:
            raise serializers.ValidationError(str(e))


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        # We need request context for authenticate properly usually, checking full implementation
        # Standard authenticate uses username kwarg for the USERNAME_FIELD
        user = authenticate(username=data.get('email'), password=data.get('password'))
        
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled')
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    """Matches frontend ApiUser interface"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'created_at']


class UserRoleSerializer(serializers.ModelSerializer):
    """Matches frontend ApiUserRole interface"""
    user_id = serializers.UUIDField(source='user.id', read_only=True)

    class Meta:
        model = UserRole
        fields = ['id', 'user_id', 'role']
