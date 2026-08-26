from django.urls import path

from .views import CampaignView, OpportunitiesView

urlpatterns = [
    path('opportunities/', OpportunitiesView.as_view(), name='marketing-opportunities'),
    path('campaigns/', CampaignView.as_view(), name='marketing-campaigns'),
]
