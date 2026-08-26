from django.conf import settings
from django.db import models

CURRENCY_CHOICES = [
    ('NGN', 'Nigerian Naira (₦)'),
    ('USD', 'US Dollar ($)'),
]

BUSINESS_CATEGORIES = [
    ('retail', 'Retail & Online Seller'),
    ('fashion', 'Fashion'),
    ('beauty', 'Beauty / Cosmetics'),
    ('food', 'Food & Restaurants'),
    ('electronics', 'Electronics'),
    ('services', 'Services'),
    ('salon', 'Barber / Salon'),
    ('events', 'Event Planning'),
    ('photography', 'Photography'),
    ('cleaning', 'Cleaning Services'),
    ('repair', 'Repair Services'),
    ('wholesale', 'Wholesale'),
    ('pharmacy', 'Pharmacy'),
    ('other', 'Other'),
]


class Business(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='businesses',
    )
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=BUSINESS_CATEGORIES, default='other')
    location = models.CharField(max_length=200, blank=True)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='NGN')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'businesses'

    def __str__(self):
        return self.name
