from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Booking, BookingPassenger
from apps.trips.serializers import TripSerializer

class BookingPassengerSerializer(serializers.ModelSerializer):
    booking_id = serializers.UUIDField(source='booking.id', read_only=True)
    class Meta:
        model = BookingPassenger
        fields = ['id', 'booking_id', 'full_name', 'phone', 'email', 'nin', 'seat_number', 'created_at']

class BookingPassengerCreateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    nin = serializers.CharField(max_length=20, required=False, allow_null=True, allow_blank=True)
    seat_number = serializers.CharField(max_length=5)

class BookingSerializer(serializers.ModelSerializer):
    trip = TripSerializer(read_only=True)
    passengers = BookingPassengerSerializer(many=True, read_only=True)
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    trip_id = serializers.UUIDField(source='trip.id', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'trip', 'trip_id', 'user_id', 'seats', 'total_amount', 'status',
            'ticket_code', 'passenger_name', 'passenger_phone', 'passenger_email',
            'hold_expires_at', 'payment_completed_at', 'cancelled_at',
            'cancellation_reason', 'passengers', 'created_at', 'updated_at'
        ]

class BookingCreateSerializer(serializers.Serializer):
    trip_id = serializers.UUIDField()
    seats = serializers.ListField(child=serializers.CharField())
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    passenger_name = serializers.CharField(max_length=255)
    passenger_email = serializers.EmailField()
    passenger_phone = serializers.CharField(max_length=20)
    passengers = BookingPassengerCreateSerializer(many=True, required=False)

    def create(self, validated_data):
        from apps.trips.models import Trip
        
        passengers_data = validated_data.pop('passengers', [])
        try:
            trip = Trip.objects.get(id=validated_data['trip_id'])
        except Trip.DoesNotExist:
             raise serializers.ValidationError("Trip not found")

        # Set hold expiration (15 minutes)
        # Using timezone from django.utils
        hold_expires_at = timezone.now() + timedelta(minutes=15)
        
        booking = Booking.objects.create(
            trip=trip,
            user=self.context['request'].user,
            seats=validated_data['seats'],
            total_amount=validated_data['total_amount'],
            passenger_name=validated_data['passenger_name'],
            passenger_email=validated_data['passenger_email'],
            passenger_phone=validated_data['passenger_phone'],
            hold_expires_at=hold_expires_at
        )
        
        for passenger_data in passengers_data:
            BookingPassenger.objects.create(booking=booking, **passenger_data)
        
        trip.available_seats -= len(validated_data['seats'])
        trip.save()
        
        return booking
