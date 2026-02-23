from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth endpoints - match IAuthService interface
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', views.MeView.as_view(), name='me'),
    path('verify-otp/', views.VerifyOtpView.as_view(), name='verify-otp'),
    path('resend-otp/', views.ResendOtpView.as_view(), name='resend-otp'),
    path('password-reset/', views.PasswordResetView.as_view(), name='password-reset'),
    path('password-change/', views.PasswordChangeView.as_view(), name='password-change'),
    path('resend-verification/', views.ResendVerificationView.as_view(), name='resend-verification'),
    
    # User roles - match IUserRolesService interface
    path('user-roles/', views.ListUserRolesView.as_view(), name='list-user-roles'),
    path('user-roles/check/', views.CheckUserRoleView.as_view(), name='check-user-role'),
    path('user-roles/add/', views.AddUserRoleView.as_view(), name='add-user-role'),
    path('user-roles/remove/', views.RemoveUserRoleView.as_view(), name='remove-user-role'),
    
    # Admin endpoints
    path('users/', views.ListUsersView.as_view(), name='list-users'),
]
