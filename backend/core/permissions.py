from rest_framework.permissions import BasePermission


ROLE_PERMISSIONS = {
    'admin': [
        'manage_users',
        'manage_roles',
        'manage_vendors',
        'create_rfq',
        'edit_rfq',
        'delete_rfq',
        'view_rfq',
        'submit_quote',
        'approve_quote',
        'reject_quote',
        'create_po',
        'approve_po',
        'view_invoices',
        'manage_notifications',
        'view_dashboard',
        'system_admin',
    ],
    'manager': [
        'approve_quote',
        'reject_quote',
        'approve_po',
        'view_dashboard',
        'view_rfq',
        'view_invoices',
    ],
    'procurement_officer': [
        'create_rfq',
        'edit_rfq',
        'delete_rfq',
        'view_rfq',
        'create_po',
        'view_dashboard',
        'manage_vendors',
    ],
    'vendor': [
        'submit_quote',
        'view_rfq',
        'view_dashboard',
    ],
}


def get_role_permissions(role_name):
    return ROLE_PERMISSIONS.get(role_name, [])


def get_user_permissions(user):
    role_name = getattr(getattr(user, 'role', None), 'name', None)
    return get_role_permissions(role_name)


class HasRolePermission(BasePermission):
    required_permission = None
    message = 'You do not have permission to perform this action.'

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False

        role_name = getattr(getattr(user, 'role', None), 'name', None)
        if role_name == 'admin':
            return True

        required_permission = self.required_permission
        if not required_permission:
            return False

        return required_permission in get_user_permissions(user)


class ActionPermissionMixin:
    permission_map = {}

    def get_permissions(self):
        permission_classes = list(getattr(self, 'permission_classes', []))
        action = getattr(self, 'action', None)
        action_permission = self.permission_map.get(action)
        if action_permission and action_permission not in permission_classes:
            permission_classes.append(action_permission)
        return [permission_class() for permission_class in permission_classes]


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


class IsOwnerOrAdmin(BasePermission):
    message = 'You do not have permission to perform this action.'

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        return bool(user and user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False

        role_name = getattr(getattr(user, 'role', None), 'name', None)
        if role_name == 'admin':
            return True

        if role_name != 'vendor':
            return False

        owner_user_id = getattr(obj, 'user_id', None)
        if owner_user_id is not None:
            return owner_user_id == user.id

        created_by_id = getattr(obj, 'created_by_id', None)
        if created_by_id is not None:
            return created_by_id == user.id

        vendor = getattr(obj, 'vendor', None)
        if vendor is not None:
            return getattr(vendor, 'user_id', None) == user.id

        quotation = getattr(obj, 'quotation', None)
        if quotation is not None:
            quotation_vendor = getattr(quotation, 'vendor', None)
            if quotation_vendor is not None:
                return getattr(quotation_vendor, 'user_id', None) == user.id

        return False