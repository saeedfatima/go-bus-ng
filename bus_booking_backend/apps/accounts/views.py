from django.contrib.auth.tokens import default_token_generator
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings as django_settings

from .models import User, UserRole, AppRole
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UserRoleSerializer
from .otp_service import send_user_otp, verify_user_otp
from utils.permissions import IsAdmin
from utils.emails import send_password_reset_email


class RegisterView(APIView):
    """
    POST /api/v1/auth/register/
    Register a new user - matches frontend signUp interface
    """
    permission_classes = [AllowAny]

    def post(self, request):
        print(f"[SYSTEM] Registration triggered for: {request.data.get('email')}", flush=True)
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_email_verified = False
            user.save(update_fields=['is_email_verified', 'updated_at'])

            otp_result = send_user_otp(
                user,
                respect_cooldown=False,
                reuse_existing_code=False,
            )

            response_data = {
                'message': 'Registration successful. Please verify OTP.',
                'otp_required': True,
                'email': user.email,
                'email_sent': otp_result.ok,
            }
            if not otp_result.ok:
                response_data['delivery_error'] = otp_result.detail

            return Response(response_data, status=status.HTTP_201_CREATED)
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
                otp_result = send_user_otp(
                    user,
                    respect_cooldown=False,
                    reuse_existing_code=True,
                )
                response_data = {
                    'message': 'Verification required.',
                    'otp_required': True,
                    'email': user.email,
                    'full_name': user.full_name,
                    'email_sent': otp_result.ok,
                }
                if not otp_result.ok:
                    response_data['delivery_error'] = otp_result.detail
                return Response(response_data)
            
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

            verification_result = verify_user_otp(user, otp_code)
            if not verification_result.ok:
                status_code = status.HTTP_429_TOO_MANY_REQUESTS if 'Too many' in verification_result.detail else status.HTTP_400_BAD_REQUEST
                return Response({'error': verification_result.detail}, status=status_code)
            
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
            otp_result = send_user_otp(
                user,
                respect_cooldown=True,
                reuse_existing_code=True,
            )
            if otp_result.ok:
                return Response({'message': 'OTP resent'})

            payload = {'error': otp_result.detail}
            if otp_result.retry_after:
                payload['retry_after'] = otp_result.retry_after
                return Response(payload, status=status.HTTP_429_TOO_MANY_REQUESTS)
            response_status = (
                status.HTTP_400_BAD_REQUEST
                if user.is_email_verified
                else status.HTTP_503_SERVICE_UNAVAILABLE
            )
            return Response(payload, status=response_status)
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
            print(f"[SYSTEM] Password reset triggered for: {email}", flush=True)
            # Generate a secure token
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            # Build the reset URL pointing to the frontend
            reset_url = f"{django_settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

            if not send_password_reset_email(user, reset_url):
                return Response(
                    {'error': 'Failed to send password reset email. Check SMTP settings.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
        except User.DoesNotExist:
            print(f"[SYSTEM] Password reset attempted for non-existent email: {email}", flush=True)
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
            otp_result = send_user_otp(
                user,
                respect_cooldown=True,
                reuse_existing_code=True,
            )
            if otp_result.ok:
                return Response({'message': 'Verification email sent'})

            payload = {'error': otp_result.detail}
            if otp_result.retry_after:
                payload['retry_after'] = otp_result.retry_after
                return Response(payload, status=status.HTTP_429_TOO_MANY_REQUESTS)
            response_status = (
                status.HTTP_400_BAD_REQUEST
                if user.is_email_verified
                else status.HTTP_503_SERVICE_UNAVAILABLE
            )
            return Response(payload, status=response_status)
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
