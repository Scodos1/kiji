from django.contrib import admin

from .models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'is_active', 'created_at', 'paystack_customer_code']
    list_filter = ['plan', 'is_active']
    search_fields = ['user__email', 'paystack_customer_code']
    readonly_fields = ['created_at']
