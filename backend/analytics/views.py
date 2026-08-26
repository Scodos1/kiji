from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from . import service


class _AnalyticsBase(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_business(self, request):
        return request.user.businesses.first()

    def get_period(self, request):
        return request.query_params.get('period', '30d')


class OverviewView(_AnalyticsBase):
    def get(self, request):
        business = self.get_business(request)
        if not business:
            return Response({'error': 'No business found'}, status=400)
        return Response(service.overview(business, self.get_period(request)))


class RevenueSeriesView(_AnalyticsBase):
    def get(self, request):
        business = self.get_business(request)
        if not business:
            return Response({'error': 'No business found'}, status=400)
        return Response(service.revenue_series(business, self.get_period(request)))


class ExpenseBreakdownView(_AnalyticsBase):
    def get(self, request):
        business = self.get_business(request)
        if not business:
            return Response({'error': 'No business found'}, status=400)
        return Response(service.expense_breakdown(business, self.get_period(request)))


class ProductPerformanceView(_AnalyticsBase):
    def get(self, request):
        business = self.get_business(request)
        if not business:
            return Response({'error': 'No business found'}, status=400)
        return Response(service.product_performance(business, self.get_period(request)))


class CustomerSegmentsView(_AnalyticsBase):
    def get(self, request):
        business = self.get_business(request)
        if not business:
            return Response({'error': 'No business found'}, status=400)
        return Response(service.customer_segments(business))
