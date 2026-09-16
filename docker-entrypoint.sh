#!/bin/sh
set -e

echo "=== Kiji starting ==="
echo "CWD=$(pwd)"
echo "PORT=${PORT:-8000}"

cd /app/backend
echo "CWD after cd=$(pwd)"
echo "manage.py exists: $(test -f manage.py && echo yes || echo no)"

echo "=== Running migrations ==="
python manage.py migrate --noinput
echo "=== Migrations done ==="

echo "=== Starting gunicorn ==="
exec gunicorn config.wsgi \
    --bind "0.0.0.0:${PORT:-8000}" \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
