from types import SimpleNamespace

from django.test import SimpleTestCase
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated, PermissionDenied

from core.exceptions import custom_exception_handler
from core.permissions import CanApprovePO, IsOwnerOrAdmin, get_role_permissions
from core.services import build_auth_payload


class RBACPermissionTests(SimpleTestCase):
	def test_role_permission_mapping_returns_expected_permissions(self):
		self.assertIn('manage_users', get_role_permissions('admin'))
		self.assertIn('view_dashboard', get_role_permissions('vendor'))
		self.assertEqual(get_role_permissions('unknown'), [])

	def test_build_auth_payload_includes_permissions(self):
		user = SimpleNamespace(
			id=1,
			name='John Doe',
			email='john@example.com',
			phone='',
			role=SimpleNamespace(name='manager'),
			role_id=2,
		)

		payload = build_auth_payload(user, access='access-token', refresh='refresh-token')

		self.assertEqual(payload['user']['role'], 'manager')
		self.assertEqual(payload['permissions'], ['approve_quote', 'reject_quote', 'approve_po', 'view_dashboard', 'view_rfq', 'view_invoices'])
		self.assertEqual(payload['access'], 'access-token')
		self.assertEqual(payload['refresh'], 'refresh-token')

	def test_role_permission_class_checks_required_permission(self):
		request = SimpleNamespace(user=SimpleNamespace(is_authenticated=True, role=SimpleNamespace(name='manager')))

		self.assertTrue(CanApprovePO().has_permission(request, view=None))

		vendor_request = SimpleNamespace(user=SimpleNamespace(is_authenticated=True, role=SimpleNamespace(name='vendor')))
		self.assertFalse(CanApprovePO().has_permission(vendor_request, view=None))

	def test_owner_permission_uses_vendor_link(self):
		request = SimpleNamespace(user=SimpleNamespace(is_authenticated=True, id=7, role=SimpleNamespace(name='vendor')))
		obj = SimpleNamespace(vendor=SimpleNamespace(user_id=7))

		self.assertTrue(IsOwnerOrAdmin().has_object_permission(request, view=None, obj=obj))

	def test_custom_exception_handler_normalizes_detail_messages(self):
		permission_response = custom_exception_handler(PermissionDenied(), context={})
		auth_response = custom_exception_handler(NotAuthenticated(), context={})
		invalid_response = custom_exception_handler(AuthenticationFailed('invalid credentials'), context={})

		self.assertEqual(permission_response.data['detail'], 'You do not have permission to perform this action.')
		self.assertEqual(auth_response.data['detail'], 'Authentication required.')
		self.assertEqual(invalid_response.data['detail'], 'Invalid credentials')
