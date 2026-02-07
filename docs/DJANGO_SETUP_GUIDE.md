# Django Backend Setup Guide

This guide walks you through setting up the Django REST Framework backend for the NaijaBus booking system and connecting it to the React frontend.

---

## Prerequisites

- **Python 3.10+** installed ([python.org](https://www.python.org/downloads/))
- **pip** (Python package manager, included with Python)
- **Git** (optional, for cloning)
- The React frontend running (default: `http://localhost:5173`)

---

## Step 1: Create the Django Project

```bash
# Create project directory
mkdir bus_booking_backend && cd bus_booking_backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### requirements.txt

```txt
Django>=4.2,<5.0
djangorestframework>=3.14.0
django-cors-headers>=4.3.0
django-filter>=23.5
djangorestframework-simplejwt>=5.3.0
drf-yasg>=1.21.7
python-dotenv>=1.0.0
Pillow>=10.1.0
gunicorn>=21.2.0
requests>=2.31.0
```

---

## Step 2: Environment Configuration

Create a `.env` file in the project root:

```env
# Django Core
DJANGO_SECRET_KEY=your-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS — must include the React frontend URL
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080

# Database (SQLite by default, no config needed)
# For PostgreSQL, uncomment and fill:
# DB_ENGINE=django.db.backends.postgresql
# DB_NAME=bus_booking
# DB_USER=postgres
# DB_PASSWORD=your-password
# DB_HOST=localhost
# DB_PORT=5432

# Email (for OTP and e-ticket delivery)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=NaijaBus <noreply@naijab.us>

# Paystack Payment Gateway
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_CALLBACK_URL=http://localhost:5173/booking/{id}/payment

# JWT Token Expiry
ACCESS_TOKEN_LIFETIME_MINUTES=60
REFRESH_TOKEN_LIFETIME_DAYS=7
```

---

## Step 3: Run Migrations & Start Server

```bash
# Apply database migrations
python manage.py migrate

# Create admin superuser (optional)
python manage.py createsuperuser

# Load sample data (optional)
python manage.py loaddata fixtures/sample_data.json

# Start development server
python manage.py runserver
```

The API will be available at: **http://localhost:8000/api/v1/**

---

## Step 4: Connect Frontend to Django

In the React frontend project, set the environment variable:

```env
VITE_API_BACKEND=django
VITE_DJANGO_API_URL=http://localhost:8000/api/v1
```

This tells the frontend API factory (`src/services/api/index.ts`) to use the Django service implementation instead of Supabase.

---

## Step 5: Verify the Connection

### 5a. Test from browser

Start both servers:
- Django: `python manage.py runserver` (port 8000)
- React: `npm run dev` (port 5173)

Open the React app and check the browser console for API calls going to `localhost:8000`.

### 5b. Test from command line

```bash
# Health check
curl http://localhost:8000/api/v1/cities/

# Register a user
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","full_name":"Test User","phone":"08012345678"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

---

## Step 6: CORS Configuration

Ensure your Django `settings.py` includes:

```python
INSTALLED_APPS = [
    ...
    'corsheaders',
    ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first
    'django.middleware.security.SecurityMiddleware',
    ...
]

# Allow frontend origins
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

---

## Step 7: OTP Email Verification

When a user registers, Django:
1. Creates an **inactive** user account
2. Generates a 6-digit OTP code
3. Sends the OTP to the user's email
4. Returns `{ "otp_required": true }`

The frontend shows the OTP input form. After verification:
1. Django activates the user
2. Returns JWT tokens (`access` + `refresh`)
3. Frontend logs the user in

### Email Backend for Development

For local development without a real SMTP server:

```python
# settings.py — prints emails to console
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

---

## Step 8: Paystack Integration

### Get API Keys

1. Sign up at [paystack.com](https://paystack.com)
2. Go to **Settings > API Keys & Webhooks**
3. Copy your **Test Secret Key** and **Test Public Key**
4. Add them to your `.env` file

### Payment Flow

1. User clicks "Pay" → Frontend calls `POST /api/v1/payments/initialize/`
2. Django creates a Paystack transaction → returns `authorization_url`
3. Frontend redirects user to Paystack checkout
4. After payment, Paystack redirects back to the frontend
5. Frontend calls `GET /api/v1/payments/verify/?reference=xxx`
6. Django verifies with Paystack API → updates booking status

### Webhook (Production)

Set up a webhook URL in Paystack dashboard pointing to:
```
https://your-django-domain.com/api/v1/payments/webhook/
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors in browser | Ensure `CORS_ORIGINS` includes your frontend URL |
| 401 Unauthorized | Check JWT token is being sent in `Authorization: Bearer <token>` header |
| Field name mismatches | Frontend uses camelCase, Django uses snake_case. The frontend client handles conversion. See `docs/DJANGO_BACKEND_STRUCTURE.md` for the full mapping. |
| OTP email not received | Check `EMAIL_BACKEND` config. Use console backend for development. |
| Paystack "Invalid key" | Ensure you're using test keys for development, live keys for production |
| SQLite locking errors | Switch to PostgreSQL for production or reduce concurrent writes |

### Checking API Docs

Django provides auto-generated API documentation:
- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/

### Database Reset

```bash
# Delete SQLite database and recreate
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
python manage.py loaddata fixtures/sample_data.json
```

---

## Production Deployment Checklist

- [ ] Set `DEBUG=False`
- [ ] Generate a strong `DJANGO_SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Switch to PostgreSQL database
- [ ] Configure proper CORS origins (production frontend URL)
- [ ] Use Paystack **live** keys instead of test keys
- [ ] Set up proper email SMTP (SendGrid, Resend, or Gmail)
- [ ] Run `python manage.py check --deploy`
- [ ] Set up HTTPS with SSL certificate
- [ ] Configure Paystack webhook URL
- [ ] Set up cron job for `python manage.py expire_bookings`
