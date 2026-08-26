from .models import Business


def get_current_business(user):
    """Return the user's active business (first one for V1)."""
    return user.businesses.first()
