web: cd backend && python manage.py collectstatic --noinput 2>/dev/null; gunicorn config.wsgi --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --log-level debug --access-logfile - --error-logfile -
release: cd backend && python manage.py migrate --noinput
