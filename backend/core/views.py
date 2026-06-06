from datetime import timedelta
from decimal import Decimal

from django.db.models import DecimalField, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from core.models import (
    ActivityLog, ApprovalStep, ApprovalWorkflow,
    Invoice, Notification, PasswordReset,
    PurchaseOrder, Quotation, RFQ, RFQItem,
    Role, User, Vendor, VendorCategory,
)
from core.permissions import (
    CanApprovePO, CanApproveQuote, CanCreatePO, CanCreateRFQ,
    CanDeleteRFQ, CanEditRFQ, CanManageVendors, CanRejectQuote,
    CanSubmitQuote, CanViewDashboard, CanViewInvoices, CanViewRFQ,
    IsAdmin, IsOwnerOrAdmin, PermissionMapMixin, get_role_permissions,
)
from core.serializers import (
    ActivityLogSerializer, ApprovalActionSerializer,
    ApprovalWorkflowSerializer, AuthUserSerializer,
    ChangePasswordSerializer, DashboardSummarySerializer,
    ForgotPasswordSerializer, InvoiceCreateSerializer,
    InvoiceSerializer, LoginSerializer, NotificationSerializer,
    PendingApprovalSerializer, PasswordResetSerializer,
    POCreateSerializer, ProfileUpdateSerializer,
    PurchaseOrderSerializer, QuotationCreateSerializer,
    QuotationListSerializer, QuotationSerializer,
    RecentInvoiceSerializer, RecentPurchaseOrderSerializer,
    RecentQuotationSerializer, RecentRFQSerializer,
    RegisterSerializer, ResetPasswordSerializer, RFQCreateSerializer,
    RFQItemSerializer, RFQListSerializer, RFQSerializer,
    UserSerializer, VendorCategorySerializer, VendorListSerializer,
    VendorSerializer,
)
from core.services import (
    create_activity_log, deactivate_session, generate_invoice_number,
    generate_po_number, generate_quote_number, generate_rfq_number,
    generate_reset_token, issue_token_pair, rotate_session_token,
)


def _permissions_for(user):
    return get_role_permissions(getattr(user.role, 'name', None))


# ── Pagination ────────────────────────────────────────────────────────────

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# ── Auth views ────────────────────────────────────────────────────────────

class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = issue_token_pair(user)
        create_activity_log(
            user=user, action='auth.register',
            entity_type='user', entity_id=user.id,
            new_values=UserSerializer(user).data, request=request,
        )
        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': AuthUserSerializer(user).data,
            'permissions': _permissions_for(user),
        }, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = issue_token_pair(user)
        create_activity_log(
            user=user, action='auth.login',
            entity_type='user', entity_id=user.id, request=request,
        )
        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': AuthUserSerializer(user).data,
            'permissions': _permissions_for(user),
        })


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh') or request.data.get('refresh_token')
        deactivate_session(request.user, refresh_token=refresh_token)
        create_activity_log(
            user=request.user, action='auth.logout',
            entity_type='user', entity_id=request.user.id, request=request,
        )
        return Response({'detail': 'Logged out successfully.'})


class TokenRefreshAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'refresh': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)

        user = (
            User.objects.filter(auth_sessions__token=refresh_token, auth_sessions__is_active=True)
            .select_related('role')
            .first()
        )
        if not user:
            return Response({'detail': 'Invalid session.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        new_refresh = data.get('refresh')
        if new_refresh:
            rotate_session_token(user, refresh_token, new_refresh)
        return Response({
            'access': data['access'],
            'refresh': new_refresh or refresh_token,
            'user': AuthUserSerializer(user).data,
            'permissions': _permissions_for(user),
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
        create_activity_log(
            user=reset.user, action='auth.password_reset',
            entity_type='user', entity_id=reset.user.id, request=request,
        )
        return Response({'detail': 'Password has been reset successfully.'})


class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'name': request.user.name,
            'email': request.user.email,
            'phone': request.user.phone,
            'role': request.user.role.name if request.user.role_id else None,
            'permissions': _permissions_for(request.user),
        })

    def put(self, request):
        serializer = ProfileUpdateSerializer(instance=request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        old_values = {'name': request.user.name, 'phone': request.user.phone}
        serializer.save()
        create_activity_log(
            user=request.user, action='auth.profile_update',
            entity_type='user', entity_id=request.user.id,
            old_values=old_values,
            new_values=ProfileUpdateSerializer(request.user).data,
            request=request,
        )
        return Response({
            'name': request.user.name,
            'email': request.user.email,
            'phone': request.user.phone,
            'role': request.user.role.name if request.user.role_id else None,
        })


class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        create_activity_log(
            user=request.user, action='auth.password_change',
            entity_type='user', entity_id=request.user.id,
            request=request,
        )
        return Response({'detail': 'Password changed successfully.'})


# ── Dashboard ─────────────────────────────────────────────────────────────

class DashboardSummaryAPIView(APIView):
    permission_classes = [CanViewDashboard]

    def get(self, request):
        data = {
            'active_rfqs': RFQ.objects.filter(status__in=['draft', 'published']).count(),
            'pending_approvals': ApprovalWorkflow.objects.filter(status='pending').count(),
            'total_vendors': Vendor.objects.filter(status='active').count(),
            'active_purchase_orders': PurchaseOrder.objects.filter(status__in=['draft', 'issued', 'acknowledged']).count(),
            'open_invoices': Invoice.objects.filter(amount_due__gt=0).count(),
            'monthly_spend': Invoice.objects.filter(
                created_at__month=timezone.now().month,
                created_at__year=timezone.now().year,
            ).aggregate(total=Coalesce(Sum('total_amount'), Value(Decimal('0')), output_field=DecimalField()))['total'],
        }
        return Response(DashboardSummarySerializer(data).data)


class RecentRFQsAPIView(APIView):
    permission_classes = [CanViewDashboard]

    def get(self, request):
        queryset = RFQ.objects.select_related('created_by').order_by('-created_at')[:10]
        return Response(RecentRFQSerializer(queryset, many=True).data)


class RecentQuotationsAPIView(APIView):
    permission_classes = [CanViewDashboard]

    def get(self, request):
        queryset = Quotation.objects.select_related('vendor').order_by('-created_at')[:10]
        return Response(RecentQuotationSerializer(queryset, many=True).data)


class PendingApprovalsAPIView(APIView):
    permission_classes = [CanViewDashboard]

    def get(self, request):
        queryset = ApprovalWorkflow.objects.select_related('quotation').filter(status='pending').order_by('-initiated_at')[:10]
        return Response(PendingApprovalSerializer(queryset, many=True).data)


class RecentPurchaseOrdersAPIView(APIView):
    permission_classes = [CanViewDashboard]

    def get(self, request):
        queryset = PurchaseOrder.objects.select_related('vendor').order_by('-created_at')[:5]
        return Response(RecentPurchaseOrderSerializer(queryset, many=True).data)


class RecentInvoicesAPIView(APIView):
    permission_classes = [CanViewDashboard]

    def get(self, request):
        queryset = Invoice.objects.select_related('vendor').order_by('-created_at')[:10]
        return Response(RecentInvoiceSerializer(queryset, many=True).data)


# ── Notification ViewSet ──────────────────────────────────────────────────

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
        create_activity_log(
            user=request.user, action='notification.read',
            entity_type='notification', entity_id=notification.id, request=request,
        )
        return Response(self.get_serializer(notification).data)


# ── Vendor ViewSet ────────────────────────────────────────────────────────

class VendorCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VendorCategory.objects.all()
    serializer_class = VendorCategorySerializer
    permission_classes = [IsAuthenticated]


class VendorViewSet(PermissionMapMixin, viewsets.ModelViewSet):
    serializer_class = VendorSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'city', 'category__name']
    ordering_fields = ['name', 'created_at', 'rating', 'status']
    ordering = ['-created_at']

    permission_map = {
        'create': [CanManageVendors],
        'update': [CanManageVendors],
        'partial_update': [CanManageVendors],
        'destroy': [CanManageVendors],
        'block': [CanManageVendors],
        'activate': [CanManageVendors],
        'blacklist': [CanManageVendors],
    }

    def get_queryset(self):
        qs = Vendor.objects.select_related('category').order_by('-created_at')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        category_id = self.request.query_params.get('category_id')
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return VendorListSerializer
        return VendorSerializer

    def perform_create(self, serializer):
        vendor = serializer.save()
        create_activity_log(
            user=self.request.user, action='vendor.created',
            entity_type='vendor', entity_id=vendor.id,
            new_values={'name': vendor.name, 'email': vendor.email},
            request=self.request,
        )

    def perform_update(self, serializer):
        old = VendorSerializer(self.get_object()).data
        vendor = serializer.save()
        create_activity_log(
            user=self.request.user, action='vendor.updated',
            entity_type='vendor', entity_id=vendor.id,
            old_values=old, new_values=VendorSerializer(vendor).data,
            request=self.request,
        )

    def perform_destroy(self, instance):
        create_activity_log(
            user=self.request.user, action='vendor.deleted',
            entity_type='vendor', entity_id=instance.id,
            old_values={'name': instance.name}, request=self.request,
        )
        instance.delete()

    @action(detail=True, methods=['patch'])
    def block(self, request, pk=None):
        vendor = self.get_object()
        vendor.status = 'inactive'
        vendor.save(update_fields=['status'])
        create_activity_log(user=request.user, action='vendor.blocked', entity_type='vendor', entity_id=vendor.id, request=request)
        return Response(VendorSerializer(vendor).data)

    @action(detail=True, methods=['patch'])
    def activate(self, request, pk=None):
        vendor = self.get_object()
        vendor.status = 'active'
        vendor.save(update_fields=['status'])
        create_activity_log(user=request.user, action='vendor.activated', entity_type='vendor', entity_id=vendor.id, request=request)
        return Response(VendorSerializer(vendor).data)

    @action(detail=True, methods=['patch'])
    def blacklist(self, request, pk=None):
        vendor = self.get_object()
        vendor.status = 'blacklisted'
        vendor.save(update_fields=['status'])
        create_activity_log(user=request.user, action='vendor.blacklisted', entity_type='vendor', entity_id=vendor.id, request=request)
        return Response(VendorSerializer(vendor).data)


# ── RFQ ViewSet ───────────────────────────────────────────────────────────

class RFQViewSet(PermissionMapMixin, viewsets.ModelViewSet):
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'rfq_number']
    ordering_fields = ['created_at', 'submission_deadline', 'status']
    ordering = ['-created_at']

    permission_map = {
        'create': [CanCreateRFQ],
        'update': [CanEditRFQ],
        'partial_update': [CanEditRFQ],
        'destroy': [CanDeleteRFQ],
        'publish': [CanEditRFQ],
        'close': [CanEditRFQ],
        'cancel': [CanEditRFQ],
    }

    def get_queryset(self):
        qs = RFQ.objects.select_related('created_by').prefetch_related('items')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        role = getattr(self.request.user.role, 'name', None)
        if role == 'vendor':
            qs = qs.filter(status='published')
        return qs.order_by('-created_at')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return RFQCreateSerializer
        if self.action == 'list':
            return RFQListSerializer
        return RFQSerializer

    def create(self, request, *args, **kwargs):
        serializer = RFQCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        rfq = RFQ.objects.create(
            rfq_number=generate_rfq_number(),
            title=data['title'],
            description=data.get('description', ''),
            submission_deadline=data['submission_deadline'],
            created_by=request.user,
            status='draft',
        )
        for item_data in data['items']:
            RFQItem.objects.create(rfq=rfq, **item_data)
        create_activity_log(
            user=request.user, action='rfq.created',
            entity_type='rfq', entity_id=rfq.id,
            new_values={'rfq_number': rfq.rfq_number, 'title': rfq.title},
            request=request,
        )
        rfq.refresh_from_db()
        return Response(RFQSerializer(rfq).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        rfq = self.get_object()
        if rfq.status not in ['draft']:
            return Response({'detail': 'Only draft RFQs can be edited.'}, status=status.HTTP_400_BAD_REQUEST)
        partial = kwargs.pop('partial', False)
        serializer = RFQCreateSerializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        rfq.title = data.get('title', rfq.title)
        rfq.description = data.get('description', rfq.description)
        rfq.submission_deadline = data.get('submission_deadline', rfq.submission_deadline)
        rfq.save()
        if 'items' in data:
            rfq.items.all().delete()
            for item_data in data['items']:
                RFQItem.objects.create(rfq=rfq, **item_data)
        rfq.refresh_from_db()
        return Response(RFQSerializer(rfq).data)

    def destroy(self, request, *args, **kwargs):
        rfq = self.get_object()
        if rfq.status not in ['draft', 'cancelled']:
            return Response({'detail': 'Only draft or cancelled RFQs can be deleted.'}, status=status.HTTP_400_BAD_REQUEST)
        create_activity_log(user=request.user, action='rfq.deleted', entity_type='rfq', entity_id=rfq.id, request=request)
        rfq.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['patch'])
    def publish(self, request, pk=None):
        rfq = self.get_object()
        if rfq.status != 'draft':
            return Response({'detail': 'Only draft RFQs can be published.'}, status=status.HTTP_400_BAD_REQUEST)
        rfq.status = 'published'
        rfq.save(update_fields=['status'])
        create_activity_log(user=request.user, action='rfq.published', entity_type='rfq', entity_id=rfq.id, request=request)
        return Response(RFQSerializer(rfq).data)

    @action(detail=True, methods=['patch'])
    def close(self, request, pk=None):
        rfq = self.get_object()
        rfq.status = 'closed'
        rfq.save(update_fields=['status'])
        return Response(RFQSerializer(rfq).data)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        rfq = self.get_object()
        rfq.status = 'cancelled'
        rfq.save(update_fields=['status'])
        return Response(RFQSerializer(rfq).data)


# ── Quotation ViewSet ─────────────────────────────────────────────────────

class QuotationViewSet(PermissionMapMixin, viewsets.ModelViewSet):
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['quote_number', 'vendor__name']
    ordering = ['-created_at']

    permission_map = {
        'create': [CanSubmitQuote],
        'submit': [CanSubmitQuote],
        'accept': [CanApproveQuote],
        'reject': [CanRejectQuote],
    }

    def get_queryset(self):
        qs = Quotation.objects.select_related('vendor', 'rfq').prefetch_related('items')
        role = getattr(self.request.user.role, 'name', None)
        if role == 'vendor':
            vendor_qs = Vendor.objects.filter(user_id=self.request.user.id)
            qs = qs.filter(vendor__in=vendor_qs)
        rfq_id = self.request.query_params.get('rfq_id')
        if rfq_id:
            qs = qs.filter(rfq_id=rfq_id)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return QuotationCreateSerializer
        if self.action == 'list':
            return QuotationListSerializer
        return QuotationSerializer

    def create(self, request, *args, **kwargs):
        serializer = QuotationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        rfq = RFQ.objects.get(pk=data['rfq_id'])
        vendor = Vendor.objects.get(pk=data['vendor_id'])

        if Quotation.objects.filter(rfq_id=rfq.id, vendor_id=vendor.id).exists():
            return Response({'detail': 'A quotation already exists for this vendor and RFQ.'}, status=status.HTTP_400_BAD_REQUEST)

        total = sum(float(item.get('unit_price', 0)) * float(item.get('quantity', 0)) for item in data['items'])
        quotation = Quotation.objects.create(
            rfq=rfq,
            vendor=vendor,
            quote_number=generate_quote_number(),
            delivery_days=data.get('delivery_days'),
            validity_date=data.get('validity_date'),
            notes=data.get('notes', ''),
            total_amount=total,
            status='draft',
        )
        create_activity_log(
            user=request.user, action='quotation.created',
            entity_type='quotation', entity_id=quotation.id,
            new_values={'quote_number': quotation.quote_number},
            request=request,
        )
        return Response(QuotationSerializer(quotation).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def submit(self, request, pk=None):
        quotation = self.get_object()
        if quotation.status not in ['draft']:
            return Response({'detail': 'Only draft quotations can be submitted.'}, status=status.HTTP_400_BAD_REQUEST)
        quotation.status = 'submitted'
        quotation.submitted_at = timezone.now()
        quotation.save(update_fields=['status', 'submitted_at'])
        create_activity_log(
            user=request.user, action='quotation.submitted',
            entity_type='quotation', entity_id=quotation.id, request=request,
        )
        return Response(QuotationSerializer(quotation).data)

    @action(detail=True, methods=['patch'])
    def accept(self, request, pk=None):
        quotation = self.get_object()
        quotation.status = 'accepted'
        quotation.save(update_fields=['status'])
        return Response(QuotationSerializer(quotation).data)

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        quotation = self.get_object()
        quotation.status = 'rejected'
        quotation.save(update_fields=['status'])
        return Response(QuotationSerializer(quotation).data)


# ── Approval ViewSet ──────────────────────────────────────────────────────

class ApprovalWorkflowViewSet(PermissionMapMixin, viewsets.ModelViewSet):
    serializer_class = ApprovalWorkflowSerializer
    pagination_class = StandardPagination
    http_method_names = ['get', 'post', 'head', 'options']

    permission_map = {
        'create': [CanApproveQuote],
        'approve': [CanApproveQuote],
        'reject': [CanRejectQuote],
    }

    def get_queryset(self):
        qs = ApprovalWorkflow.objects.select_related(
            'quotation__vendor', 'quotation__rfq', 'initiated_by',
        ).prefetch_related('steps')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by('-initiated_at')

    def create(self, request, *args, **kwargs):
        quotation_id = request.data.get('quotation_id')
        if not quotation_id:
            return Response({'quotation_id': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)
        try:
            quotation = Quotation.objects.get(pk=quotation_id)
        except Quotation.DoesNotExist:
            return Response({'detail': 'Quotation not found.'}, status=status.HTTP_404_NOT_FOUND)
        if ApprovalWorkflow.objects.filter(quotation_id=quotation_id).exists():
            return Response({'detail': 'Approval workflow already exists for this quotation.'}, status=status.HTTP_400_BAD_REQUEST)

        workflow = ApprovalWorkflow.objects.create(
            quotation=quotation,
            initiated_by=request.user,
            status='pending',
        )
        quotation.status = 'submitted'
        quotation.save(update_fields=['status'])
        create_activity_log(
            user=request.user, action='approval.initiated',
            entity_type='approval_workflow', entity_id=workflow.id,
            new_values={'quotation_id': quotation_id}, request=request,
        )
        return Response(ApprovalWorkflowSerializer(workflow).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        workflow = self.get_object()
        if workflow.status != 'pending':
            return Response({'detail': 'Only pending workflows can be approved.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ApprovalActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        workflow.status = 'approved'
        workflow.resolved_at = timezone.now()
        workflow.save(update_fields=['status', 'resolved_at'])
        workflow.quotation.status = 'accepted'
        workflow.quotation.save(update_fields=['status'])
        ApprovalStep.objects.create(
            workflow=workflow,
            approver=request.user,
            status='approved',
            remarks=serializer.validated_data.get('remarks', ''),
            acted_at=timezone.now(),
        )
        create_activity_log(
            user=request.user, action='approval.approved',
            entity_type='approval_workflow', entity_id=workflow.id,
            new_values={'remarks': serializer.validated_data.get('remarks', '')},
            request=request,
        )
        return Response(ApprovalWorkflowSerializer(workflow).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        workflow = self.get_object()
        if workflow.status != 'pending':
            return Response({'detail': 'Only pending workflows can be rejected.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ApprovalActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        workflow.status = 'rejected'
        workflow.resolved_at = timezone.now()
        workflow.save(update_fields=['status', 'resolved_at'])
        workflow.quotation.status = 'rejected'
        workflow.quotation.save(update_fields=['status'])
        ApprovalStep.objects.create(
            workflow=workflow,
            approver=request.user,
            status='rejected',
            remarks=serializer.validated_data.get('remarks', ''),
            acted_at=timezone.now(),
        )
        create_activity_log(
            user=request.user, action='approval.rejected',
            entity_type='approval_workflow', entity_id=workflow.id,
            new_values={'remarks': serializer.validated_data.get('remarks', '')},
            request=request,
        )
        return Response(ApprovalWorkflowSerializer(workflow).data)


# ── Purchase Order ViewSet ────────────────────────────────────────────────

class PurchaseOrderViewSet(PermissionMapMixin, viewsets.ModelViewSet):
    serializer_class = PurchaseOrderSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['po_number', 'vendor__name']
    ordering = ['-created_at']

    permission_map = {
        'create': [CanCreatePO],
        'issue': [CanCreatePO],
        'cancel': [CanCreatePO],
    }

    def get_queryset(self):
        qs = PurchaseOrder.objects.select_related('vendor', 'quotation', 'created_by')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = POCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        quotation = Quotation.objects.select_related('vendor').get(pk=data['quotation_id'])
        po = PurchaseOrder.objects.create(
            po_number=generate_po_number(),
            quotation=quotation,
            vendor=quotation.vendor,
            created_by=request.user,
            status='draft',
            total_amount=quotation.total_amount,
            subtotal=quotation.total_amount,
            delivery_date=data.get('delivery_date'),
            billing_address=data.get('billing_address', ''),
            shipping_address=data.get('shipping_address', ''),
            terms_conditions=data.get('terms_conditions', ''),
        )
        create_activity_log(
            user=request.user, action='po.created',
            entity_type='purchase_order', entity_id=po.id,
            new_values={'po_number': po.po_number, 'total_amount': str(po.total_amount)},
            request=request,
        )
        return Response(PurchaseOrderSerializer(po).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def issue(self, request, pk=None):
        po = self.get_object()
        if po.status != 'draft':
            return Response({'detail': 'Only draft POs can be issued.'}, status=status.HTTP_400_BAD_REQUEST)
        po.status = 'issued'
        po.save(update_fields=['status'])
        create_activity_log(user=request.user, action='po.issued', entity_type='purchase_order', entity_id=po.id, request=request)
        return Response(PurchaseOrderSerializer(po).data)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        po = self.get_object()
        if po.status in ['completed']:
            return Response({'detail': 'Completed POs cannot be cancelled.'}, status=status.HTTP_400_BAD_REQUEST)
        po.status = 'cancelled'
        po.save(update_fields=['status'])
        return Response(PurchaseOrderSerializer(po).data)


# ── Invoice ViewSet ───────────────────────────────────────────────────────

class InvoiceViewSet(PermissionMapMixin, viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['invoice_number', 'vendor__name']
    ordering = ['-created_at']

    permission_map = {
        'list': [CanViewInvoices],
        'retrieve': [CanViewInvoices],
        'create': [CanCreatePO],
        'mark_sent': [CanCreatePO],
        'mark_paid': [CanApprovePO],
    }

    def get_queryset(self):
        qs = Invoice.objects.select_related('vendor', 'po', 'created_by')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = InvoiceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        po = PurchaseOrder.objects.select_related('vendor').get(pk=data['po_id'])
        total = (
            data['subtotal']
            + data.get('cgst_amount', 0)
            + data.get('sgst_amount', 0)
            + data.get('igst_amount', 0)
            - data.get('discount_amount', 0)
        )
        invoice = Invoice.objects.create(
            invoice_number=generate_invoice_number(),
            po=po,
            vendor=po.vendor,
            created_by=request.user,
            status='draft',
            issue_date=data['issue_date'],
            due_date=data['due_date'],
            subtotal=data['subtotal'],
            cgst_amount=data.get('cgst_amount', 0),
            sgst_amount=data.get('sgst_amount', 0),
            igst_amount=data.get('igst_amount', 0),
            discount_amount=data.get('discount_amount', 0),
            total_amount=total,
            amount_paid=0,
            notes=data.get('notes', ''),
        )
        invoice.refresh_from_db()  # re-fetch MySQL generated amount_due
        create_activity_log(
            user=request.user, action='invoice.created',
            entity_type='invoice', entity_id=invoice.id,
            new_values={'invoice_number': invoice.invoice_number, 'total_amount': str(invoice.total_amount)},
            request=request,
        )
        return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='mark-sent')
    def mark_sent(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'sent'
        invoice.save(update_fields=['status'])
        return Response(InvoiceSerializer(invoice).data)

    @action(detail=True, methods=['patch'], url_path='mark-paid')
    def mark_paid(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'paid'
        invoice.amount_paid = invoice.total_amount
        invoice.save(update_fields=['status', 'amount_paid'])
        invoice.refresh_from_db()  # re-fetch MySQL generated amount_due
        create_activity_log(user=request.user, action='invoice.paid', entity_type='invoice', entity_id=invoice.id, request=request)
        return Response(InvoiceSerializer(invoice).data)


# ── Activity Log ViewSet ──────────────────────────────────────────────────

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdmin]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['action', 'entity_type', 'user__name', 'user__email']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = ActivityLog.objects.select_related('user').order_by('-created_at')
        entity_type = self.request.query_params.get('entity_type')
        if entity_type:
            qs = qs.filter(entity_type=entity_type)
        return qs
