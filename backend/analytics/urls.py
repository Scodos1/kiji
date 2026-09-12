from django.urls import path

from .views import (
    CustomerSegmentsView,
    ExpenseBreakdownView,
    ExportView,
    OverviewView,
    ProductPerformanceView,
    RevenueSeriesView,
)

urlpatterns = [
    path('overview/', OverviewView.as_view(), name='analytics-overview'),
    path('revenue/', RevenueSeriesView.as_view(), name='analytics-revenue'),
    path('expenses/', ExpenseBreakdownView.as_view(), name='analytics-expenses'),
    path('products/', ProductPerformanceView.as_view(), name='analytics-products'),
    path('customers/', CustomerSegmentsView.as_view(), name='analytics-customers'),
    path('export/', ExportView.as_view(), name='analytics-export'),
]
