from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from .models import Booking, BookingPassenger, BookingStatus
from .serializers import BookingSerializer, BookingCreateSerializer, BookingPassengerSerializer
from apps.accounts.models import AppRole
from utils.permissions import IsAdmin
from utils.pagination import StandardResultsPagination

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        company_id = self.request.query_params.get('company_id')
        
        queryset = Booking.objects.all().select_related(
            'trip__route__origin_city',
            'trip__route__destination_city',
            'trip__route__company',
            'trip__bus'
        ).prefetch_related('passengers').order_by('-created_at')

        if user_id:
            queryset = queryset.filter(user_id=user_id)
        elif company_id:
            queryset = queryset.filter(trip__route__company_id=company_id)
        
        # If not admin, restrict to user's bookings or company's bookings
        if not self.request.user.roles.filter(role=AppRole.ADMIN).exists():
            # For list, standard users only see their own
            # Unless they are company owners (handled above by company_id check if provided)
            # Actually, let's keep it simple: if not admin and no company_id filter, just own bookings
            if not company_id:
                queryset = queryset.filter(user=self.request.user)

        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user and not request.user.roles.filter(role=AppRole.ADMIN).exists():
            if instance.trip.route.company.owner != request.user:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            booking = serializer.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Permission check
        if instance.user != request.user and not request.user.roles.filter(role=AppRole.ADMIN).exists():
             if instance.trip.route.company.owner != request.user:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        if request.data.get('status') == 'cancelled':
            instance.status = BookingStatus.CANCELLED
            instance.cancelled_at = timezone.now()
            instance.cancellation_reason = request.data.get('cancellation_reason', '')
            instance.save()
            
            instance.trip.available_seats += len(instance.seats)
            instance.trip.save()
            return Response(BookingSerializer(instance).data)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def passengers(self, request, pk=None):
        booking = self.get_object()
        passengers = BookingPassenger.objects.filter(booking=booking)
        serializer = BookingPassengerSerializer(passengers, many=True)
        return Response(serializer.data)

