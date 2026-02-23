from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import City
from .serializers import CitySerializer

class ListCitiesView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        cities = City.objects.all()
        serializer = CitySerializer(cities, many=True)
        return Response(serializer.data)

class GetCityView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, city_id):
        try:
            city = City.objects.get(id=city_id)
            return Response(CitySerializer(city).data)
        except City.DoesNotExist:
            return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)
