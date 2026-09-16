web: python backend/manage.py migrate --noinput && gunicorn backend.config.wsgi --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 60 --access-logfile - --error-logfile -
release: python backend/manage.py migrate --noinput
