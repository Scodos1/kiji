from rest_framework import viewsets

from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        business = self.request.user.businesses.first()
        if not business:
            return Product.objects.none()
        return Product.objects.filter(business=business)
