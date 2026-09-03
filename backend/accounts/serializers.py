from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Your current password is incorrect.')
        return value

    def validate_new_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError

        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(source='first_name', write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'password']

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError

        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def validate(self, attrs):
        attrs.pop('username', None)
        if 'email' not in attrs:
            raise serializers.ValidationError({'email': 'Email is required.'})
        return attrs

    def create(self, validated_data):
        name = validated_data.get('first_name', '')
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        user = User.objects.create_user(
            email=email,
            password=password,
            # Use the full email as the username: deriving it from the local
            # part (alice@gmail.com -> 'alice') collides across domains and
            # raises an IntegrityError (HTTP 500).
            username=email[:150],
            first_name=name,
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', read_only=True)
    businesses = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'businesses']

    def get_businesses(self, obj):
        from businesses.serializers import BusinessSerializer

        return BusinessSerializer(obj.businesses.all(), many=True).data
