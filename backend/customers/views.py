from datetime import timedelta

from django.db.models import OuterRef, Q, Subquery
from django.utils import timezone
from rest_framework import viewsets

from sales.models import Sale

from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer

    def get_queryset(self):
        business = self.request.user.businesses.first()
        if not business:
            return Customer.objects.none()
        qs = Customer.objects.filter(business=business)
        search = self.request.query_params.get('search')
        status = self.request.query_params.get('status')
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(phone__icontains=search)
        if status:
            last = Sale.objects.filter(customer=OuterRef('pk')).order_by('-sale_date')
            qs = qs.annotate(last_sale_ts=Subquery(last.values('sale_date')[:1]))
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

    def perform_create(self, serializer):
        business = self.request.user.businesses.first()
        serializer.save(business=business)
