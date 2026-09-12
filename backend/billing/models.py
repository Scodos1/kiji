from django.conf import settings
from django.db import models


class Plan(models.TextChoices):
    FREE = 'free', 'Free'
    STARTER = 'starter', 'Starter'
    PRO = 'pro', 'Pro'


PLAN_LIMITS = {
    Plan.FREE: 5,
    Plan.STARTER: 50,
    Plan.PRO: 200,
}

PLAN_PRICE_NGN = {
    Plan.FREE: 0,
    Plan.STARTER: 2500,
    Plan.PRO: 7500,
}


class Subscription(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscription')
    plan = models.CharField(max_length=20, choices=Plan.choices, default=Plan.FREE)
    paystack_customer_code = models.CharField(max_length=100, blank=True, default='')
    paystack_subscription_code = models.CharField(max_length=100, blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def limit(self):
        return PLAN_LIMITS.get(self.plan, PLAN_LIMITS[Plan.FREE])

    def __str__(self):
        return f"{self.user.email} — {self.plan}"
