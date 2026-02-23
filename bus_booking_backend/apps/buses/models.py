import uuid
from django.db import models
from apps.companies.models import Company

class BusType(models.TextChoices):
    STANDARD = 'standard', 'Standard'
    LUXURY = 'luxury', 'Luxury'
    EXECUTIVE = 'executive', 'Executive'

class Bus(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='buses')
    plate_number = models.CharField(max_length=20, unique=True)
    bus_type = models.CharField(max_length=20, choices=BusType.choices, default=BusType.STANDARD)
    total_seats = models.IntegerField(default=48)
    amenities = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'buses'
        ordering = ['-created_at']
        verbose_name_plural = 'Buses'

    def __str__(self):
        return f"{self.plate_number} - {self.company.name}"
