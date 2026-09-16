web: sh -c "cd /app/backend && exec gunicorn config.wsgi --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120 --access-logfile - --error-logfile -"
release: sh -c "cd /app/backend && python manage.py migrate --noinput"
