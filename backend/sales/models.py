from decimal import Decimal

from django.db import models

PAYMENT_METHODS = [
    ('cash', 'Cash'),
    ('transfer', 'Transfer'),
    ('pos', 'POS'),
    ('other', 'Other'),
]


class Sale(models.Model):
    business = models.ForeignKey(
        'businesses.Business',
        on_delete=models.CASCADE,
        related_name='sales',
    )
    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sales',
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sales',
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=14, decimal_places=2)
    cost_price = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        help_text='Snapshot of the product cost at time of sale.',
    )
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, editable=False)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='cash')
    sale_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sale_date', '-created_at']

    def save(self, *args, **kwargs):
        self.total_amount = Decimal(self.quantity) * Decimal(self.unit_price)
        if self.cost_price == 0 and self.product_id:
            self.cost_price = self.product.cost_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.product.name if self.product else "Sale"} x{self.quantity}'
