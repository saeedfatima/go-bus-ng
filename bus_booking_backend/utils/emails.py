import threading
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

print("[SYSTEM] Email Utility Module Loaded", flush=True)
logger = logging.getLogger(__name__)

def _send_email_async(subject, plain_message, html_message, recipient_list):
    """
    Helper function to send emails in a background thread to prevent blocking
    the main request and causing Gunicorn timeouts.
    """
    print(f"[EMAIL] Pre-flight: Attempting to send '{subject}' to {recipient_list}", flush=True)
    def send():
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipient_list,
                html_message=html_message,
                fail_silently=False,
            )
            print(f"[EMAIL] Success: Email sent to {recipient_list}", flush=True)
        except Exception as e:
            # Safer diagnostics: tell us the host/port being used without the password
            config_info = f"Host: {getattr(settings, 'EMAIL_HOST', 'N/A')}:{getattr(settings, 'EMAIL_PORT', 'N/A')}"
            print(f"[EMAIL] ERROR: Failed to send to {recipient_list}. {config_info}. Error: {str(e)}", flush=True)

    thread = threading.Thread(target=send)
    thread.start()
    return True


def send_ticket_email(booking):
    """
    Sends a booking confirmation email with ticket details.
    """
    try:
        # Prepare context for the email template
        context = {
            'passenger_name': booking.passenger_name,
            'ticket_code': booking.ticket_code,
            'origin': booking.trip.route.origin_city.name if booking.trip.route.origin_city else "Unknown",
            'destination': booking.trip.route.destination_city.name if booking.trip.route.destination_city else "Unknown",
            'departure_time': booking.trip.departure_time.strftime('%B %d, %Y at %-I:%M %p') if booking.trip.departure_time else "TBD",
            'bus_company': booking.trip.company.name if booking.trip.company else "NaijaBus",
            'plate_number': booking.trip.bus.plate_number if booking.trip.bus else "N/A",
            'seats': ", ".join(booking.seats),
            'total_amount': f"{booking.total_amount:,.2f}"
        }

        html_message = render_to_string('emails/booking_confirmation.html', context)
        plain_message = strip_tags(html_message)

        return _send_email_async(
            subject=f'Your Ticket: {booking.ticket_code} - Confirming your Trip',
            plain_message=plain_message,
            html_message=html_message,
            recipient_list=[booking.passenger_email],
        )
    except Exception as e:
        logger.error(f"Failed to prepare ticket email for booking {booking.ticket_code}: {str(e)}")
        return False

def send_otp_email(user):
    """
    Sends OTP verification email.
    """
    try:
        html_message = render_to_string('emails/otp_verification.html', {
            'full_name': user.full_name or user.email,
            'otp_code': user.otp_code,
        })
        plain_message = f"Your OTP code is: {user.otp_code}. It expires in 10 minutes."
        
        return _send_email_async(
            subject='Your NaijaBus Verification Code',
            plain_message=plain_message,
            html_message=html_message,
            recipient_list=[user.email],
        )
    except Exception as e:
        logger.error(f"Failed to prepare OTP email for {user.email}: {str(e)}")
        return False

def send_password_reset_email(user, reset_url):
    """
    Sends password reset email.
    """
    try:
        html_message = render_to_string('emails/password_reset.html', {
            'full_name': user.full_name or user.email,
            'reset_url': reset_url,
        })
        plain_message = f"Click this link to reset your password: {reset_url}"
        
        return _send_email_async(
            subject='Reset Your NaijaBus Password',
            plain_message=plain_message,
            html_message=html_message,
            recipient_list=[user.email],
        )
    except Exception as e:
        logger.error(f"Failed to prepare password reset email for {user.email}: {str(e)}")
        return False

