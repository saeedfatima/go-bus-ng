from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from .models import Trip, TripStatus
from .serializers import TripSerializer, TripCreateSerializer, TripSearchSerializer

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all().select_related(
        'route__origin_city',
        'route__destination_city',
        'route__company',
        'bus'
    )
    pagination_class = None
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return TripCreateSerializer
        return TripSerializer

    def get_queryset(self):
        queryset = Trip.objects.all().select_related(
            'route__origin_city', 'route__destination_city', 'bus', 'route__company'
        )
        company_id = self.request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(route__company_id=company_id)
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search(self, request):
        trips = Trip.objects.select_related(
            'route__origin_city',
            'route__destination_city',
            'route__company',
            'bus'
        ).filter(
            status=TripStatus.SCHEDULED,
            departure_time__gt=timezone.now()
        )
        
        # Filters
        origin_city_id = request.query_params.get('origin_city_id')
        destination_city_id = request.query_params.get('destination_city_id')
        departure_date = request.query_params.get('departure_date')
        min_seats = request.query_params.get('min_seats', 1)
        
        if origin_city_id:
            trips = trips.filter(route__origin_city_id=origin_city_id)
        if destination_city_id:
            trips = trips.filter(route__destination_city_id=destination_city_id)
        if departure_date:
            trips = trips.filter(departure_time__date=departure_date)
        if min_seats:
            trips = trips.filter(available_seats__gte=int(min_seats))
        
        trips = trips.order_by('departure_time')
        serializer = TripSerializer(trips, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Check company ownership
            from apps.companies.models import Company
            from apps.routes.models import Route
            try:
                route = Route.objects.get(id=serializer.validated_data['route_id'])
                if route.company.owner != request.user:
                    return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            except Route.DoesNotExist:
                return Response({'error': 'Route not found'}, status=status.HTTP_404_NOT_FOUND)

            trip = serializer.save()
            return Response(TripSerializer(trip).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if instance.route.company.owner != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.route.company.owner != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

