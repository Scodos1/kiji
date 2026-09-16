from rest_framework.permissions import BasePermission


class IsBusinessOwner(BasePermission):
    """Ensure the requesting user owns the business referenced by the object.

    Works with any model that has a ``business`` FK pointing to
    ``businesses.Business``, or a ``businesses`` reverse relation on User.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user_businesses = set(
            request.user.businesses.values_list('pk', flat=True)
        )

        if hasattr(obj, 'business_id') and obj.business_id is not None:
            return obj.business_id in user_businesses

        if hasattr(obj, 'business') and obj.business is not None:
            return obj.business_id in user_businesses

        if hasattr(obj, 'owner_id'):
            return obj.owner_id == request.user.pk

        return False
