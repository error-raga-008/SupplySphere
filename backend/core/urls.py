from django.urls import include, path
from rest_framework.routers import DefaultRouter

from core.views import (
    ActivityLogViewSet,
    ApprovalWorkflowViewSet,
    ChangePasswordAPIView,
    DashboardSummaryAPIView,
    ForgotPasswordAPIView,
    InvoiceViewSet,
    LoginAPIView,
    LogoutAPIView,
    NotificationViewSet,
    PendingApprovalsAPIView,
    ProfileAPIView,
    PurchaseOrderViewSet,
    QuotationViewSet,
    RecentInvoicesAPIView,
    RecentPurchaseOrdersAPIView,
    RecentQuotationsAPIView,
    RecentRFQsAPIView,
    RegisterAPIView,
    ResetPasswordAPIView,
    RFQViewSet,
    TokenRefreshAPIView,
    VendorCategoryViewSet,
    VendorViewSet,
)

router = DefaultRouter()
router.register(r'notifications',   NotificationViewSet,        basename='notifications')
router.register(r'vendor-categories', VendorCategoryViewSet,    basename='vendor-categories')
router.register(r'vendors',         VendorViewSet,              basename='vendors')
router.register(r'rfqs',            RFQViewSet,                 basename='rfqs')
router.register(r'quotations',      QuotationViewSet,           basename='quotations')
router.register(r'approvals',       ApprovalWorkflowViewSet,    basename='approvals')
router.register(r'purchase-orders', PurchaseOrderViewSet,       basename='purchase-orders')
router.register(r'invoices',        InvoiceViewSet,             basename='invoices')
router.register(r'activity-logs',   ActivityLogViewSet,         basename='activity-logs')

urlpatterns = [
    # Auth
    path('auth/register/',          RegisterAPIView.as_view(),        name='auth-register'),
    path('auth/login/',              LoginAPIView.as_view(),           name='auth-login'),
    path('auth/logout/',             LogoutAPIView.as_view(),          name='auth-logout'),
    path('auth/token/refresh/',      TokenRefreshAPIView.as_view(),    name='auth-token-refresh'),
    path('auth/forgot-password/',    ForgotPasswordAPIView.as_view(),  name='auth-forgot-password'),
    path('auth/reset-password/',     ResetPasswordAPIView.as_view(),   name='auth-reset-password'),
    path('auth/profile/',            ProfileAPIView.as_view(),         name='auth-profile'),
    path('auth/change-password/',    ChangePasswordAPIView.as_view(),  name='auth-change-password'),
    # Dashboard
    path('dashboard/',               DashboardSummaryAPIView.as_view(),        name='dashboard-summary'),
    path('dashboard/recent-rfqs/',   RecentRFQsAPIView.as_view(),              name='dashboard-recent-rfqs'),
    path('dashboard/recent-quotations/', RecentQuotationsAPIView.as_view(),    name='dashboard-recent-quotations'),
    path('dashboard/pending-approvals/', PendingApprovalsAPIView.as_view(),    name='dashboard-pending-approvals'),
    path('dashboard/recent-purchase-orders/', RecentPurchaseOrdersAPIView.as_view(), name='dashboard-recent-pos'),
    path('dashboard/recent-invoices/', RecentInvoicesAPIView.as_view(),        name='dashboard-recent-invoices'),
    # ViewSets
    path('', include(router.urls)),
]
