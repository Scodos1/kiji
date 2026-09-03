from rest_framework import viewsets

from .models import Sale
from .serializers import SaleSerializer


class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer

    def get_queryset(self):
        business = self.request.user.businesses.first()
        if not business:
            return Sale.objects.none()
        qs = Sale.objects.filter(business=business)
        sale_date = self.request.query_params.get('sale_date')
        customer_id = self.request.query_params.get('customer')
        product_id = self.request.query_params.get('product')
        payment_method = self.request.query_params.get('payment_method')
        if sale_date:
            qs = qs.filter(sale_date__date=sale_date)
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        if product_id:
            qs = qs.filter(product_id=product_id)
        if payment_method:
            qs = qs.filter(payment_method=payment_method)
        return qs
