from django.urls import path

from .views import AskView, InsightsView

urlpatterns = [
    path('ask/', AskView.as_view(), name='ai-ask'),
    path('insights/', InsightsView.as_view(), name='ai-insights'),
]
