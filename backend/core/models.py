from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models


# ── Managed models (Django creates / migrates these) ──────────────────────

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'roles'
        ordering = ['id']

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The email field must be set.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_active', True)
        role, _ = Role.objects.get_or_create(name='admin')
        extra_fields.setdefault('role', role)
        return self.create_user(email=email, password=password, **extra_fields)


class User(AbstractBaseUser):
    role = models.ForeignKey(Role, db_column='role_id', on_delete=models.PROTECT, related_name='users')
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128, db_column='password_hash')
    phone = models.CharField(max_length=32, blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    last_login = None

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'
        ordering = ['id']

    @property
    def password_hash(self):
        return self.password

    @password_hash.setter
    def password_hash(self, value):
        self.password = value

    def __str__(self):
        return self.email


class PasswordReset(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=models.CASCADE, related_name='password_resets')
    token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'password_resets'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user_id}:{self.token}'


class SessionRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=models.CASCADE, related_name='auth_sessions')
    token = models.CharField(max_length=512, unique=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sessions'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user_id}:{self.token[:16]}'


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ActivityLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=models.SET_NULL, null=True, blank=True, related_name='activity_logs')
    action = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=100, blank=True, default='')
    entity_id = models.CharField(max_length=64, blank=True, default='')
    old_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'
        ordering = ['-created_at']

    def __str__(self):
        return self.action


# ── Non-managed models (tables created by vendor_tables.sql) ─────────────

class VendorCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'vendor_categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Vendor(models.Model):
    STATUS_ACTIVE = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_BLACKLISTED = 'blacklisted'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, db_column='user_id',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='vendor_profiles',
    )
    category = models.ForeignKey(
        VendorCategory, db_column='category_id',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='vendors',
    )
    name = models.CharField(max_length=200, db_column='company_name')
    contact_person = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, default='India')
    pincode = models.CharField(max_length=20, blank=True, null=True)
    gst_number = models.CharField(max_length=20, blank=True, null=True)
    pan_number = models.CharField(max_length=20, blank=True, null=True)
    bank_name = models.CharField(max_length=150, blank=True, null=True)
    bank_account_no = models.CharField(max_length=50, blank=True, null=True)
    bank_ifsc = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=20, default='active')
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'vendors'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class RFQ(models.Model):
    rfq_number = models.CharField(max_length=30, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, db_column='created_by',
        on_delete=models.DO_NOTHING, null=True, blank=True,
        related_name='created_rfqs',
    )
    status = models.CharField(max_length=20, default='draft')
    submission_deadline = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'rfqs'
        ordering = ['-created_at']

    def __str__(self):
        return self.rfq_number


class RFQItem(models.Model):
    rfq = models.ForeignKey(RFQ, db_column='rfq_id', on_delete=models.CASCADE, related_name='items')
    item_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit = models.CharField(max_length=50, blank=True, null=True)
    estimated_price = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'rfq_items'

    def __str__(self):
        return self.item_name


class Quotation(models.Model):
    rfq = models.ForeignKey(RFQ, db_column='rfq_id', on_delete=models.CASCADE, related_name='quotations')
    vendor = models.ForeignKey(Vendor, db_column='vendor_id', on_delete=models.DO_NOTHING, related_name='quotations')
    quote_number = models.CharField(max_length=30, unique=True)
    status = models.CharField(max_length=20, default='draft')
    delivery_days = models.PositiveSmallIntegerField(null=True, blank=True)
    validity_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    total_amount = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'quotations'
        ordering = ['-created_at']

    def __str__(self):
        return self.quote_number


class QuotationItem(models.Model):
    quotation = models.ForeignKey(Quotation, db_column='quotation_id', on_delete=models.CASCADE, related_name='items')
    rfq_item = models.ForeignKey(RFQItem, db_column='rfq_item_id', on_delete=models.CASCADE, related_name='+')
    unit_price = models.DecimalField(max_digits=14, decimal_places=2)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    discount_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=16, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'quotation_items'


class ApprovalWorkflow(models.Model):
    quotation = models.OneToOneField(
        Quotation, db_column='quotation_id', on_delete=models.CASCADE,
        related_name='approval_workflow',
    )
    initiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, db_column='initiated_by',
        on_delete=models.DO_NOTHING, related_name='initiated_approvals',
    )
    status = models.CharField(max_length=20, default='pending')
    initiated_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'approval_workflows'
        ordering = ['-initiated_at']

    def __str__(self):
        return f'AW-{self.pk}'


class ApprovalStep(models.Model):
    workflow = models.ForeignKey(ApprovalWorkflow, db_column='workflow_id', on_delete=models.CASCADE, related_name='steps')
    approver = models.ForeignKey(
        settings.AUTH_USER_MODEL, db_column='approver_id',
        on_delete=models.DO_NOTHING, related_name='approval_steps',
    )
    step_order = models.PositiveSmallIntegerField(default=1)
    status = models.CharField(max_length=20, default='pending')
    remarks = models.TextField(blank=True, null=True)
    acted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'approval_steps'
        ordering = ['step_order']


class PurchaseOrder(models.Model):
    po_number = models.CharField(max_length=30, unique=True)
    quotation = models.OneToOneField(
        Quotation, db_column='quotation_id', on_delete=models.DO_NOTHING,
        related_name='purchase_order', null=True, blank=True,
    )
    vendor = models.ForeignKey(Vendor, db_column='vendor_id', on_delete=models.DO_NOTHING, related_name='purchase_orders')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, db_column='created_by',
        on_delete=models.DO_NOTHING, related_name='created_pos',
    )
    status = models.CharField(max_length=20, default='draft')
    delivery_date = models.DateField(null=True, blank=True)
    billing_address = models.TextField(blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
    terms_conditions = models.TextField(blank=True, null=True)
    subtotal = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'purchase_orders'
        ordering = ['-created_at']

    def __str__(self):
        return self.po_number


class Invoice(models.Model):
    invoice_number = models.CharField(max_length=30, unique=True)
    po = models.ForeignKey(PurchaseOrder, db_column='po_id', on_delete=models.DO_NOTHING, related_name='invoices')
    vendor = models.ForeignKey(Vendor, db_column='vendor_id', on_delete=models.DO_NOTHING, related_name='invoices')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, db_column='created_by',
        on_delete=models.DO_NOTHING, related_name='created_invoices',
    )
    status = models.CharField(max_length=20, default='draft')
    issue_date = models.DateField()
    due_date = models.DateField()
    subtotal = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    cgst_amount = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    sgst_amount = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    igst_amount = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    amount_due = models.GeneratedField(
        expression=models.F('total_amount') - models.F('amount_paid'),
        output_field=models.DecimalField(max_digits=16, decimal_places=2),
        db_persist=True,
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'invoices'
        ordering = ['-created_at']

    def __str__(self):
        return self.invoice_number
