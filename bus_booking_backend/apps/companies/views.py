from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Company
from .serializers import CompanySerializer, CompanyCreateSerializer
from apps.accounts.models import AppRole, UserRole
from utils.pagination import StandardResultsPagination

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    pagination_class = StandardResultsPagination

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return CompanyCreateSerializer
        return CompanySerializer

    def get_queryset(self):
        owner_id = self.request.query_params.get('owner_id')
        if owner_id:
            return Company.objects.filter(owner_id=owner_id)
        if self.request.user.roles.filter(role=AppRole.ADMIN).exists():
            return Company.objects.all()
        return Company.objects.filter(is_verified=True)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            company = serializer.save()
            # Assign company_admin role
            UserRole.objects.get_or_create(user=request.user, role=AppRole.COMPANY_ADMIN)
            return Response(CompanySerializer(company).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if instance.owner != request.user and not request.user.roles.filter(role=AppRole.ADMIN).exists():
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

