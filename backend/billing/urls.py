from django.urls import path

from .views import InitializeView, PlansView, UsageView, VerifyView

urlpatterns = [
    path('usage/', UsageView.as_view(), name='billing-usage'),
    path('plans/', PlansView.as_view(), name='billing-plans'),
    path('initialize/', InitializeView.as_view(), name='billing-initialize'),
    path('verify/', VerifyView.as_view(), name='billing-verify'),
]
