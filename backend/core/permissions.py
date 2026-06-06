from rest_framework.permissions import BasePermission

# Phase 1 — Centralized role → permission mapping
ROLE_PERMISSIONS = {
    'admin': [
        'manage_users', 'manage_roles', 'manage_vendors',
        'create_rfq', 'edit_rfq', 'delete_rfq', 'view_rfq',
        'submit_quote', 'approve_quote', 'reject_quote',
        'create_po', 'approve_po',
        'view_invoices', 'manage_notifications',
        'view_dashboard', 'system_admin',
    ],
    'manager': [
        'approve_quote', 'reject_quote', 'approve_po',
        'view_dashboard', 'view_rfq', 'view_invoices',
    ],
    'procurement_officer': [
        'create_rfq', 'edit_rfq', 'delete_rfq', 'view_rfq',
        'create_po', 'view_dashboard', 'manage_vendors',
    ],
    'vendor': [
        'submit_quote', 'view_rfq', 'view_dashboard',
    ],
}


def get_role_permissions(role_name):
    return ROLE_PERMISSIONS.get(role_name, [])


# Phase 3 — Generic base permission class
class HasRolePermission(BasePermission):
    required_permission = None
    message = 'You do not have permission to perform this action.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user.role, 'name', None)
        return bool(self.required_permission and self.required_permission in get_role_permissions(role))


# Phase 4 — Specific permission classes
class CanManageUsers(HasRolePermission):
    required_permission = 'manage_users'


class CanManageRoles(HasRolePermission):
    required_permission = 'manage_roles'


class CanManageVendors(HasRolePermission):
    required_permission = 'manage_vendors'


class CanCreateRFQ(HasRolePermission):
    required_permission = 'create_rfq'


class CanEditRFQ(HasRolePermission):
    required_permission = 'edit_rfq'


class CanDeleteRFQ(HasRolePermission):
    required_permission = 'delete_rfq'


class CanViewRFQ(HasRolePermission):
    required_permission = 'view_rfq'


class CanSubmitQuote(HasRolePermission):
    required_permission = 'submit_quote'


class CanApproveQuote(HasRolePermission):
    required_permission = 'approve_quote'


class CanRejectQuote(HasRolePermission):
    required_permission = 'reject_quote'


class CanCreatePO(HasRolePermission):
    required_permission = 'create_po'


class CanApprovePO(HasRolePermission):
    required_permission = 'approve_po'


class CanViewInvoices(HasRolePermission):
    required_permission = 'view_invoices'


class CanManageNotifications(HasRolePermission):
    required_permission = 'manage_notifications'


class CanViewDashboard(HasRolePermission):
    required_permission = 'view_dashboard'


class IsAdmin(HasRolePermission):
    required_permission = 'system_admin'


# Phase 6 — Object-level security
class IsOwnerOrAdmin(BasePermission):
    """
    Admin: unrestricted.
    Vendor: own records only (obj.user_id must match request.user.id).
    Other roles: view-level permissions enforce constraints; object access allowed.
    """
    message = 'You do not have permission to access this resource.'

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user.role, 'name', None)
        if role == 'admin':
            return True
        if role == 'vendor':
            owner_id = getattr(obj, 'user_id', None) or getattr(obj, 'vendor_user_id', None)
            return owner_id == request.user.id
        return True


# Phase 7 — ViewSet permission map mixin
class PermissionMapMixin:
    """
    Declare on any ViewSet:
        permission_map = {
            'create':   [CanCreateRFQ],
            'update':   [CanEditRFQ],
            'partial_update': [CanEditRFQ],
            'destroy':  [CanDeleteRFQ],
            'list':     [CanViewRFQ],
            'retrieve': [CanViewRFQ],
        }
    get_permissions() picks the right classes per action automatically.
    """
    permission_map = {}

    def get_permissions(self):
        classes = self.permission_map.get(self.action)
        if classes is not None:
            return [cls() for cls in classes]
        return super().get_permissions()
