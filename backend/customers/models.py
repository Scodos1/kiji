from django.db import models
from django.db.models import Q


class Customer(models.Model):
    business = models.ForeignKey(
        'businesses.Business',
        on_delete=models.CASCADE,
        related_name='customers',
    )
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=30, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['business', 'phone'],
                name='unique_customer_phone_per_business',
                condition=~Q(phone=''),
            )
        ]

    def __str__(self):
        return self.name

    def last_sale(self):
        return self.sales.order_by('-sale_date').first()

    def status(self):
        from datetime import timedelta
        from django.utils import timezone

        last = self.last_sale()
        if not last:
            return 'inactive'
        days = (timezone.now() - last.sale_date).days
        if days <= 30:
            return 'active'
        if days <= 60:
            return 'at_risk'
        return 'inactive'
