from rest_framework import serializers

from config.utils import sanitize_text
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'selling_price',
            'cost_price', 'stock_quantity', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        value = sanitize_text(value)
        business = self.context['request'].user.businesses.first()
        qs = Product.objects.filter(business=business, name=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                'You already have a product with this name.'
            )
        return value

    def validate_description(self, value):
        return sanitize_text(value)

    def validate_selling_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Selling price must be greater than 0.')
        return value

    def validate_cost_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Cost price cannot be negative.')
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock quantity cannot be negative.')
        return value

    def validate(self, attrs):
        selling = attrs.get('selling_price', self.instance.selling_price if self.instance else None)
        cost = attrs.get('cost_price', self.instance.cost_price if self.instance else 0)
        if selling is not None and cost > selling:
            raise serializers.ValidationError(
                {'cost_price': 'Cost price should not exceed the selling price.'}
            )
        return attrs

    def create(self, validated_data):
        business = self.context['request'].user.businesses.first()
        if business is None:
            raise serializers.ValidationError(
                'No business found. Please complete onboarding first.'
            )
        validated_data['business'] = business
        return super().create(validated_data)
