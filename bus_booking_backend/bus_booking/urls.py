from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Bus Booking API",
        default_version='v1',
        description="API for bus booking system - matches React frontend interfaces",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'ok', 'message': 'Go-Bus-NG Backend is running'})

urlpatterns = [
    path('', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/profiles/', include('apps.profiles.urls')),
    path('api/v1/cities/', include('apps.cities.urls')),
    path('api/v1/companies/', include('apps.companies.urls')),
    path('api/v1/buses/', include('apps.buses.urls')),
    path('api/v1/routes/', include('apps.routes.urls')),
    path('api/v1/trips/', include('apps.trips.urls')),
    path('api/v1/bookings/', include('apps.bookings.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/functions/', include('apps.functions.urls')),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
