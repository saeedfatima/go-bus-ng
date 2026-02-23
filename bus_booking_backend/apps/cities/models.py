import uuid
from django.db import models

class City(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cities'
        ordering = ['name']
        verbose_name_plural = 'Cities'

    def __str__(self):
        return f"{self.name}, {self.state}"
