#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Building Django Application for Render..."

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --no-input

echo "Build complete."
