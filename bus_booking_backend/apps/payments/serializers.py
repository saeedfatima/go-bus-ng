from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    """Read serializer for payment records returned to clients."""

    class Meta:
        model = Payment
        fields = ['id', 'booking', 'amount', 'reference', 'status', 'created_at', 'updated_at']

class InitializePaymentSerializer(serializers.Serializer):
    """
    Input serializer for payment initialization endpoint.
    Keeps only fields the frontend must provide.
    """

    # Booking to be paid for (must exist and belong to the requester unless admin).
    booking_id = serializers.UUIDField()
    # Email used by Paystack for receipt/checkout identity.
    email = serializers.EmailField()
    # Amount in naira (converted to kobo before calling Paystack).
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
