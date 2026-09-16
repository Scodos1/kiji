import os

from django.conf import settings
from django.http import JsonResponse, FileResponse, Http404


def api_not_found(request, exception=None):
    return JsonResponse({'detail': 'Not found.'}, status=404)


def api_server_error(request):
    return JsonResponse(
        {'detail': 'An unexpected error occurred. Please try again.'}, status=500
    )


def spa_index(request):
    index_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'dist', 'index.html')
    if os.path.isfile(index_path):
        return FileResponse(open(index_path, 'rb'), content_type='text/html')
    raise Http404
