import logging

import requests
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


logger = logging.getLogger(__name__)


def _format_departure_time(value):
    if not value:
        return "TBD"
    return value.strftime('%B %d, %Y at %I:%M %p').replace(' at 0', ' at ')


def _validate_email_settings():
    if not getattr(settings, 'RESEND_API_KEY', ''):
        return False, 'RESEND_API_KEY is not configured.'

    if not getattr(settings, 'DEFAULT_FROM_EMAIL', ''):
        return False, 'DEFAULT_FROM_EMAIL is not configured.'

    return True, ''


def _send_email(subject, plain_message, html_message, recipient_list):
    is_valid, validation_error = _validate_email_settings()
    if not is_valid:
        logger.error("Email configuration error: %s", validation_error)
        return False

    payload = {
        'from': settings.DEFAULT_FROM_EMAIL,
        'to': recipient_list,
        'subject': subject,
        'html': html_message,
        'text': plain_message,
    }
    if getattr(settings, 'RESEND_REPLY_TO', ''):
        payload['reply_to'] = settings.RESEND_REPLY_TO

    headers = {
        'Authorization': f"Bearer {settings.RESEND_API_KEY}",
        'Content-Type': 'application/json',
    }

    logger.info(
        "Sending email '%s' to %s via Resend API",
        subject,
        recipient_list,
    )

    try:
        response = requests.post(
            settings.RESEND_API_URL,
            headers=headers,
            json=payload,
            timeout=getattr(settings, 'RESEND_REQUEST_TIMEOUT', 20),
        )
    except requests.RequestException:
        logger.exception("Failed to reach Resend API for %s", recipient_list)
        return False

    if response.ok:
        logger.info("Resend accepted email for %s", recipient_list)
        return True

    try:
        error_payload = response.json()
    except ValueError:
        error_payload = {'message': response.text}

    logger.error(
        "Resend API rejected email to %s. Status: %s. Response: %s",
        recipient_list,
        response.status_code,
        error_payload,
    )
    return False


def send_ticket_email(booking):
    try:
        context = {
            'passenger_name': booking.passenger_name,
            'ticket_code': booking.ticket_code,
            'origin': booking.trip.route.origin_city.name if booking.trip.route.origin_city else "Unknown",
            'destination': booking.trip.route.destination_city.name if booking.trip.route.destination_city else "Unknown",
            'departure_time': _format_departure_time(booking.trip.departure_time),
            'bus_company': booking.trip.company.name if booking.trip.company else "NaijaBus",
            'plate_number': booking.trip.bus.plate_number if booking.trip.bus else "N/A",
            'seats': ", ".join(booking.seats),
            'total_amount': f"{booking.total_amount:,.2f}",
        }

        html_message = render_to_string('emails/booking_confirmation.html', context)
        plain_message = strip_tags(html_message)

        return _send_email(
            subject=f'Your Ticket: {booking.ticket_code} - Confirming your Trip',
            plain_message=plain_message,
            html_message=html_message,
            recipient_list=[booking.passenger_email],
        )
    except Exception:
        logger.exception("Failed to prepare ticket email for booking %s", booking.ticket_code)
        return False


def send_otp_email(user):
    try:
        html_message = render_to_string(
            'emails/otp_verification.html',
            {
                'full_name': user.full_name or user.email,
                'otp_code': user.otp_code,
            },
        )
        plain_message = (
            f"Your OTP code is: {user.otp_code}. "
            f"It expires in {getattr(settings, 'OTP_EXPIRY_MINUTES', 10)} minutes."
        )

        return _send_email(
            subject='Your NaijaBus Verification Code',
            plain_message=plain_message,
            html_message=html_message,
            recipient_list=[user.email],
        )
    except Exception:
        logger.exception("Failed to prepare OTP email for %s", user.email)
        return False


def send_password_reset_email(user, reset_url):
    try:
        html_message = render_to_string(
            'emails/password_reset.html',
            {
                'full_name': user.full_name or user.email,
                'reset_url': reset_url,
            },
        )
        plain_message = f"Click this link to reset your password: {reset_url}"

        return _send_email(
            subject='Reset Your NaijaBus Password',
            plain_message=plain_message,
            html_message=html_message,
            recipient_list=[user.email],
        )
    except Exception:
        logger.exception("Failed to prepare password reset email for %s", user.email)
        return False
