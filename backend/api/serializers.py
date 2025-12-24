from rest_framework import serializers
from django.contrib.auth.models import User
from .models import City, Company, Bus, Route, Trip, Booking, BookingPassenger

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user  

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'
        extra_kwargs = {'owner': {'read_only': True}}

    def create(self, validated_data):
        # Assign current user as owner
        user = self.context['request'].user
        if user.is_authenticated:
            validated_data['owner'] = user
        return super().create(validated_data)

class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = '__all__'

class RouteSerializer(serializers.ModelSerializer):
    origin = CitySerializer(read_only=True)
    destination = CitySerializer(read_only=True)
    origin_id = serializers.PrimaryKeyRelatedField(queryset=City.objects.all(), source='origin', write_only=True)
    destination_id = serializers.PrimaryKeyRelatedField(queryset=City.objects.all(), source='destination', write_only=True)

    class Meta:
        model = Route
        fields = '__all__'

class TripSerializer(serializers.ModelSerializer):
    route = RouteSerializer(read_only=True)
    bus = BusSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    route_id = serializers.PrimaryKeyRelatedField(queryset=Route.objects.all(), source='route', write_only=True)
    bus_id = serializers.PrimaryKeyRelatedField(queryset=Bus.objects.all(), source='bus', write_only=True)
    company_id = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all(), source='company', write_only=True)

    class Meta:
        model = Trip
        fields = '__all__'

class BookingPassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingPassenger
        fields = '__all__'
        extra_kwargs = {'booking': {'read_only': True}}

class BookingSerializer(serializers.ModelSerializer):
    passengers = BookingPassengerSerializer(many=True)

    class Meta:
        model = Booking
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

    def create(self, validated_data):
        passengers_data = validated_data.pop('passengers')
        user = self.context['request'].user
        if user.is_authenticated:
            validated_data['user'] = user
        
        booking = Booking.objects.create(**validated_data)
        
        for passenger_data in passengers_data:
            BookingPassenger.objects.create(booking=booking, **passenger_data)
            
        return booking
