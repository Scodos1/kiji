web: python backend/manage.py migrate --noinput && gunicorn config.wsgi --chdir backend --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 60
release: python backend/manage.py migrate --noinput
