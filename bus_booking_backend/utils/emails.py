from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

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

        send_mail(
            subject=f'Your Ticket: {booking.ticket_code} - Confirming your Trip',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[booking.passenger_email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Ticket email sent successfully for booking {booking.ticket_code}")
        return True
    except Exception as e:
        logger.error(f"Failed to send ticket email for booking {booking.ticket_code}: {str(e)}")
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
        
        send_mail(
            subject='Your NaijaBus Verification Code',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {user.email}: {str(e)}")
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
        
        send_mail(
            subject='Reset Your NaijaBus Password',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user.email}: {str(e)}")
        return False
