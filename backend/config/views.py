from django.http import JsonResponse


def api_not_found(request, exception=None):
    return JsonResponse({'detail': 'Not found.'}, status=404)


def api_server_error(request):
    return JsonResponse(
        {'detail': 'An unexpected error occurred. Please try again.'}, status=500
    )
