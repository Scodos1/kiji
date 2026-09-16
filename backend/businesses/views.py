from rest_framework import mixins, permissions, viewsets

from config.permissions import IsBusinessOwner
from .models import Business
from .serializers import BusinessSerializer


class BusinessViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = BusinessSerializer
    permission_classes = [permissions.IsAuthenticated, IsBusinessOwner]

    def get_queryset(self):
        return Business.objects.filter(owner=self.request.user)
