from rest_framework import serializers
from .models import Trip
from apps.routes.serializers import RouteSerializer
from apps.buses.serializers import BusSerializer
from apps.companies.serializers import CompanySerializer

class TripSerializer(serializers.ModelSerializer):
    route = RouteSerializer(read_only=True)
    bus = BusSerializer(read_only=True)
    company = serializers.SerializerMethodField()
    route_id = serializers.UUIDField(source='route.id', read_only=True)
    bus_id = serializers.UUIDField(source='bus.id', read_only=True)
    booked_seats = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            'id', 'route', 'bus', 'company', 'route_id', 'bus_id',
            'departure_time', 'arrival_time', 'price',
            'available_seats', 'booked_seats', 'status', 'created_at', 'updated_at'
        ]

    def get_company(self, obj):
        if obj.route and obj.route.company:
            return CompanySerializer(obj.route.company).data
        return None

    def get_booked_seats(self, obj):
        from apps.bookings.models import Booking, BookingStatus
        from django.utils import timezone
        
        # Get all active bookings for this trip
        active_bookings = Booking.objects.filter(
            trip=obj,
            status__in=[BookingStatus.CONFIRMED, BookingStatus.PENDING]
        )
        
        booked_seats = []
        for booking in active_bookings:
            # If pending, check if hold has expired
            if booking.status == BookingStatus.PENDING and booking.hold_expires_at:
                if booking.hold_expires_at < timezone.now():
                    continue
            
            if isinstance(booking.seats, list):
                booked_seats.extend(booking.seats)
        
        return list(set(booked_seats))


class TripCreateSerializer(serializers.ModelSerializer):
    route_id = serializers.UUIDField(write_only=True)
    bus_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Trip
        fields = ['route_id', 'bus_id', 'departure_time', 'arrival_time', 'price', 'available_seats']
    
    def create(self, validated_data):
        route_id = validated_data.pop('route_id')
        bus_id = validated_data.pop('bus_id')
        validated_data['route_id'] = route_id
        validated_data['bus_id'] = bus_id
        return super().create(validated_data)

class TripSearchSerializer(serializers.ModelSerializer):
    origin_city = serializers.CharField(source='route.origin_city.name')
    destination_city = serializers.CharField(source='route.destination_city.name')
    company_name = serializers.CharField(source='route.company.name')
    company_logo = serializers.URLField(source='route.company.logo_url')
    bus_type = serializers.CharField(source='bus.bus_type')
    amenities = serializers.JSONField(source='bus.amenities')

    class Meta:
        model = Trip
        fields = [
            'id', 'origin_city', 'destination_city', 'company_name', 'company_logo',
            'departure_time', 'arrival_time', 'price', 'available_seats',
            'bus_type', 'amenities', 'status'
        ]
