from rest_framework import serializers

from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    total_spent = serializers.SerializerMethodField()
    total_purchases = serializers.SerializerMethodField()
    last_purchase = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'phone', 'email', 'total_spent', 'total_purchases',
            'last_purchase', 'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        business = self.context['request'].user.businesses.first()
        phone = attrs.get('phone', self.instance.phone if self.instance else '')
        if not phone:
            return attrs
        qs = Customer.objects.filter(business=business, phone=phone)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                {'phone': 'A customer with this phone number already exists.'}
            )
        return attrs

    def get_total_spent(self, obj):
        annotated = getattr(obj, 'total_spent_sum', None)
        if annotated is not None:
            return float(annotated)
        return sum(float(s.total_amount) for s in obj.sales.all())

    def get_total_purchases(self, obj):
        annotated = getattr(obj, 'sales_count', None)
        return annotated if annotated is not None else obj.sales.count()

    def get_last_purchase(self, obj):
        try:
            return obj.last_sale_ts
        except AttributeError:
            sale = obj.last_sale()
            return sale.sale_date if sale else None

    def get_status(self, obj):
        return obj.status()

    def create(self, validated_data):
        business = self.context['request'].user.businesses.first()
        if business is None:
            raise serializers.ValidationError(
                'No business found. Please complete onboarding first.'
            )
        validated_data['business'] = business
        return super().create(validated_data)
