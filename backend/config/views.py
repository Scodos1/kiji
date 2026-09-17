import os

from django.conf import settings
from django.http import JsonResponse, FileResponse, Http404


def api_not_found(request, exception=None):
    return JsonResponse({'detail': 'Not found.'}, status=404)


def api_server_error(request):
    return JsonResponse(
        {'detail': 'An unexpected error occurred. Please try again.'}, status=500
    )


_FRONTEND_DIST = os.path.join(settings.BASE_DIR.parent, 'frontend', 'dist')


def serve_frontend(request, path=''):
    if path:
        file_path = os.path.join(_FRONTEND_DIST, path)
    else:
        file_path = os.path.join(_FRONTEND_DIST, 'index.html')

    if os.path.isfile(file_path):
        content_type = 'text/html'
        if path.endswith('.js'):
            content_type = 'application/javascript'
        elif path.endswith('.css'):
            content_type = 'text/css'
        elif path.endswith('.svg'):
            content_type = 'image/svg+xml'
        elif path.endswith('.json'):
            content_type = 'application/json'
        elif path.endswith('.png'):
            content_type = 'image/png'
        elif path.endswith('.ico'):
            content_type = 'image/x-icon'
        elif path.endswith('.woff2'):
            content_type = 'font/woff2'
        elif path.endswith('.woff'):
            content_type = 'font/woff'
        elif path.endswith('.ttf'):
            content_type = 'font/ttf'
        return FileResponse(open(file_path, 'rb'), content_type=content_type)

    index_path = os.path.join(_FRONTEND_DIST, 'index.html')
    if os.path.isfile(index_path):
        return FileResponse(open(index_path, 'rb'), content_type='text/html')

    raise Http404
