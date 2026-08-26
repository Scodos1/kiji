import logging

from django.db import IntegrityError
from rest_framework.views import exception_handler

logger = logging.getLogger('kiji')


def custom_exception_handler(exc, context):
    """Return consistent JSON errors and log unhandled exceptions."""
    if isinstance(exc, IntegrityError):
        exc = _integrity_validation_error(exc)

    response = exception_handler(exc, context)

    if response is None:
        logger.exception(
            'Unhandled exception in %s', context.get('view').__class__.__name__,
            exc_info=exc,
        )
        from rest_framework import status
        from rest_framework.response import Response

        return Response(
            {'detail': 'An unexpected error occurred. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if response.status_code >= 500:
        logger.error(
            'Server error %s in %s',
            response.status_code,
            context.get('view').__class__.__name__,
        )

    return response


def _integrity_validation_error(exc):
    from rest_framework import serializers

    message = str(exc).lower()
    if 'unique_customer_phone_per_business' in message:
        return serializers.ValidationError(
            {'phone': 'A customer with this phone number already exists.'}
        )
    if 'unique_product_per_business' in message:
        return serializers.ValidationError(
            {'name': 'You already have a product with this name.'}
        )
    return serializers.ValidationError(
        {'detail': 'The record conflicts with existing data.'}
    )
