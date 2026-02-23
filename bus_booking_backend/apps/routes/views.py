from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Route
from .serializers import RouteSerializer, RouteCreateSerializer
from apps.cities.models import City

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all().select_related('origin_city', 'destination_city')
    pagination_class = None
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return RouteCreateSerializer
        return RouteSerializer

    def get_queryset(self):
        queryset = Route.objects.all().select_related('origin_city', 'destination_city')
        company_id = self.request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Validate cities exist
            try:
                origin = City.objects.get(id=serializer.validated_data['origin_city_id'])
                destination = City.objects.get(id=serializer.validated_data['destination_city_id'])
            except City.DoesNotExist:
                return Response({'error': 'Invalid city ID'}, status=status.HTTP_400_BAD_REQUEST)
            
            if origin == destination:
                return Response({'error': 'Origin and destination must be different'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check company ownership
            from apps.companies.models import Company
            try:
                company = Company.objects.get(id=serializer.validated_data['company_id'])
                if company.owner != request.user:
                    return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            except Company.DoesNotExist:
                return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)

            route = Route.objects.create(
                company_id=serializer.validated_data['company_id'],
                origin_city=origin,
                destination_city=destination,
                base_price=serializer.validated_data['base_price'],
                duration_hours=serializer.validated_data['duration_hours']
            )
            return Response(RouteSerializer(route).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if instance.company.owner != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.company.owner != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

