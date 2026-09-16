#!/bin/sh
set -e

echo "=== Kiji Startup ==="
echo "PORT=$PORT"
echo "DJANGO_SETTINGS_MODULE=$DJANGO_SETTINGS_MODULE"
echo "DATABASE_URL is set: $([ -n \"$DATABASE_URL\" ] && echo 'yes' || echo 'no')"
echo "PYTHONPATH=$PYTHONPATH"

cd /app/backend
echo "Working dir: $(pwd)"
echo "Python: $(python --version)"

echo "=== Running migrations ==="
python manage.py migrate --noinput
echo "=== Migrations done ==="

echo "=== Collecting static files ==="
python manage.py collectstatic --noinput 2>&1 || echo "Static collect skipped"
echo "=== Static files done ==="

echo "=== Starting gunicorn ==="
exec gunicorn config.wsgi \
    --bind "0.0.0.0:${PORT:-8000}" \
    --workers 2 \
    --timeout 120 \
    --log-level debug \
    --access-logfile - \
    --error-logfile -
