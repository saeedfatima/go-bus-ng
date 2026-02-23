from rest_framework import serializers
from .models import Bus

class BusSerializer(serializers.ModelSerializer):
    company_id = serializers.UUIDField(source='company.id', read_only=True)
    class Meta:
        model = Bus
        fields = ['id', 'company_id', 'plate_number', 'bus_type', 'total_seats', 'amenities', 'is_active', 'created_at', 'updated_at']

class BusCreateSerializer(serializers.ModelSerializer):
    company_id = serializers.UUIDField(write_only=True)
    class Meta:
        model = Bus
        fields = ['company_id', 'plate_number', 'bus_type', 'total_seats', 'amenities']
    
    def create(self, validated_data):
        company_id = validated_data.pop('company_id')
        validated_data['company_id'] = company_id
        return super().create(validated_data)
