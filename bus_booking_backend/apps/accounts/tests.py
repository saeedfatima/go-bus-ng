from datetime import timedelta
from unittest.mock import Mock, patch

from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User
from utils.emails import send_otp_email


class EmailUtilityTests(TestCase):
    @override_settings(
        RESEND_API_KEY='re_test_key',
        DEFAULT_FROM_EMAIL='NaijaBus <onboarding@resend.dev>',
        OTP_EXPIRY_MINUTES=10,
    )
    @patch('utils.emails.requests.post')
    def test_send_otp_email_delivers_with_resend_api(self, mock_post):
        user = User.objects.create_user(
            email='email-test@example.com',
            password='password123',
            full_name='Email Test',
        )
        user.otp_code = '123456'
        mock_post.return_value = Mock(ok=True)

        sent = send_otp_email(user)

        self.assertTrue(sent)
        mock_post.assert_called_once()
        request_payload = mock_post.call_args.kwargs['json']
        self.assertEqual(request_payload['to'], ['email-test@example.com'])
        self.assertIn('123456', request_payload['text'])

    @override_settings(
        RESEND_API_KEY='',
        DEFAULT_FROM_EMAIL='NaijaBus <onboarding@resend.dev>',
    )
    def test_send_otp_email_returns_false_for_missing_resend_key(self):
        user = User.objects.create_user(
            email='resend-test@example.com',
            password='password123',
            full_name='Resend Test',
        )
        user.otp_code = '654321'

        sent = send_otp_email(user)

        self.assertFalse(sent)


class OtpApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='otp-user@example.com',
            password='password123',
            full_name='OTP User',
        )
        self.user.is_email_verified = False
        self.user.otp_code = '123456'
        self.user.otp_expires_at = timezone.now() + timedelta(minutes=10)
        self.user.save(
            update_fields=['is_email_verified', 'otp_code', 'otp_expires_at', 'updated_at']
        )

    @patch('apps.accounts.otp_service.send_otp_email', return_value=True)
    @override_settings(OTP_RESEND_COOLDOWN_SECONDS=60)
    def test_resend_otp_is_rate_limited(self, _mock_send_otp_email):
        first_response = self.client.post(
            '/api/v1/auth/resend-otp/',
            {'email': self.user.email},
            format='json',
        )
        second_response = self.client.post(
            '/api/v1/auth/resend-otp/',
            {'email': self.user.email},
            format='json',
        )

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 429)
        self.assertIn('retry_after', second_response.data)

    def test_verify_otp_clears_code_after_too_many_failed_attempts(self):
        self.user.otp_failed_attempts = 4
        self.user.save(update_fields=['otp_failed_attempts', 'updated_at'])

        response = self.client.post(
            '/api/v1/auth/verify-otp/',
            {'email': self.user.email, 'otp_code': '000000'},
            format='json',
        )

        self.assertEqual(response.status_code, 429)
        self.user.refresh_from_db()
        self.assertIsNone(self.user.otp_code)
        self.assertIsNone(self.user.otp_expires_at)
        self.assertIsNone(self.user.otp_last_sent_at)

    def test_verify_otp_marks_user_verified_and_clears_state(self):
        response = self.client.post(
            '/api/v1/auth/verify-otp/',
            {'email': self.user.email, 'otp_code': '123456'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_email_verified)
        self.assertIsNone(self.user.otp_code)
        self.assertEqual(self.user.otp_failed_attempts, 0)
