from django.db import models

from customers.models import Customer
from products.models import Product
from rest_framework import serializers

from .models import Sale


class SaleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True, default=None)
    customer_name = serializers.CharField(source='customer.name', read_only=True, default=None)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True, default=None)
    unit_price = serializers.DecimalField(max_digits=14, decimal_places=2)
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.none(), required=False, allow_null=True
    )
    customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.none(), required=False, allow_null=True
    )

    class Meta:
        model = Sale
        fields = [
            'id', 'product', 'product_name', 'customer', 'customer_name',
            'customer_phone', 'quantity', 'unit_price', 'total_amount',
            'payment_method', 'sale_date', 'created_at',
        ]
        read_only_fields = ['id', 'total_amount', 'created_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            business = request.user.businesses.first()
            if business:
                self.fields['product'].queryset = Product.objects.filter(business=business)
                self.fields['customer'].queryset = Customer.objects.filter(business=business)

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError('Quantity must be at least 1.')
        return value

    def validate_unit_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Unit price must be greater than 0.')
        return value

    def create(self, validated_data):
        business = self.context['request'].user.businesses.first()
        if business is None:
            raise serializers.ValidationError(
                'No business found. Please complete onboarding first.'
            )
        validated_data['business'] = business
        return super().create(validated_data)
