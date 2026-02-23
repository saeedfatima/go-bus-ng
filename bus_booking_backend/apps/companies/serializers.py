from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    owner_id = serializers.UUIDField(source='owner.id', read_only=True)
    class Meta:
        model = Company
        fields = ['id', 'name', 'logo_url', 'description', 'rating', 'total_trips', 'is_verified', 'owner_id', 'created_at', 'updated_at']

class CompanyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['name', 'logo_url', 'description']
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
