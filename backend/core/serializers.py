from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed

from core.models import ActivityLog, ApprovalWorkflow, Invoice, Notification, PasswordReset, PurchaseOrder, Quotation, RFQ, Role, User


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', read_only=True)
    role_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'role', 'role_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'role']


class AuthUserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role']


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    role_id = serializers.IntegerField()

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_role_id(self, value):
        try:
            Role.objects.get(pk=value)
        except Role.DoesNotExist as exc:
            raise serializers.ValidationError('Invalid role.') from exc
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        role = Role.objects.get(pk=validated_data['role_id'])
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            phone=validated_data.get('phone', ''),
            role=role,
            is_active=True,
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        request = self.context.get('request')
        user = authenticate(request=request, email=attrs['email'], password=attrs['password'])
        if not user:
            raise AuthenticationFailed('Invalid credentials')
        attrs['user'] = user
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
        validate_password(value)
        return value


class PasswordResetSerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordReset
        fields = ['id', 'user', 'token', 'expires_at', 'used', 'created_at']
        read_only_fields = ['id', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'type', 'title', 'message', 'is_read', 'link', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']


class DashboardSummarySerializer(serializers.Serializer):
    active_rfqs = serializers.IntegerField()
    pending_approvals = serializers.IntegerField()
    total_vendors = serializers.IntegerField()
    active_purchase_orders = serializers.IntegerField()
    open_invoices = serializers.IntegerField()
    monthly_spend = serializers.DecimalField(max_digits=18, decimal_places=2)


class RecentRFQSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()

    class Meta:
        model = RFQ
        fields = ['rfq_number', 'title', 'status', 'submission_deadline', 'created_by']

    def get_created_by(self, obj):
        if obj.created_by_id and obj.created_by:
            return obj.created_by.name
        return None


class RecentQuotationSerializer(serializers.ModelSerializer):
    vendor = serializers.SerializerMethodField()

    class Meta:
        model = Quotation
        fields = ['quote_number', 'vendor', 'total_amount', 'status']

    def get_vendor(self, obj):
        if obj.vendor_id and obj.vendor:
            return obj.vendor.name
        return None


class PendingApprovalSerializer(serializers.ModelSerializer):
    workflow_id = serializers.IntegerField(source='id', read_only=True)
    quotation = serializers.SerializerMethodField()

    class Meta:
        model = ApprovalWorkflow
        fields = ['workflow_id', 'quotation', 'status', 'initiated_at']

    def get_quotation(self, obj):
        if obj.quotation_id and obj.quotation:
            return obj.quotation.quote_number
        return None


class RecentPurchaseOrderSerializer(serializers.ModelSerializer):
    vendor = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = ['po_number', 'vendor', 'total_amount', 'status', 'delivery_date']

    def get_vendor(self, obj):
        if obj.vendor_id and obj.vendor:
            return obj.vendor.name
        return None


class RecentInvoiceSerializer(serializers.ModelSerializer):
    vendor = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = ['invoice_number', 'vendor', 'total_amount', 'amount_due', 'due_date', 'status']

    def get_vendor(self, obj):
        if obj.vendor_id and obj.vendor:
            return obj.vendor.name
        return None


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'phone']


class ActivityLogSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'username',
            'role',
            'action',
            'entity_type',
            'entity_id',
            'old_values',
            'new_values',
            'ip_address',
            'created_at',
        ]

    def get_username(self, obj):
        if obj.user_id and obj.user:
            return obj.user.name
        return None

    def get_role(self, obj):
        if obj.user_id and obj.user and obj.user.role_id and obj.user.role:
            return obj.user.role.name
        return None


class RecentActivityLogSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['username', 'action', 'timestamp']

    def get_username(self, obj):
        if obj.user_id and obj.user:
            return obj.user.name
        return None