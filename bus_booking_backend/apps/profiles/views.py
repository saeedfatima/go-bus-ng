from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import Http404

from .models import Profile
from .serializers import ProfileSerializer
from utils.permissions import IsAdmin
from utils.pagination import StandardResultsPagination

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination

    def get_permissions(self):
        if self.action == 'list':
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')

        if self.request.user.is_staff:
            queryset = Profile.objects.all()
            if user_id:
                queryset = queryset.filter(user_id=user_id)
            return queryset

        queryset = Profile.objects.filter(user=self.request.user)
        if user_id and user_id != str(self.request.user.id):
            return queryset.none()
        return queryset

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)

        if lookup_value is None:
            raise Http404

        # First try profile primary key lookup (default DRF behavior).
        try:
            obj = queryset.get(**{self.lookup_field: lookup_value})
        except Profile.DoesNotExist:
            # Fallback: allow lookup by user UUID, which matches frontend usage.
            obj = queryset.filter(user_id=lookup_value).first()

            # Legacy safety: create missing profile for the authenticated user.
            if not obj and str(self.request.user.id) == str(lookup_value):
                obj, _ = Profile.objects.get_or_create(
                    user=self.request.user,
                    defaults={
                        'full_name': self.request.user.full_name or '',
                        'phone': self.request.user.phone or '',
                    }
                )

            if not obj:
                raise Http404

        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        profile, _ = Profile.objects.get_or_create(
            user=request.user,
            defaults={
                'full_name': request.user.full_name or '',
                'phone': request.user.phone or '',
            }
        )

        if request.method.lower() == 'get':
            return Response(ProfileSerializer(profile).data)

        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if instance.user != request.user and not request.user.is_staff:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

