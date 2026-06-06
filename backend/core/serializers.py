from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers

from core.models import (
    ActivityLog, ApprovalStep, ApprovalWorkflow,
    Invoice, Notification, PasswordReset,
    PurchaseOrder, Quotation, QuotationItem,
    RFQ, RFQItem, Role, User,
    Vendor, VendorCategory,
)


# ── Auth ──────────────────────────────────────────────────────────────────

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
            raise serializers.ValidationError('Invalid email or password.')
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


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'phone']


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password     = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user


# ── Dashboard ─────────────────────────────────────────────────────────────

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
        fields = ['id', 'rfq_number', 'title', 'status', 'submission_deadline', 'created_by', 'created_at']

    def get_created_by(self, obj):
        if obj.created_by_id and obj.created_by:
            return obj.created_by.name
        return None


class RecentQuotationSerializer(serializers.ModelSerializer):
    vendor = serializers.SerializerMethodField()

    class Meta:
        model = Quotation
        fields = ['id', 'quote_number', 'vendor', 'total_amount', 'status', 'created_at']

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
        fields = ['id', 'po_number', 'vendor', 'total_amount', 'status', 'delivery_date', 'created_at']

    def get_vendor(self, obj):
        if obj.vendor_id and obj.vendor:
            return obj.vendor.name
        return None


class RecentInvoiceSerializer(serializers.ModelSerializer):
    vendor = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'vendor', 'total_amount', 'amount_due', 'due_date', 'status', 'created_at']

    def get_vendor(self, obj):
        if obj.vendor_id and obj.vendor:
            return obj.vendor.name
        return None


# ── Vendor ────────────────────────────────────────────────────────────────

class VendorCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorCategory
        fields = ['id', 'name', 'description']


class VendorListSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name', read_only=True, default=None)

    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'category', 'category_id',
            'contact_person', 'email', 'phone',
            'city', 'state', 'status', 'rating', 'created_at',
        ]


class VendorSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)

    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'category_id', 'category_name',
            'contact_person', 'email', 'phone',
            'address', 'city', 'state', 'country', 'pincode',
            'gst_number', 'pan_number',
            'bank_name', 'bank_account_no', 'bank_ifsc',
            'status', 'rating', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'category_name']

    def validate_email(self, value):
        qs = Vendor.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('A vendor with this email already exists.')
        return value

    def validate_status(self, value):
        valid = ['active', 'inactive', 'blacklisted']
        if value not in valid:
            raise serializers.ValidationError(f'Status must be one of: {", ".join(valid)}.')
        return value

    def validate_gst_number(self, value):
        if value and len(value) != 15:
            raise serializers.ValidationError('GST number must be exactly 15 characters.')
        return value

    def validate_pan_number(self, value):
        if value and len(value) != 10:
            raise serializers.ValidationError('PAN number must be exactly 10 characters.')
        return value

    def validate_rating(self, value):
        if value is not None and not (0 <= float(value) <= 5):
            raise serializers.ValidationError('Rating must be between 0 and 5.')
        return value


# ── RFQ ───────────────────────────────────────────────────────────────────

class RFQItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = RFQItem
        fields = ['id', 'item_name', 'description', 'quantity', 'unit', 'estimated_price']


class RFQListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True, default=None)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = RFQ
        fields = [
            'id', 'rfq_number', 'title', 'status',
            'submission_deadline', 'created_by_name', 'items_count', 'created_at',
        ]

    def get_items_count(self, obj):
        return obj.items.count()


class RFQSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True, default=None)
    items = RFQItemSerializer(many=True, read_only=True)

    class Meta:
        model = RFQ
        fields = [
            'id', 'rfq_number', 'title', 'description', 'status',
            'submission_deadline', 'created_by', 'created_by_name',
            'items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'rfq_number', 'created_by', 'created_by_name', 'created_at', 'updated_at']


class RFQCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(allow_blank=True, required=False)
    submission_deadline = serializers.DateTimeField()
    items = RFQItemSerializer(many=True)

    def validate_submission_deadline(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError('Submission deadline must be in the future.')
        return value

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('At least one item is required.')
        return value

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError('Title must be at least 3 characters.')
        return value.strip()


# ── Quotation ─────────────────────────────────────────────────────────────

class QuotationItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='rfq_item.item_name', read_only=True)

    class Meta:
        model = QuotationItem
        fields = ['id', 'rfq_item_id', 'item_name', 'unit_price', 'quantity', 'discount_pct', 'tax_pct', 'line_total']


class QuotationListSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True, default=None)
    rfq_number = serializers.CharField(source='rfq.rfq_number', read_only=True, default=None)
    rfq_title = serializers.CharField(source='rfq.title', read_only=True, default=None)

    class Meta:
        model = Quotation
        fields = [
            'id', 'quote_number', 'rfq_id', 'rfq_number', 'rfq_title',
            'vendor_id', 'vendor_name', 'total_amount', 'status',
            'delivery_days', 'submitted_at', 'created_at',
        ]


class QuotationSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True, default=None)
    rfq_number = serializers.CharField(source='rfq.rfq_number', read_only=True, default=None)
    rfq_title = serializers.CharField(source='rfq.title', read_only=True, default=None)
    items = QuotationItemSerializer(many=True, read_only=True)

    class Meta:
        model = Quotation
        fields = [
            'id', 'quote_number', 'rfq_id', 'rfq_number', 'rfq_title',
            'vendor_id', 'vendor_name',
            'status', 'delivery_days', 'validity_date', 'notes',
            'total_amount', 'submitted_at', 'items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'quote_number', 'created_at', 'updated_at', 'submitted_at']


class QuotationCreateSerializer(serializers.Serializer):
    rfq_id = serializers.IntegerField()
    vendor_id = serializers.IntegerField()
    delivery_days = serializers.IntegerField(required=False, min_value=1)
    validity_date = serializers.DateField(required=False)
    notes = serializers.CharField(allow_blank=True, required=False)
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
    )

    def validate_rfq_id(self, value):
        try:
            rfq = RFQ.objects.get(pk=value)
            if rfq.status not in ['published', 'draft']:
                raise serializers.ValidationError('RFQ is not accepting quotations.')
        except RFQ.DoesNotExist:
            raise serializers.ValidationError('RFQ not found.')
        return value

    def validate_vendor_id(self, value):
        if not Vendor.objects.filter(pk=value, status='active').exists():
            raise serializers.ValidationError('Vendor not found or not active.')
        return value


