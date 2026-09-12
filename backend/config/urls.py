from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse


def health(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),
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

handler404 = 'config.views.api_not_found'
handler500 = 'config.views.api_server_error'
