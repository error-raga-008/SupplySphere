from django.contrib import admin

from core.models import ActivityLog, ApprovalWorkflow, Invoice, Notification, PasswordReset, PurchaseOrder, Quotation, RFQ, Role, SessionRecord, User, Vendor


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
	list_display = ('id', 'name')
	search_fields = ('name',)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
	list_display = ('id', 'email', 'name', 'role', 'phone', 'is_active', 'created_at')
	search_fields = ('email', 'name', 'phone')
	list_filter = ('is_active', 'role')


@admin.register(PasswordReset)
class PasswordResetAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'token', 'expires_at', 'used', 'created_at')
	search_fields = ('token', 'user__email')
	list_filter = ('used',)


@admin.register(SessionRecord)
class SessionRecordAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'is_active', 'expires_at', 'created_at')
	search_fields = ('user__email', 'token')
	list_filter = ('is_active',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'type', 'title', 'is_read', 'created_at')
	search_fields = ('title', 'message', 'user__email')
	list_filter = ('type', 'is_read')


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'action', 'entity_type', 'entity_id', 'created_at')
	search_fields = ('action', 'entity_type', 'entity_id', 'user__email')
	list_filter = ('action', 'entity_type')


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'status', 'created_at')
	search_fields = ('name', 'status')


@admin.register(RFQ)
class RFQAdmin(admin.ModelAdmin):
	list_display = ('rfq_number', 'title', 'status', 'submission_deadline', 'created_at')
	search_fields = ('rfq_number', 'title', 'status')


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
	list_display = ('quote_number', 'vendor', 'total_amount', 'status', 'created_at')
	search_fields = ('quote_number', 'status')


@admin.register(ApprovalWorkflow)
class ApprovalWorkflowAdmin(admin.ModelAdmin):
	list_display = ('id', 'quotation', 'status', 'initiated_at')
	search_fields = ('status',)


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
	list_display = ('po_number', 'vendor', 'total_amount', 'status', 'delivery_date', 'created_at')
	search_fields = ('po_number', 'status')


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
	list_display = ('invoice_number', 'vendor', 'total_amount', 'amount_due', 'due_date', 'status', 'created_at')
	search_fields = ('invoice_number', 'status')
