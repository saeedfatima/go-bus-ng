import uuid
from django.db import models
from apps.routes.models import Route
from apps.buses.models import Bus

class TripStatus(models.TextChoices):
    SCHEDULED = 'scheduled', 'Scheduled'
    BOARDING = 'boarding', 'Boarding'
    DEPARTED = 'departed', 'Departed'
    ARRIVED = 'arrived', 'Arrived'
    CANCELLED = 'cancelled', 'Cancelled'

class Trip(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='trips')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='trips')
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    available_seats = models.IntegerField()
    status = models.CharField(max_length=20, choices=TripStatus.choices, default=TripStatus.SCHEDULED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trips'
        ordering = ['departure_time']

    def __str__(self):
        return f"{self.route} - {self.departure_time}"

    @property
    def company(self):
        return self.route.company
