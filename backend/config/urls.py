import os

from django.conf import settings
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path, re_path
from django.views.static import serve as static_serve

from config.views import spa_index


def health(request):
    return JsonResponse({'status': 'ok'})


_admin_secret = os.getenv('ADMIN_SECRET_KEY', '')
admin_url = f'admin/{_admin_secret}/' if _admin_secret else 'admin/'

_frontend_dist = os.path.join(settings.BASE_DIR.parent, 'frontend', 'dist')
_has_frontend = os.path.isdir(_frontend_dist)

urlpatterns = [
    path(admin_url, admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/business/', include('businesses.urls')),
    path('api/products/', include('products.urls')),
    path('api/sales/', include('sales.urls')),
    path('api/expenses/', include('expenses.urls')),
    path('api/customers/', include('customers.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/ai/', include('ai_advisor.urls')),
    path('api/marketing/', include('marketing.urls')),
    path('api/billing/', include('billing.urls')),
    path('health/', health, name='health'),
]

if _has_frontend:
    urlpatterns += [
        re_path(r'^assets/.*$', static_serve, {'document_root': _frontend_dist}),
        re_path(r'^(?!api/|admin/|static/).*$', spa_index),
    ]

handler404 = 'config.views.api_not_found'
handler500 = 'config.views.api_server_error'
