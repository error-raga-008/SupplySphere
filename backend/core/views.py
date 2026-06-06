from datetime import timedelta

from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from core.models import ApprovalWorkflow, Invoice, Notification, PasswordReset, PurchaseOrder, Quotation, RFQ, Role, User, Vendor
from core.permissions import HasDashboardAccess, IsOwnerOrAdmin
from core.serializers import (
	AuthUserSerializer,
	DashboardSummarySerializer,
	ForgotPasswordSerializer,
	LoginSerializer,
	NotificationSerializer,
	PendingApprovalSerializer,
	PasswordResetSerializer,
	ProfileUpdateSerializer,
	RecentInvoiceSerializer,
	RecentPurchaseOrderSerializer,
	RecentQuotationSerializer,
	RecentRFQSerializer,
	RegisterSerializer,
	ResetPasswordSerializer,
	UserSerializer,
)
from core.services import build_auth_payload, create_activity_log, deactivate_session, ensure_session_record_schema, generate_reset_token, issue_token_pair, rotate_session_token


class RegisterAPIView(APIView):
	permission_classes = [AllowAny]

	def post(self, request):
		serializer = RegisterSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.save()
		tokens = issue_token_pair(user)
		create_activity_log(user=user, action='auth.register', entity_type='user', entity_id=user.id, new_values=UserSerializer(user).data, request=request)
		return Response(build_auth_payload(user, access=tokens['access'], refresh=tokens['refresh']), status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
	permission_classes = [AllowAny]

	def post(self, request):
		serializer = LoginSerializer(data=request.data, context={'request': request})
		serializer.is_valid(raise_exception=True)
		user = serializer.validated_data['user']
		tokens = issue_token_pair(user)
		create_activity_log(user=user, action='auth.login', entity_type='user', entity_id=user.id, request=request)
		return Response(build_auth_payload(user, access=tokens['access'], refresh=tokens['refresh']))


class LogoutAPIView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		refresh_token = request.data.get('refresh') or request.data.get('refresh_token')
		if not refresh_token:
			return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
		deactivate_session(request.user, refresh_token=refresh_token)
		create_activity_log(user=request.user, action='auth.logout', entity_type='user', entity_id=request.user.id, request=request)
		return Response({'message': 'Logged out successfully'})


class TokenRefreshAPIView(APIView):
	permission_classes = [AllowAny]

	def post(self, request):
		refresh_token = request.data.get('refresh')
		if not refresh_token:
			return Response({'refresh': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)

		ensure_session_record_schema()

		session = (
			User.objects.filter(auth_sessions__token=refresh_token, auth_sessions__is_active=True)
			.select_related('role')
			.first()
		)
		if not session:
			return Response({'detail': 'Invalid session.'}, status=status.HTTP_401_UNAUTHORIZED)

		serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
		serializer.is_valid(raise_exception=True)
		data = serializer.validated_data
		new_refresh = data.get('refresh')
		if new_refresh:
			rotate_session_token(session, refresh_token, new_refresh)
		return Response({
			'access': data['access'],
			'refresh': new_refresh or refresh_token,
			**build_auth_payload(session, access=data['access'], refresh=new_refresh or refresh_token),
		})


class ForgotPasswordAPIView(APIView):
	permission_classes = [AllowAny]

	def post(self, request):
		serializer = ForgotPasswordSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = User.objects.filter(email__iexact=serializer.validated_data['email']).first()
		if user:
			token = generate_reset_token()
			PasswordReset.objects.create(
				user=user,
				token=token,
				expires_at=timezone.now() + timedelta(days=1),
				used=False,
			)
		return Response({'detail': 'If the email exists, a reset token has been generated.'})


class ResetPasswordAPIView(APIView):
	permission_classes = [AllowAny]

	def post(self, request):
		serializer = ResetPasswordSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		reset = PasswordReset.objects.select_related('user').filter(
			token=serializer.validated_data['token'],
			used=False,
			expires_at__gt=timezone.now(),
		).first()
		if not reset:
			return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

		reset.user.set_password(serializer.validated_data['password'])
		reset.user.save(update_fields=['password', 'updated_at'])
		reset.used = True
		reset.save(update_fields=['used'])
		deactivate_session(reset.user)
		create_activity_log(user=reset.user, action='auth.password_reset', entity_type='user', entity_id=reset.user.id, request=request)
		return Response({'detail': 'Password has been reset successfully.'})


class ProfileAPIView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		return Response(build_auth_payload(request.user))

	def put(self, request):
		serializer = ProfileUpdateSerializer(instance=request.user, data=request.data, partial=True)
		serializer.is_valid(raise_exception=True)
		old_values = {
			'name': request.user.name,
			'phone': request.user.phone,
		}
		serializer.save()
		create_activity_log(
			user=request.user,
			action='auth.profile_update',
			entity_type='user',
			entity_id=request.user.id,
			old_values=old_values,
			new_values=ProfileUpdateSerializer(request.user).data,
			request=request,
		)
		return Response(build_auth_payload(request.user))


class DashboardSummaryAPIView(APIView):
	permission_classes = [HasDashboardAccess]

	def get(self, request):
		data = {
			'active_rfqs': RFQ.objects.filter(status__in=['draft', 'published']).count(),
			'pending_approvals': ApprovalWorkflow.objects.filter(status='pending').count(),
			'total_vendors': Vendor.objects.filter(status='active').count(),
			'active_purchase_orders': PurchaseOrder.objects.filter(status__in=['draft', 'issued', 'acknowledged']).count(),
			'open_invoices': Invoice.objects.filter(amount_due__gt=0).count(),
			'monthly_spend': Invoice.objects.aggregate(total=Coalesce(Sum('total_amount'), 0))['total'],
		}
		return Response(DashboardSummarySerializer(data).data)


class RecentRFQsAPIView(APIView):
	permission_classes = [HasDashboardAccess]

	def get(self, request):
		queryset = RFQ.objects.select_related('created_by').order_by('-created_at')[:10]
		return Response(RecentRFQSerializer(queryset, many=True).data)


class RecentQuotationsAPIView(APIView):
	permission_classes = [HasDashboardAccess]

	def get(self, request):
		queryset = Quotation.objects.select_related('vendor').order_by('-created_at')[:10]
		return Response(RecentQuotationSerializer(queryset, many=True).data)


class PendingApprovalsAPIView(APIView):
	permission_classes = [HasDashboardAccess]

	def get(self, request):
		queryset = ApprovalWorkflow.objects.select_related('quotation').filter(status='pending').order_by('-initiated_at')[:10]
		return Response(PendingApprovalSerializer(queryset, many=True).data)


class RecentPurchaseOrdersAPIView(APIView):
	permission_classes = [HasDashboardAccess]

	def get(self, request):
		queryset = PurchaseOrder.objects.select_related('vendor').order_by('-created_at')[:10]
		return Response(RecentPurchaseOrderSerializer(queryset, many=True).data)


class RecentInvoicesAPIView(APIView):
	permission_classes = [HasDashboardAccess]

	def get(self, request):
		queryset = Invoice.objects.select_related('vendor').order_by('-created_at')[:10]
		return Response(RecentInvoiceSerializer(queryset, many=True).data)


class NotificationViewSet(viewsets.ModelViewSet):
	serializer_class = NotificationSerializer
	permission_classes = [IsAuthenticated]
	http_method_names = ['get', 'patch', 'head', 'options']

	def get_queryset(self):
		user = self.request.user
		queryset = Notification.objects.select_related('user').order_by('-created_at')
		if getattr(user.role, 'name', None) == 'admin':
			return queryset
		return queryset.filter(user=user)

	def perform_update(self, serializer):
		serializer.save()

	@action(detail=True, methods=['patch'], url_path='read')
	def read(self, request, pk=None):
		notification = self.get_object()
		if notification.user_id != request.user.id and getattr(request.user.role, 'name', None) != 'admin':
			return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
		notification.is_read = True
		notification.save(update_fields=['is_read'])
		return Response(self.get_serializer(notification).data)
