from django.db import models

EXPENSE_CATEGORIES = [
    ('inventory', 'Inventory'),
    ('transportation', 'Transportation'),
    ('marketing', 'Marketing'),
    ('rent', 'Rent'),
    ('salary', 'Salary'),
    ('utilities', 'Utilities'),
    ('packaging', 'Packaging'),
    ('other', 'Other'),
]


class Expense(models.Model):
    business = models.ForeignKey(
        'businesses.Business',
        on_delete=models.CASCADE,
        related_name='expenses',
    )
    category = models.CharField(max_length=50, choices=EXPENSE_CATEGORIES, default='other')
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    description = models.CharField(max_length=300, blank=True)
    expense_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-expense_date', '-created_at']

    def __str__(self):
        return f'{self.get_category_display()}: {self.amount}'
