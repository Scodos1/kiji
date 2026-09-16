from rest_framework import permissions, viewsets

from config.permissions import IsBusinessOwner
from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsBusinessOwner]

    def get_queryset(self):
        business = self.request.user.businesses.first()
        if not business:
            return Product.objects.none()
        return Product.objects.filter(business=business)
