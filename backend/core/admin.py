from django.contrib import admin

from core.models import (
    ActivityLog, ApprovalStep, ApprovalWorkflow,
    Invoice, Notification, PasswordReset,
    PurchaseOrder, Quotation, QuotationItem,
    RFQ, RFQItem, Role, SessionRecord,
    User, Vendor, VendorCategory,
)


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
    list_display = ('id', 'user', 'action', 'entity_type', 'entity_id', 'ip_address', 'created_at')
    search_fields = ('action', 'entity_type', 'entity_id', 'user__email')
    list_filter = ('action', 'entity_type')


@admin.register(VendorCategory)
class VendorCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'email', 'city', 'status', 'rating', 'created_at')
    search_fields = ('name', 'email', 'gst_number')
    list_filter = ('status', 'category')


@admin.register(RFQ)
class RFQAdmin(admin.ModelAdmin):
    list_display = ('id', 'rfq_number', 'title', 'status', 'submission_deadline', 'created_by', 'created_at')
    search_fields = ('rfq_number', 'title')
    list_filter = ('status',)


@admin.register(RFQItem)
class RFQItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'rfq', 'item_name', 'quantity', 'unit', 'estimated_price')
    search_fields = ('item_name', 'rfq__rfq_number')


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ('id', 'quote_number', 'rfq', 'vendor', 'total_amount', 'status', 'submitted_at', 'created_at')
    search_fields = ('quote_number', 'vendor__name')
    list_filter = ('status',)


@admin.register(QuotationItem)
class QuotationItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'quotation', 'rfq_item', 'unit_price', 'quantity', 'line_total')


@admin.register(ApprovalWorkflow)
class ApprovalWorkflowAdmin(admin.ModelAdmin):
    list_display = ('id', 'quotation', 'initiated_by', 'status', 'initiated_at', 'resolved_at')
    search_fields = ('quotation__quote_number',)
    list_filter = ('status',)


@admin.register(ApprovalStep)
class ApprovalStepAdmin(admin.ModelAdmin):
    list_display = ('id', 'workflow', 'approver', 'step_order', 'status', 'acted_at')
    list_filter = ('status',)


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'po_number', 'vendor', 'total_amount', 'status', 'delivery_date', 'created_at')
    search_fields = ('po_number', 'vendor__name')
    list_filter = ('status',)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'invoice_number', 'vendor', 'total_amount', 'amount_due', 'due_date', 'status', 'created_at')
    search_fields = ('invoice_number', 'vendor__name')
    list_filter = ('status',)
