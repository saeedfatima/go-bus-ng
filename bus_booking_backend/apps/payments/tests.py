from datetime import timedelta
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import Mock, patch

from django.test import SimpleTestCase, TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.bookings.models import Booking, BookingStatus
from apps.buses.models import Bus
from apps.cities.models import City
from apps.companies.models import Company
from apps.payments.models import Payment, PaymentStatus
from apps.payments.paystack_config import can_use_real_paystack, is_placeholder_key
from apps.routes.models import Route
from apps.trips.models import Trip


class PaystackConfigHelperTests(SimpleTestCase):
    def test_is_placeholder_key_detects_missing_or_sample_values(self):
        self.assertTrue(is_placeholder_key(''))
        self.assertTrue(is_placeholder_key('   '))
        self.assertTrue(is_placeholder_key('sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx'))
        self.assertTrue(is_placeholder_key('your_key_here'))
        self.assertFalse(is_placeholder_key('sk_test_1234567890realkey'))

    def test_can_use_real_paystack_returns_expected_validation_result(self):
        valid = SimpleNamespace(
            PAYSTACK_SECRET_KEY='sk_test_1234567890realkey',
            PAYSTACK_CALLBACK_URL='http://localhost:5173/booking/{id}/payment',
        )
        invalid = SimpleNamespace(
            PAYSTACK_SECRET_KEY='sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            PAYSTACK_CALLBACK_URL='',
        )

        self.assertEqual(can_use_real_paystack(valid), (True, ''))
        self.assertEqual(
            can_use_real_paystack(invalid),
            (False, 'PAYSTACK_SECRET_KEY looks like a placeholder/sample key.'),
        )


class PaymentApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='passenger@example.com',
            password='password123',
            full_name='Passenger User',
        )
        self.owner = User.objects.create_user(
            email='owner@example.com',
            password='password123',
            full_name='Company Owner',
        )

        origin = City.objects.create(name='Lagos', state='Lagos')
        destination = City.objects.create(name='Abuja', state='FCT')
        company = Company.objects.create(name='Test Company', owner=self.owner)
        bus = Bus.objects.create(company=company, plate_number='TEST-1001')
        route = Route.objects.create(
            company=company,
            origin_city=origin,
            destination_city=destination,
            base_price=Decimal('17000.00'),
            duration_hours=Decimal('8.00'),
        )
        self.trip = Trip.objects.create(
            route=route,
            bus=bus,
            departure_time=timezone.now() + timedelta(days=1),
            arrival_time=timezone.now() + timedelta(days=1, hours=8),
            price=Decimal('17000.00'),
            available_seats=40,
        )

    def create_booking(
        self,
        *,
        status=BookingStatus.PENDING,
        hold_expires_at=None,
        email='passenger@example.com',
        amount=Decimal('17000.00'),
    ) -> Booking:
        if hold_expires_at is None:
            hold_expires_at = timezone.now() + timedelta(minutes=15)

        return Booking.objects.create(
            trip=self.trip,
            user=self.user,
            seats=['01'],
            total_amount=amount,
            status=status,
            passenger_name='Passenger User',
            passenger_phone='08000000000',
            passenger_email=email,
            hold_expires_at=hold_expires_at,
        )

    def initialize_payload(self, booking: Booking) -> dict:
        return {
            'booking_id': str(booking.id),
            'email': booking.passenger_email,
            'amount': str(booking.total_amount),
        }

    @override_settings(
        DEBUG=True,
        PAYSTACK_SECRET_KEY='sk_test_1234567890realkey',
        PAYSTACK_CALLBACK_URL='http://localhost:5173/booking/{id}/payment',
        PAYSTACK_ENABLE_MOCK_FALLBACK=True,
    )
    def test_initialize_returns_400_for_expired_pending_booking(self):
        booking = self.create_booking(hold_expires_at=timezone.now() - timedelta(minutes=1))
        self.client.force_authenticate(user=self.user)

        response = self.client.post('/api/v1/payments/initialize/', self.initialize_payload(booking), format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('expired', response.data['error'].lower())
        booking.refresh_from_db()
        self.assertEqual(booking.status, BookingStatus.EXPIRED)

    @override_settings(
        DEBUG=True,
        PAYSTACK_SECRET_KEY='',
        PAYSTACK_CALLBACK_URL='',
        PAYSTACK_ENABLE_MOCK_FALLBACK=True,
        PAYSTACK_MOCK_REDIRECT_URL_TEMPLATE='http://localhost:5173/booking/{id}/payment?reference={reference}',
    )
    def test_initialize_uses_mock_fallback_for_config_issue(self):
        booking = self.create_booking()
        self.client.force_authenticate(user=self.user)

        response = self.client.post('/api/v1/payments/initialize/', self.initialize_payload(booking), format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['mode'], 'mock')
        self.assertIn(str(booking.id), response.data['authorization_url'])
        self.assertIn(response.data['reference'], response.data['authorization_url'])

        payment = Payment.objects.get(reference=response.data['reference'])
        self.assertEqual(payment.status, PaymentStatus.PENDING)
        self.assertEqual(payment.gateway_response.get('mode'), 'mock')

    @override_settings(
        DEBUG=True,
        PAYSTACK_SECRET_KEY='',
        PAYSTACK_CALLBACK_URL='',
        PAYSTACK_ENABLE_MOCK_FALLBACK=False,
    )
    def test_initialize_returns_500_when_config_invalid_and_fallback_disabled(self):
        booking = self.create_booking()
        self.client.force_authenticate(user=self.user)

        response = self.client.post('/api/v1/payments/initialize/', self.initialize_payload(booking), format='json')

        self.assertEqual(response.status_code, 500)
        self.assertIn('PAYSTACK_SECRET_KEY', response.data['error'])

    @override_settings(
        DEBUG=True,
        PAYSTACK_SECRET_KEY='sk_test_1234567890realkey',
        PAYSTACK_CALLBACK_URL='http://localhost:5173/booking/{id}/payment',
        PAYSTACK_ENABLE_MOCK_FALLBACK=True,
    )
    @patch('apps.payments.views.requests.post')
    def test_initialize_calls_real_paystack_when_config_is_valid(self, mock_post):
        booking = self.create_booking()
        self.client.force_authenticate(user=self.user)

        def fake_post(*args, **kwargs):
            reference = kwargs['json']['reference']
            response = Mock()
            response.json.return_value = {
                'status': True,
                'data': {
                    'authorization_url': 'http://paystack.test/authorize',
                    'access_code': 'AC_TEST',
                    'reference': reference,
                },
            }
            return response

        mock_post.side_effect = fake_post

        response = self.client.post('/api/v1/payments/initialize/', self.initialize_payload(booking), format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['mode'], 'paystack')
        self.assertEqual(response.data['access_code'], 'AC_TEST')
        mock_post.assert_called_once()
        self.assertTrue(Payment.objects.filter(reference=response.data['reference']).exists())

    @override_settings(
        DEBUG=True,
        PAYSTACK_SECRET_KEY='sk_test_1234567890realkey',
        PAYSTACK_CALLBACK_URL='http://localhost:5173/booking/{id}/payment',
        PAYSTACK_ENABLE_MOCK_FALLBACK=True,
    )
    @patch('apps.payments.views.requests.post')
    def test_initialize_marks_payment_failed_on_paystack_business_error(self, mock_post):
        booking = self.create_booking()
        self.client.force_authenticate(user=self.user)

        response = Mock()
        response.json.return_value = {'status': False, 'message': 'Invalid key'}
        mock_post.return_value = response

        api_response = self.client.post('/api/v1/payments/initialize/', self.initialize_payload(booking), format='json')

        self.assertEqual(api_response.status_code, 400)
        self.assertEqual(api_response.data['error'], 'Invalid key')
        self.assertEqual(Payment.objects.count(), 1)
        self.assertEqual(Payment.objects.first().status, PaymentStatus.FAILED)

    @override_settings(
        DEBUG=True,
        PAYSTACK_ENABLE_MOCK_FALLBACK=True,
    )
    def test_verify_confirms_mock_payment(self):
        booking = self.create_booking()
        payment = Payment.objects.create(
            booking=booking,
            amount=booking.total_amount,
            reference='mock-ref-1',
            status=PaymentStatus.PENDING,
            gateway_response={'mode': 'mock', 'reason': 'config invalid'},
        )

        response = self.client.get(f'/api/v1/payments/verify/?reference={payment.reference}')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['mode'], 'mock')
        payment.refresh_from_db()
        booking.refresh_from_db()
        self.assertEqual(payment.status, PaymentStatus.SUCCESS)
        self.assertEqual(booking.status, BookingStatus.CONFIRMED)
        self.assertIsNotNone(booking.payment_completed_at)

    @override_settings(
        DEBUG=True,
        PAYSTACK_ENABLE_MOCK_FALLBACK=True,
    )
    @patch('apps.payments.views.requests.get')
    def test_verify_is_idempotent_for_successful_mock_payment(self, mock_get):
        booking = self.create_booking(status=BookingStatus.CONFIRMED)
        booking.payment_completed_at = timezone.now()
        booking.save(update_fields=['payment_completed_at'])
        payment = Payment.objects.create(
            booking=booking,
            amount=booking.total_amount,
            reference='mock-ref-2',
            status=PaymentStatus.SUCCESS,
            gateway_response={'mode': 'mock', 'reason': 'config invalid'},
        )

        response = self.client.get(f'/api/v1/payments/verify/?reference={payment.reference}')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['mode'], 'mock')
        self.assertEqual(response.data['status'], 'success')
        mock_get.assert_not_called()

    @override_settings(
        DEBUG=True,
        PAYSTACK_SECRET_KEY='sk_test_1234567890realkey',
        PAYSTACK_CALLBACK_URL='http://localhost:5173/booking/{id}/payment',
        PAYSTACK_ENABLE_MOCK_FALLBACK=True,
    )
    @patch('apps.payments.views.requests.get')
    def test_verify_real_paystack_success_confirms_booking(self, mock_get):
        booking = self.create_booking()
        payment = Payment.objects.create(
            booking=booking,
            amount=booking.total_amount,
            reference='real-ref-1',
            status=PaymentStatus.PENDING,
        )

        response = Mock()
        response.json.return_value = {'status': True, 'data': {'status': 'success', 'channel': 'card'}}
        mock_get.return_value = response

        api_response = self.client.get(f'/api/v1/payments/verify/?reference={payment.reference}')

        self.assertEqual(api_response.status_code, 200)
        self.assertEqual(api_response.data['mode'], 'paystack')
        self.assertEqual(api_response.data['status'], 'success')
        payment.refresh_from_db()
        booking.refresh_from_db()
        self.assertEqual(payment.status, PaymentStatus.SUCCESS)
        self.assertEqual(booking.status, BookingStatus.CONFIRMED)

    @override_settings(
        DEBUG=True,
        PAYSTACK_SECRET_KEY='sk_test_1234567890realkey',
        PAYSTACK_CALLBACK_URL='http://localhost:5173/booking/{id}/payment',
        PAYSTACK_ENABLE_MOCK_FALLBACK=True,
    )
    @patch('apps.payments.views.requests.get')
    def test_verify_real_paystack_failure_marks_payment_failed(self, mock_get):
        booking = self.create_booking()
        payment = Payment.objects.create(
            booking=booking,
            amount=booking.total_amount,
            reference='real-ref-2',
            status=PaymentStatus.PENDING,
        )

        response = Mock()
        response.json.return_value = {
            'status': True,
            'data': {'status': 'failed'},
            'message': 'Charge failed',
        }
        mock_get.return_value = response

        api_response = self.client.get(f'/api/v1/payments/verify/?reference={payment.reference}')

        self.assertEqual(api_response.status_code, 400)
        self.assertEqual(api_response.data['mode'], 'paystack')
        self.assertEqual(api_response.data['status'], 'failed')
        payment.refresh_from_db()
        booking.refresh_from_db()
        self.assertEqual(payment.status, PaymentStatus.FAILED)
        self.assertEqual(booking.status, BookingStatus.PENDING)
