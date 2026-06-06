from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['email', 'first_name', 'last_name', 'phone', 'role', 'password', 'confirm_password']

    def validate(self, data):
        if data['password'] != data.pop('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds user payload to JWT token response."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            # Return success even if user not found (security best practice)
            pass
        return value
