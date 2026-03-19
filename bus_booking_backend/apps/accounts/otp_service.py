import logging
import math
import secrets
from dataclasses import dataclass
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from utils.emails import send_otp_email


logger = logging.getLogger(__name__)


@dataclass
class OtpActionResult:
    ok: bool
    detail: str
    retry_after: int = 0


def _generate_otp_code() -> str:
    return f"{secrets.randbelow(900000) + 100000:06d}"


def _clear_otp_state(user, *, verified: bool) -> None:
    user.is_email_verified = verified
    user.otp_code = None
    user.otp_expires_at = None
    user.otp_last_sent_at = None
    user.otp_failed_attempts = 0
    user.save(
        update_fields=[
            'is_email_verified',
            'otp_code',
            'otp_expires_at',
            'otp_last_sent_at',
            'otp_failed_attempts',
            'updated_at',
        ]
    )


def send_user_otp(user, *, respect_cooldown: bool, reuse_existing_code: bool) -> OtpActionResult:
    if user.is_email_verified:
        return OtpActionResult(False, 'Email is already verified.')

    now = timezone.now()
    cooldown_window = timedelta(seconds=getattr(settings, 'OTP_RESEND_COOLDOWN_SECONDS', 60))

    if (
        respect_cooldown
        and user.otp_last_sent_at
        and now < user.otp_last_sent_at + cooldown_window
    ):
        retry_after = math.ceil((user.otp_last_sent_at + cooldown_window - now).total_seconds())
        return OtpActionResult(
            False,
            'Please wait before requesting another OTP.',
            retry_after=max(1, retry_after),
        )

    has_valid_existing_code = bool(
        reuse_existing_code
        and user.otp_code
        and user.otp_expires_at
        and user.otp_expires_at > now
    )

    if not has_valid_existing_code:
        user.otp_code = _generate_otp_code()
        user.otp_expires_at = now + timedelta(
            minutes=getattr(settings, 'OTP_EXPIRY_MINUTES', 10)
        )
        user.save(update_fields=['otp_code', 'otp_expires_at', 'updated_at'])

    if getattr(settings, 'DEBUG', False):
        logger.info("OTP for %s: %s", user.email, user.otp_code)

    if not send_otp_email(user):
        return OtpActionResult(
            False,
            'Failed to send verification email. Check the SMTP settings and sender address.',
        )

    user.otp_last_sent_at = now
    user.otp_failed_attempts = 0
    user.save(update_fields=['otp_last_sent_at', 'otp_failed_attempts', 'updated_at'])
    return OtpActionResult(True, 'OTP sent successfully.')


def verify_user_otp(user, submitted_code: str) -> OtpActionResult:
    if user.is_email_verified:
        return OtpActionResult(False, 'Email is already verified.')

    now = timezone.now()
    max_failed_attempts = getattr(settings, 'OTP_MAX_FAILED_ATTEMPTS', 5)

    if not user.otp_code or not user.otp_expires_at:
        return OtpActionResult(False, 'No active OTP found. Request a new code.')

    if user.otp_expires_at <= now:
        _clear_otp_state(user, verified=False)
        return OtpActionResult(False, 'OTP expired. Request a new code.')

    if user.otp_failed_attempts >= max_failed_attempts:
        return OtpActionResult(False, 'Too many incorrect attempts. Request a new OTP.')

    if user.otp_code != submitted_code:
        user.otp_failed_attempts += 1
        user.save(update_fields=['otp_failed_attempts', 'updated_at'])
        if user.otp_failed_attempts >= max_failed_attempts:
            user.otp_code = None
            user.otp_expires_at = None
            user.otp_last_sent_at = None
            user.save(update_fields=['otp_code', 'otp_expires_at', 'otp_last_sent_at', 'updated_at'])
            return OtpActionResult(False, 'Too many incorrect attempts. Request a new OTP.')
        return OtpActionResult(False, 'Invalid OTP.')

    _clear_otp_state(user, verified=True)
    return OtpActionResult(True, 'Verification successful.')
