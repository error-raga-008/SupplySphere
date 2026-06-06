from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user.role, 'name', None) == 'admin')


class HasDashboardAccess(BasePermission):
    allowed_roles = {'admin', 'procurement_officer', 'vendor', 'manager'}

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user.role, 'name', None) in self.allowed_roles)


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return getattr(user.role, 'name', None) == 'admin' or getattr(obj, 'user_id', None) == user.id