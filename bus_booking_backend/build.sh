#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Building Django Application for Render..."

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Create migrations just in case some were missed locally
echo "Creating potential missing migrations..."
python manage.py makemigrations --no-input

# Run migrations
echo "Applying database migrations..."
python manage.py migrate --no-input

# Collect static files
python manage.py collectstatic --no-input

# Automatically create a superadmin if credentials are provided in environment
if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
    echo "Checking/Creating Superadmin..."
    python manage.py shell -c "
from apps.accounts.models import User, UserRole, AppRole
try:
    user = User.objects.get(email='$ADMIN_EMAIL')
    print('Superadmin already exists.')
except User.DoesNotExist:
    user = User.objects.create_superuser(email='$ADMIN_EMAIL', password='$ADMIN_PASSWORD', is_email_verified=True)
    UserRole.objects.get_or_create(user=user, role=AppRole.ADMIN)
    print('Superadmin created successfully.')
"
fi

echo "Build complete."
