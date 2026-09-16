web: gunicorn config.wsgi --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --access-logfile - --error-logfile -
release: sh -c "cd /app/backend && python manage.py migrate --noinput"
