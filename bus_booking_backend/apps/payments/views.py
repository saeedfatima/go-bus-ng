import hashlib
import hmac
import uuid
from decimal import Decimal

import requests
from django.conf import settings
from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone

from .models import Payment, PaymentStatus
from .serializers import InitializePaymentSerializer
from .paystack_config import can_use_real_paystack
from apps.bookings.models import Booking, BookingStatus
from apps.accounts.models import AppRole
from utils.emails import send_ticket_email


def is_mock_fallback_enabled() -> bool:
    """
    Hybrid mode: mock fallback is allowed only in DEBUG and when explicitly enabled.
    """
    return bool(getattr(settings, 'DEBUG', False)) and bool(
        getattr(settings, 'PAYSTACK_ENABLE_MOCK_FALLBACK', False)
    )


class InitializePaymentView(APIView):
    """
    Initialize a Paystack transaction for an existing booking.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Step 1: Validate payload shape and primitive types.
        serializer = InitializePaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        booking_id = serializer.validated_data['booking_id']
        email = serializer.validated_data['email'].strip().lower()
        amount = Decimal(serializer.validated_data['amount'])

        # Step 2: Fetch booking and enforce access control.
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

        is_admin = request.user.roles.filter(role=AppRole.ADMIN).exists()
        if booking.user_id != request.user.id and not is_admin:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        # Step 3: Enforce booking state and anti-tampering checks.
        if booking.status != BookingStatus.PENDING:
            return Response(
                {'error': f'Booking is already {booking.status}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if booking.hold_expires_at and booking.hold_expires_at <= timezone.now():
            booking.status = BookingStatus.EXPIRED
            booking.save(update_fields=['status', 'updated_at'])
            return Response(
                {'error': 'Booking hold has expired. Please create a new booking.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if amount != booking.total_amount:
            return Response(
                {'error': 'Payment amount does not match booking total.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if email != booking.passenger_email.strip().lower():
            return Response(
                {'error': 'Payment email must match booking passenger email.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Step 4: Evaluate runtime gateway configuration.
        can_use_real_gateway, config_reason = can_use_real_paystack(settings)
        callback_template = (getattr(settings, 'PAYSTACK_CALLBACK_URL', '') or '').strip()

        # Hybrid fallback: only for config issues, only in local/dev mode.
        if not can_use_real_gateway:
            print(f"[PAYMENT] Fallback to Mock Mode: {config_reason}", flush=True)
            if is_mock_fallback_enabled():
                reference = str(uuid.uuid4())
                payment = Payment.objects.create(
                    booking=booking,
                    amount=amount,
                    reference=reference,
                    status=PaymentStatus.PENDING,
                    gateway_response={
                        'mode': 'mock',
                        'reason': config_reason,
                    },
                )

                redirect_template = (
                    getattr(settings, 'PAYSTACK_MOCK_REDIRECT_URL_TEMPLATE', '') or
                    'http://localhost:8080/booking/{id}/payment?reference={reference}'
                )
                authorization_url = (
                    redirect_template
                    .replace('{id}', str(booking.id))
                    .replace('{reference}', reference)
                )

                return Response({
                    'authorization_url': authorization_url,
                    'access_code': reference,
                    'reference': reference,
                    'mode': 'mock',
                })

            return Response(
                {'error': f'Server payment config error: {config_reason}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        callback_url = callback_template.replace('{id}', str(booking.id))
        secret_key = (getattr(settings, 'PAYSTACK_SECRET_KEY', '') or '').strip()

        # Step 5: Create a local payment record before calling Paystack for traceability.
        reference = str(uuid.uuid4())
        payment = Payment.objects.create(
            booking=booking,
            amount=amount,
            reference=reference,
            status=PaymentStatus.PENDING,
        )

        # Step 6: Build gateway request payload.
        headers = {
            'Authorization': f'Bearer {secret_key}',
            'Content-Type': 'application/json',
        }
        payload = {
            'email': email,
            'amount': int(amount * 100),  # Paystack expects kobo, not naira.
            'reference': reference,
            'callback_url': callback_url,
            'metadata': {
                'booking_id': str(booking.id),
                'user_id': str(request.user.id),
            },
        }

        try:
            # Step 7: Call Paystack initialize endpoint.
            gateway_response = requests.post(
                'https://api.paystack.co/transaction/initialize',
                headers=headers,
                json=payload,
                timeout=20,
            )
            data = gateway_response.json()
        except requests.RequestException as exc:
            payment.status = PaymentStatus.FAILED
            payment.gateway_response = {'error': str(exc)}
            payment.save(update_fields=['status', 'gateway_response', 'updated_at'])
            return Response(
                {'error': 'Unable to reach Paystack. Please try again shortly.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except ValueError:
            payment.status = PaymentStatus.FAILED
            payment.gateway_response = {'error': 'Invalid JSON response from Paystack'}
            payment.save(update_fields=['status', 'gateway_response', 'updated_at'])
            return Response(
                {'error': 'Payment gateway returned an invalid response.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # Step 8: Handle Paystack business errors.
        if not data.get('status'):
            payment.status = PaymentStatus.FAILED
            payment.gateway_response = data
            payment.save(update_fields=['status', 'gateway_response', 'updated_at'])
            return Response(
                {'error': data.get('message', 'Payment initialization failed.')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Step 9: Return details frontend needs to redirect the user to Paystack checkout.
        return Response({
            'authorization_url': data['data']['authorization_url'],
            'access_code': data['data']['access_code'],
            'reference': data['data']['reference'],
            'mode': 'paystack',
        })


class VerifyPaymentView(APIView):
    """
    Verify a Paystack transaction and update local payment/booking records.
    """

    # Kept public to support callback-driven verification with only the reference.
    permission_classes = [AllowAny]

    @staticmethod
    def get_payment_mode(payment: Payment) -> str:
        if isinstance(payment.gateway_response, dict) and payment.gateway_response.get('mode') == 'mock':
            return 'mock'
        return 'paystack'

    def get(self, request):
        # Step 1: Validate required query parameter.
        reference = request.query_params.get('reference')
        if not reference:
            return Response({'error': 'Reference required'}, status=status.HTTP_400_BAD_REQUEST)

        # Step 2: Fetch payment and related booking in one query.
        try:
            payment = Payment.objects.select_related('booking').get(reference=reference)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

        mode = self.get_payment_mode(payment)

        # Step 3: Optional ownership check when caller is authenticated.
        if request.user.is_authenticated:
            is_admin = request.user.roles.filter(role=AppRole.ADMIN).exists()
            if payment.booking.user_id != request.user.id and not is_admin:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        # Step 4: Return idempotent success if already verified.
        if payment.status == PaymentStatus.SUCCESS:
            return Response({
                'status': 'success',
                'reference': payment.reference,
                'amount': payment.amount,
                'paid_at': payment.booking.payment_completed_at,
                'mode': mode,
            })

        # Step 5: Handle mock-mode verification path.
        if mode == 'mock':
            if not is_mock_fallback_enabled():
                return Response(
                    {'error': 'Mock payment verification is disabled in this environment.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with transaction.atomic():
                payment = Payment.objects.select_for_update().select_related('booking').get(id=payment.id)
                if payment.status != PaymentStatus.SUCCESS:
                    payment.status = PaymentStatus.SUCCESS
                    gateway_response = payment.gateway_response if isinstance(payment.gateway_response, dict) else {}
                    gateway_response.update({'mode': 'mock', 'verified': True})
                    payment.gateway_response = gateway_response
                    payment.save(update_fields=['status', 'gateway_response', 'updated_at'])

                    booking = payment.booking
                    if booking.status != BookingStatus.CONFIRMED:
                        booking.status = BookingStatus.CONFIRMED
                        booking.payment_completed_at = timezone.now()
                        booking.save(update_fields=['status', 'payment_completed_at', 'updated_at'])
                        send_ticket_email(booking)
                else:
                    booking = payment.booking

            return Response({
                'status': 'success',
                'reference': payment.reference,
                'amount': payment.amount,
                'paid_at': booking.payment_completed_at,
                'mode': 'mock',
            })

        # Step 6: Ensure real gateway credentials are usable.
        can_use_real_gateway, config_reason = can_use_real_paystack(settings)
        if not can_use_real_gateway:
            return Response(
                {'error': f'Server payment config error: {config_reason}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        secret_key = (getattr(settings, 'PAYSTACK_SECRET_KEY', '') or '').strip()

        # Step 7: Call Paystack verify endpoint.
        headers = {'Authorization': f'Bearer {secret_key}'}
        try:
            gateway_response = requests.get(
                f'https://api.paystack.co/transaction/verify/{reference}',
                headers=headers,
                timeout=20,
            )
            data = gateway_response.json()
        except requests.RequestException as exc:
            return Response(
                {'error': f'Unable to reach Paystack: {exc}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except ValueError:
            return Response(
                {'error': 'Payment gateway returned an invalid response.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # Step 8: Persist payment result atomically with booking state changes.
        with transaction.atomic():
            payment = Payment.objects.select_for_update().select_related('booking').get(id=payment.id)

            if data.get('status') and data.get('data', {}).get('status') == 'success':
                payment.status = PaymentStatus.SUCCESS
                payment.gateway_response = data.get('data', {})
                payment.save(update_fields=['status', 'gateway_response', 'updated_at'])

                booking = payment.booking
                if booking.status != BookingStatus.CONFIRMED:
                    booking.status = BookingStatus.CONFIRMED
                    booking.payment_completed_at = timezone.now()
                    booking.save(update_fields=['status', 'payment_completed_at', 'updated_at'])
                    send_ticket_email(booking)

                return Response({
                    'status': 'success',
                    'reference': payment.reference,
                    'amount': payment.amount,
                    'paid_at': booking.payment_completed_at,
                    'mode': 'paystack',
                })

            payment.status = PaymentStatus.FAILED
            payment.gateway_response = data
            payment.save(update_fields=['status', 'gateway_response', 'updated_at'])

        return Response({
            'status': 'failed',
            'reference': payment.reference,
            'message': data.get('message', 'Payment verification failed'),
            'mode': 'paystack',
        }, status=status.HTTP_400_BAD_REQUEST)


class WebhookView(APIView):
    """
    Receive asynchronous Paystack webhook events (source of truth fallback).
    """

    permission_classes = [AllowAny]

    def _is_valid_signature(self, request):
        """
        Paystack signs webhook body with SHA512(secret_key, raw_body).
        """
        secret_key = (getattr(settings, 'PAYSTACK_SECRET_KEY', '') or '').strip()
        if not secret_key:
            return False

        incoming_signature = request.headers.get('X-Paystack-Signature', '')
        expected_signature = hmac.new(
            secret_key.encode('utf-8'),
            request.body,
            hashlib.sha512,
        ).hexdigest()
        return hmac.compare_digest(incoming_signature, expected_signature)

    def post(self, request):
        # Step 1: Reject unsigned or tampered webhooks.
        if not self._is_valid_signature(request):
            return Response({'error': 'Invalid webhook signature'}, status=status.HTTP_400_BAD_REQUEST)

        # Step 2: Parse webhook event envelope.
        event = request.data.get('event')
        data = request.data.get('data')

        # Step 3: Ignore events we don't handle yet.
        if event != 'charge.success' or not isinstance(data, dict):
            return Response({'message': 'Event ignored'}, status=status.HTTP_200_OK)

        reference = data.get('reference')
        if not reference:
            return Response({'message': 'Missing reference in webhook payload'}, status=status.HTTP_200_OK)

        # Step 4: Apply idempotent success transition for payment + booking.
        try:
            with transaction.atomic():
                payment = Payment.objects.select_for_update().select_related('booking').get(reference=reference)

                if payment.status != PaymentStatus.SUCCESS:
                    payment.status = PaymentStatus.SUCCESS
                    payment.gateway_response = data
                    payment.save(update_fields=['status', 'gateway_response', 'updated_at'])

                    booking = payment.booking
                    if booking.status != BookingStatus.CONFIRMED:
                        booking.status = BookingStatus.CONFIRMED
                        booking.payment_completed_at = timezone.now()
                        booking.save(update_fields=['status', 'payment_completed_at', 'updated_at'])
                        send_ticket_email(booking)
        except Payment.DoesNotExist:
            # Unknown reference can happen if webhook arrives for stale/deleted local data.
            return Response({'message': 'Payment reference not found'}, status=status.HTTP_200_OK)

        return Response({'message': 'Webhook processed'}, status=status.HTTP_200_OK)
