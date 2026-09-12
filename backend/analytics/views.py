import csv
import io

from django.http import HttpResponse

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


class ExportView(_AnalyticsBase):
    """GET /api/analytics/export/?period=30d&format=csv — revenue series + overview as CSV."""

    def get(self, request):
        business = self.get_business(request)
        if not business:
            return Response({'error': 'No business found'}, status=400)
        period = self.get_period(request)
        fmt = request.query_params.get('type', request.query_params.get('format', 'csv'))
        if fmt not in ('csv', 'json'):
            return Response({'error': 'type must be csv or json'}, status=400)

        if fmt == 'json':
            return Response({
                'overview': service.overview(business, period),
                'revenue_series': service.revenue_series(business, period),
                'expense_breakdown': service.expense_breakdown(business, period),
            })

        # CSV: daily revenue/expenses/profit
        series = service.revenue_series(business, period)
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=['date', 'revenue', 'expenses', 'profit'])
        writer.writeheader()
        for row in series:
            writer.writerow(row)
        resp = HttpResponse(buf.getvalue(), content_type='text/csv')
        resp['Content-Disposition'] = f'attachment; filename="kiji-export-{period}.csv"'
        return resp
