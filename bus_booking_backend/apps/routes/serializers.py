from rest_framework import serializers
from .models import Route
from apps.cities.serializers import CitySerializer

class RouteSerializer(serializers.ModelSerializer):
    origin_city = CitySerializer(read_only=True)
    destination_city = CitySerializer(read_only=True)
    origin_city_id = serializers.UUIDField(source='origin_city.id', read_only=True)
    destination_city_id = serializers.UUIDField(source='destination_city.id', read_only=True)
    company_id = serializers.UUIDField(source='company.id', read_only=True)

    class Meta:
        model = Route
        fields = [
            'id', 'company_id', 'origin_city', 'destination_city',
            'origin_city_id', 'destination_city_id',
            'base_price', 'duration_hours', 'is_active', 'created_at', 'updated_at'
        ]

class RouteCreateSerializer(serializers.ModelSerializer):
    company_id = serializers.UUIDField(write_only=True)
    origin_city_id = serializers.UUIDField(write_only=True)
    destination_city_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Route
        fields = ['company_id', 'origin_city_id', 'destination_city_id', 'base_price', 'duration_hours']
