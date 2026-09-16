from rest_framework import serializers

from config.utils import sanitize_text
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'category', 'category_display', 'amount',
            'description', 'expense_date', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_description(self, value):
        return sanitize_text(value)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than 0.')
        return value

    def create(self, validated_data):
        business = self.context['request'].user.businesses.first()
        if business is None:
            raise serializers.ValidationError(
                'No business found. Please complete onboarding first.'
            )
        validated_data['business'] = business
        return super().create(validated_data)
