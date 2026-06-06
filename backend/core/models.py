from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models


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


class Vendor(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
	name = models.CharField(max_length=255, db_column='company_name')
	status = models.CharField(max_length=50)
	created_at = models.DateTimeField()

	class Meta:
		managed = False
		db_table = 'vendors'
		ordering = ['-created_at']


class RFQ(models.Model):
	rfq_number = models.CharField(max_length=100)
	title = models.CharField(max_length=255)
	status = models.CharField(max_length=50)
	submission_deadline = models.DateTimeField(null=True, blank=True)
	created_by = models.ForeignKey(settings.AUTH_USER_MODEL, db_column='created_by', on_delete=models.DO_NOTHING, null=True, blank=True, related_name='+')
	created_at = models.DateTimeField()

	class Meta:
		managed = False
		db_table = 'rfqs'
		ordering = ['-created_at']


class Quotation(models.Model):
	quote_number = models.CharField(max_length=100)
	vendor = models.ForeignKey(Vendor, db_column='vendor_id', on_delete=models.DO_NOTHING, null=True, blank=True, related_name='+')
	total_amount = models.DecimalField(max_digits=18, decimal_places=2, default=0)
	status = models.CharField(max_length=50)
	created_at = models.DateTimeField()

	class Meta:
		managed = False
		db_table = 'quotations'
		ordering = ['-created_at']


class ApprovalWorkflow(models.Model):
	quotation = models.ForeignKey(Quotation, db_column='quotation_id', on_delete=models.DO_NOTHING, null=True, blank=True, related_name='+')
	status = models.CharField(max_length=50)
	initiated_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		managed = False
		db_table = 'approval_workflows'
		ordering = ['-initiated_at']


class PurchaseOrder(models.Model):
	po_number = models.CharField(max_length=100)
	vendor = models.ForeignKey(Vendor, db_column='vendor_id', on_delete=models.DO_NOTHING, null=True, blank=True, related_name='+')
	total_amount = models.DecimalField(max_digits=18, decimal_places=2, default=0)
	status = models.CharField(max_length=50)
	delivery_date = models.DateTimeField(null=True, blank=True)
	created_at = models.DateTimeField()

	class Meta:
		managed = False
		db_table = 'purchase_orders'
		ordering = ['-created_at']


class Invoice(models.Model):
	invoice_number = models.CharField(max_length=100)
	vendor = models.ForeignKey(Vendor, db_column='vendor_id', on_delete=models.DO_NOTHING, null=True, blank=True, related_name='+')
	total_amount = models.DecimalField(max_digits=18, decimal_places=2, default=0)
	amount_due = models.DecimalField(max_digits=18, decimal_places=2, default=0)
	due_date = models.DateTimeField(null=True, blank=True)
	status = models.CharField(max_length=50)
	created_at = models.DateTimeField()

	class Meta:
		managed = False
		db_table = 'invoices'
		ordering = ['-created_at']