# ── Approval ──────────────────────────────────────────────────────────────

class ApprovalStepSerializer(serializers.ModelSerializer):
    approver_name = serializers.CharField(source='approver.name', read_only=True)

    class Meta:
        model = ApprovalStep
        fields = ['id', 'approver_id', 'approver_name', 'step_order', 'status', 'remarks', 'acted_at']


class ApprovalWorkflowSerializer(serializers.ModelSerializer):
    initiated_by_name = serializers.CharField(source='initiated_by.name', read_only=True, default=None)
    quotation_number = serializers.CharField(source='quotation.quote_number', read_only=True, default=None)
    rfq_title = serializers.SerializerMethodField()
    vendor_name = serializers.SerializerMethodField()
    total_amount = serializers.DecimalField(source='quotation.total_amount', max_digits=16, decimal_places=2, read_only=True, default=0)
    steps = ApprovalStepSerializer(many=True, read_only=True)

    class Meta:
        model = ApprovalWorkflow
        fields = [
            'id', 'quotation_id', 'quotation_number', 'rfq_title', 'vendor_name',
            'total_amount', 'initiated_by_name', 'status',
            'initiated_at', 'resolved_at', 'steps',
        ]

    def get_rfq_title(self, obj):
        try:
            return obj.quotation.rfq.title
        except Exception:
            return None

    def get_vendor_name(self, obj):
        try:
            return obj.quotation.vendor.name
        except Exception:
            return None


class ApprovalActionSerializer(serializers.Serializer):
    remarks = serializers.CharField(allow_blank=True, required=False)


# ── Purchase Order ────────────────────────────────────────────────────────

class PurchaseOrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True, default=None)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True, default=None)
    quotation_number = serializers.CharField(source='quotation.quote_number', read_only=True, default=None)

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'po_number', 'quotation_id', 'quotation_number',
            'vendor_id', 'vendor_name',
            'created_by_name', 'status',
            'delivery_date', 'billing_address', 'shipping_address', 'terms_conditions',
            'subtotal', 'tax_amount', 'discount_amount', 'total_amount',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'po_number', 'created_at', 'updated_at']


class POCreateSerializer(serializers.Serializer):
    quotation_id = serializers.IntegerField()
    delivery_date = serializers.DateField(required=False)
    billing_address = serializers.CharField(allow_blank=True, required=False)
    shipping_address = serializers.CharField(allow_blank=True, required=False)
    terms_conditions = serializers.CharField(allow_blank=True, required=False)

    def validate_quotation_id(self, value):
        try:
            q = Quotation.objects.select_related('approval_workflow').get(pk=value)
        except Quotation.DoesNotExist:
            raise serializers.ValidationError('Quotation not found.')
        if q.status not in ['submitted', 'accepted']:
            raise serializers.ValidationError('Quotation must be submitted or accepted to generate a PO.')
        if PurchaseOrder.objects.filter(quotation_id=value).exists():
            raise serializers.ValidationError('A PO already exists for this quotation.')
        return value


# ── Invoice ───────────────────────────────────────────────────────────────

class InvoiceSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True, default=None)
    po_number = serializers.CharField(source='po.po_number', read_only=True, default=None)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True, default=None)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'po_id', 'po_number',
            'vendor_id', 'vendor_name', 'created_by_name', 'status',
            'issue_date', 'due_date',
            'subtotal', 'cgst_amount', 'sgst_amount', 'igst_amount',
            'discount_amount', 'total_amount', 'amount_paid', 'amount_due',
            'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'invoice_number', 'amount_due', 'created_at', 'updated_at']


class InvoiceCreateSerializer(serializers.Serializer):
    po_id = serializers.IntegerField()
    issue_date = serializers.DateField()
    due_date = serializers.DateField()
    subtotal = serializers.DecimalField(max_digits=16, decimal_places=2)
    cgst_amount = serializers.DecimalField(max_digits=16, decimal_places=2, default=0)
    sgst_amount = serializers.DecimalField(max_digits=16, decimal_places=2, default=0)
    igst_amount = serializers.DecimalField(max_digits=16, decimal_places=2, default=0)
    discount_amount = serializers.DecimalField(max_digits=16, decimal_places=2, default=0)
    notes = serializers.CharField(allow_blank=True, required=False)

    def validate_po_id(self, value):
        if not PurchaseOrder.objects.filter(pk=value).exists():
            raise serializers.ValidationError('Purchase Order not found.')
        return value

    def validate(self, attrs):
        if attrs.get('due_date') and attrs.get('issue_date'):
            if attrs['due_date'] < attrs['issue_date']:
                raise serializers.ValidationError({'due_date': 'Due date must be on or after issue date.'})
        return attrs


# ── Activity Log ──────────────────────────────────────────────────────────

class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True, default=None)
    user_email = serializers.CharField(source='user.email', read_only=True, default=None)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user_id', 'user_name', 'user_email',
            'action', 'entity_type', 'entity_id',
            'old_values', 'new_values', 'ip_address', 'created_at',
        ]
