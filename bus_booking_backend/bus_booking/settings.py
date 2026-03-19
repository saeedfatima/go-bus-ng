import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent
try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

# Load environment variables from bus_booking_backend/.env when present.
if load_dotenv:
    load_dotenv(BASE_DIR / '.env', override=True)

try:
    import dj_database_url
except ImportError:
    dj_database_url = None

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-your-dev-secret-key-change-in-production')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,.onrender.com').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_yasg',
    # Local apps
    'apps.accounts',
    'apps.companies',
    'apps.buses',
    'apps.routes',
    'apps.trips',
    'apps.bookings',
    'apps.cities',
    'apps.profiles',
    'apps.payments',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'bus_booking.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'bus_booking.wsgi.application'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'utils.pagination.StandardResultsPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

AUTH_USER_MODEL = 'accounts.User'

# Database:
# - On Render: set DATABASE_URL env var to the PostgreSQL connection string.
# - Locally:   falls back to a local SQLite file — no env var needed.
_database_url = os.getenv('DATABASE_URL')
if _database_url and dj_database_url:
    # Render PostgreSQL requires SSL. Enabling conn_health_checks for reliability.
    DATABASES = {
        'default': dj_database_url.config(
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# CORS - Allow frontend origins.
# On Render: set CORS_ALLOW_ALL_ORIGINS=True in the backend environment variables.
# Locally: all localhost ports plus the Render frontend are allowed by default.
if os.getenv('CORS_ALLOW_ALL_ORIGINS', 'False') == 'True':
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:3000,http://localhost:5173,http://localhost:8080,http://localhost:8081,https://go-bus-ng-frontend.onrender.com'
    ).split(',')
CORS_ALLOW_CREDENTIALS = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise configuration for serving static files efficiently
# Using CompressedStaticFilesStorage to be safer on the free tier.
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

# Media files
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email configuration
# Locally: prints to console (no setup needed).
# Email configuration
# Locally: prints to console (no setup needed).
# On Render: Use Gmail or Resend (recommended).
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
if os.getenv('EMAIL_HOST_PASSWORD'):
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    print("[SYSTEM] Email Backend: SMTP (Engaged)", flush=True)
else:
    # Optional logic to also allow EMAIL_HOST_USER for backward compatibility
    if os.getenv('EMAIL_HOST_USER'):
        EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
        print("[SYSTEM] Email Backend: SMTP (Engaged via User)", flush=True)
    else:
        print("[SYSTEM] Email Backend: CONSOLE (Fallback)", flush=True)

EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.resend.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'resend')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')

# Resend/Gmail recommendation: 587 with STARTTLS. 465 is for implicit SSL.
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', str(EMAIL_PORT == 587)).lower() == 'true'
EMAIL_USE_SSL = os.getenv('EMAIL_USE_SSL', str(EMAIL_PORT == 465)).lower() == 'true'
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'onboarding@resend.dev')

# Frontend URL for links (Paystack redirects, email verification, etc.)
# If not set, it defaults to the local dev server.
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://go-bus-ng-frontend.onrender.com/').rstrip('/')

# Paystack configuration
PAYSTACK_SECRET_KEY = os.getenv('PAYSTACK_SECRET_KEY', '')
PAYSTACK_WEBHOOK_SECRET = os.getenv('PAYSTACK_WEBHOOK_SECRET', '')
# Callback URL matches the frontend payment processing page
PAYSTACK_CALLBACK_URL = os.getenv('PAYSTACK_CALLBACK_URL', f'{FRONTEND_URL}/booking/{{id}}/payment')
PAYSTACK_MOCK_REDIRECT_URL_TEMPLATE = os.getenv('PAYSTACK_MOCK_REDIRECT_URL_TEMPLATE', f'{FRONTEND_URL}/booking/{{id}}/payment?reference={{reference}}')

# Hybrid fallback for local/dev testing.
# If env var is not provided, default to enabled only in DEBUG.
_paystack_mock_fallback_raw = os.getenv('PAYSTACK_ENABLE_MOCK_FALLBACK')
if _paystack_mock_fallback_raw is None:
    PAYSTACK_ENABLE_MOCK_FALLBACK = DEBUG
else:
    PAYSTACK_ENABLE_MOCK_FALLBACK = _paystack_mock_fallback_raw.strip().lower() in {
        '1', 'true', 'yes', 'on'
    }

PAYSTACK_MOCK_REDIRECT_URL_TEMPLATE = os.getenv(
    'PAYSTACK_MOCK_REDIRECT_URL_TEMPLATE',
    'https://go-bus-ng-frontend.onrender.com//booking/{id}/payment?reference={reference}',
)
