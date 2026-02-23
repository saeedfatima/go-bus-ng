import uuid
from django.db import models
from apps.bookings.models import Booking

class PaymentStatus(models.TextChoices):
    """Normalized local statuses for a payment lifecycle."""

    PENDING = 'pending', 'Pending'
    SUCCESS = 'success', 'Success'
    FAILED = 'failed', 'Failed'

class Payment(models.Model):
    """
    Local audit record for each checkout attempt sent to Paystack.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Booking this payment belongs to.
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    # Amount in naira.
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    # Unique transaction reference shared with Paystack.
    reference = models.CharField(max_length=100, unique=True)
    # Local status mirror (pending/success/failed).
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Raw gateway payload for debugging and reconciliation.
    gateway_response = models.JSONField(blank=True, null=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reference} - {self.amount}"
