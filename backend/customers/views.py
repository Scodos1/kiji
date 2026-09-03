from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, DecimalField, Max, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import viewsets

from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer

    def get_queryset(self):
        business = self.request.user.businesses.first()
        if not business:
            return Customer.objects.none()
        # Annotate aggregates once so listing doesn't run 3 extra queries
        # per customer row (N+1).
        qs = (
            Customer.objects.filter(business=business)
            .annotate(
                last_sale_ts=Max('sales__sale_date'),
                total_spent_sum=Coalesce(
                    Sum('sales__total_amount'),
                    Value(
                        Decimal('0'),
                        output_field=DecimalField(max_digits=14, decimal_places=2),
                    ),
                ),
                sales_count=Count('sales'),
            )
        )
        search = self.request.query_params.get('search')
        status = self.request.query_params.get('status')
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(phone__icontains=search)
        if status:
            now = timezone.now()
            cutoff_active = now - timedelta(days=30)
            cutoff_risk = now - timedelta(days=60)
            if status == 'active':
                qs = qs.filter(last_sale_ts__gte=cutoff_active)
            elif status == 'at_risk':
                qs = qs.filter(last_sale_ts__gte=cutoff_risk, last_sale_ts__lt=cutoff_active)
            elif status == 'inactive':
                qs = qs.filter(Q(last_sale_ts__isnull=True) | Q(last_sale_ts__lt=cutoff_risk))
        return qs
