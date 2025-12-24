from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.register, name='register'),
    path('cities/', views.city_list, name='city-list'),
    path('cities/<int:pk>/', views.city_detail, name='city-detail'),
    path('companies/', views.company_list, name='company-list'),
    path('companies/<int:pk>/', views.company_detail, name='company-detail'),
    path('buses/', views.bus_list, name='bus-list'),
    path('buses/<int:pk>/', views.bus_detail, name='bus-detail'),
    path('routes/', views.route_list, name='route-list'),
    path('routes/<int:pk>/', views.route_detail, name='route-detail'),
    path('trips/', views.trip_list, name='trip-list'),
    path('trips/<int:pk>/', views.trip_detail, name='trip-detail'),
    path('bookings/', views.booking_list, name='booking-list'),
    path('bookings/<int:pk>/', views.booking_detail, name='booking-detail'),
]
