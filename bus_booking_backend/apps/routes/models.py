import uuid
from django.db import models
from apps.companies.models import Company
from apps.cities.models import City

class Route(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='routes')
    origin_city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='origin_routes')
    destination_city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='destination_routes')
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_hours = models.DecimalField(max_digits=5, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'routes'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.origin_city.name} -> {self.destination_city.name}"
