from rest_framework.permissions import BasePermission


ROLE_PERMISSIONS = {
    'admin': ['dashboard', 'vendors', 'rfqs', 'quotations', 'approvals', 'purchase-orders', 'invoices', 'activity-logs', 'notifications'],
    'procurement_officer': ['dashboard', 'vendors', 'rfqs', 'quotations', 'approvals', 'purchase-orders', 'invoices', 'activity-logs', 'notifications'],
    'manager': ['dashboard', 'rfqs', 'quotations', 'approvals', 'purchase-orders', 'invoices', 'activity-logs', 'notifications'],
    'vendor': ['profile', 'rfqs', 'quotations', 'notifications'],
}


def get_role_permissions(role_name):
    return ROLE_PERMISSIONS.get(role_name, [])


class RolePermission(BasePermission):
    allowed_roles = set()
    message = 'Permission denied.'

    def has_permission(self, request, view):
        user = request.user
        role_name = getattr(user.role, 'name', None)
        if not user or not user.is_authenticated:
            return False
        if role_name == 'admin':
            return True
        return role_name in self.allowed_roles


class AdminPermission(RolePermission):
    allowed_roles = {'admin'}


class ProcurementOfficerPermission(RolePermission):
    allowed_roles = {'procurement_officer'}


class ManagerPermission(RolePermission):
    allowed_roles = {'manager'}


class VendorPermission(RolePermission):
    allowed_roles = {'vendor'}


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user.role, 'name', None) == 'admin')


class HasDashboardAccess(RolePermission):
    allowed_roles = {'procurement_officer', 'manager'}


class HasDashboardAccessForVendor(RolePermission):
    allowed_roles = {'procurement_officer', 'manager', 'vendor'}


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return getattr(user.role, 'name', None) == 'admin' or getattr(obj, 'user_id', None) == user.id