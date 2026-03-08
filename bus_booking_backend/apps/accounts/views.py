from django.contrib.auth.tokens import default_token_generator
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings as django_settings
from datetime import timedelta
import random

from .models import User, UserRole, AppRole
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UserRoleSerializer
from utils.permissions import IsAdmin
from utils.emails import send_otp_email, send_password_reset_email, send_ticket_email

def generate_and_send_otp(user):
    otp = str(random.randint(100000, 999999))
    user.otp_code = otp
    user.otp_expires_at = timezone.now() + timedelta(minutes=10)
    user.save()

    # Always log to console for debugging
    print(f"\n{'='*50}", flush=True)
    print(f"OTP for {user.email}: {user.otp_code}", flush=True)
    print(f"{'='*50}\n", flush=True)

    # Send actual email using utility
    send_otp_email(user)


class RegisterView(APIView):
    """
    POST /api/v1/auth/register/
    Register a new user - matches frontend signUp interface
    """
    permission_classes = [AllowAny]

    def post(self, request):
        print(f"\n[REGISTER] Incoming data: {request.data}", flush=True)
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_email_verified = False
            user.save()
            
            generate_and_send_otp(user)
            
            return Response({
                'message': 'Registration successful. Please verify OTP.',
                'otp_required': True,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        print(f"[REGISTER] Validation errors: {serializer.errors}", flush=True)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """
    POST /api/v1/auth/login/
    Login user and return JWT tokens - matches frontend signIn interface
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Check if verified
            if not user.is_email_verified:
                generate_and_send_otp(user)
                return Response({
                    'message': 'Verification required.',
                    'otp_required': True,
                    'email': user.email,
                    'full_name': user.full_name
                })
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOtpView(APIView):
    """
    POST /api/v1/auth/verify-otp/
    Verify OTP and return tokens
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        
        if not email or not otp_code:
            return Response({'error': 'Email and OTP required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
            
            if user.otp_code != otp_code:
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
                
            if user.otp_expires_at and user.otp_expires_at < timezone.now():
                return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)
                
            # OTP Verified
            user.is_email_verified = True
            user.otp_code = None
            user.otp_expires_at = None
            user.save()
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Verification successful',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class ResendOtpView(APIView):
    """
    POST /api/v1/auth/resend-otp/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
            generate_and_send_otp(user)
            return Response({'message': 'OTP resent'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/
    Logout user by blacklisting refresh token
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except Exception:
            return Response({'message': 'Logged out'})

class MeView(APIView):
    """
    GET /api/v1/auth/me/
    Get current authenticated user - matches frontend getSession interface
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

class PasswordResetView(APIView):
    """
    POST /api/v1/auth/password-reset/
    Request password reset email - matches frontend resetPasswordForEmail
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            # Generate a secure token
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            # Build the reset URL pointing to the frontend
            frontend_url = django_settings.PAYSTACK_CALLBACK_URL.split('/api')[0] if django_settings.PAYSTACK_CALLBACK_URL else 'http://localhost:8080'
            reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"

            send_password_reset_email(user, reset_url)
        except User.DoesNotExist:
            pass  # Don't reveal if email exists

        # Always return success (security best practice)
        return Response({'message': 'Password reset email sent'})

class PasswordChangeView(APIView):
    """
    POST /api/v1/auth/password-change/
    Change user password - matches frontend updatePassword
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_password = request.data.get('new_password')
        old_password = request.data.get('old_password')
        
        if not new_password:
            return Response({'error': 'new_password required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if old_password and not request.user.check_password(old_password):
            return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
        
        request.user.set_password(new_password)
        request.user.save()
        return Response({'message': 'Password changed successfully'})

class ResendVerificationView(APIView):
    """
    POST /api/v1/auth/resend-verification/
    Resend verification email - matches frontend resendVerificationEmail
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Reuse OTP logic
        try:
            user = User.objects.get(email=email)
            generate_and_send_otp(user)
            return Response({'message': 'Verification email sent'})
        except User.DoesNotExist:
             return Response({'message': 'Verification email sent'})

class ListUserRolesView(APIView):
    """
    GET /api/v1/auth/user-roles/?user_id=xxx
    List roles for a user - matches frontend getByUserId
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        roles = UserRole.objects.filter(user_id=user_id)
        return Response(UserRoleSerializer(roles, many=True).data)

class CheckUserRoleView(APIView):
    """
    GET /api/v1/auth/user-roles/check/?user_id=xxx&role=xxx
    Check if user has specific role - matches frontend hasRole
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('user_id')
        role = request.query_params.get('role')
        
        if not user_id or not role:
            return Response({'error': 'user_id and role required'}, status=status.HTTP_400_BAD_REQUEST)
        
        has_role = UserRole.objects.filter(user_id=user_id, role=role).exists()
        return Response({'has_role': has_role})

class AddUserRoleView(APIView):
    """
    POST /api/v1/auth/user-roles/add/
    Add role to user - matches frontend addRole
    Authenticated users can assign company_admin/passenger to themselves.
    Only admins can assign admin role or roles to other users.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get('user_id')
        role = request.data.get('role')
        
        if not user_id or not role:
            return Response({'error': 'user_id and role required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if role not in [r[0] for r in AppRole.choices]:
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Only admins can assign admin role or assign to other users
        is_admin = request.user.roles.filter(role=AppRole.ADMIN).exists()
        is_self = str(request.user.id) == str(user_id)
        
        if role == AppRole.ADMIN and not is_admin:
            return Response({'error': 'Only admins can assign admin role'}, status=status.HTTP_403_FORBIDDEN)
        
        if not is_self and not is_admin:
            return Response({'error': 'You can only assign roles to yourself'}, status=status.HTTP_403_FORBIDDEN)
        
        user_role, created = UserRole.objects.get_or_create(user_id=user_id, role=role)
        return Response(UserRoleSerializer(user_role).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class RemoveUserRoleView(APIView):
    """
    POST /api/v1/auth/user-roles/remove/
    Remove role from user - matches frontend removeRole
    """
    permission_classes = [IsAdmin]

    def post(self, request):
        user_id = request.data.get('user_id')
        role = request.data.get('role')
        
        if not user_id or not role:
            return Response({'error': 'user_id and role required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_role = UserRole.objects.get(user_id=user_id, role=role)
            user_role.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UserRole.DoesNotExist:
            return Response({'error': 'Role not found'}, status=status.HTTP_404_NOT_FOUND)

class ListUsersView(APIView):
    """
    GET /api/v1/auth/users/
    List all users (Admin only) - matches frontend profiles.getAll
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        users = User.objects.all()
        return Response(UserSerializer(users, many=True).data)

# InvokeFunctionView for apps.functions
class InvokeFunctionView(APIView):
    """
    POST /api/v1/functions/<function_name>/
    Invoke backend function - matches frontend functions.invoke
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, function_name):
        # Map function names to handlers
        handlers = {
            'send-booking-email': self.handle_send_booking_email,
            # Add more function handlers as needed
        }
        
        handler = handlers.get(function_name)
        if not handler:
            return Response({'error': f'Function {function_name} not found'}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            result = handler(request.data)
            return Response(result)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def handle_send_booking_email(self, data):
        """Handle send-booking-email function"""
        from apps.bookings.models import Booking
        from utils.emails import send_ticket_email
        booking_id = data.get('booking_id')
        if not booking_id:
            return {"error": "booking_id required"}
        
        try:
            booking = Booking.objects.get(id=booking_id)
            sent = send_ticket_email(booking)
            if sent:
                return {"message": "Email sent successfully"}
            else:
                return {"error": "Failed to send email"}
        except Booking.DoesNotExist:
            return {"error": "Booking not found"}

