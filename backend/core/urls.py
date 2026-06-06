from django.urls import include, path
from rest_framework.routers import DefaultRouter

from core.views import (
    DashboardSummaryAPIView,
    ForgotPasswordAPIView,
    LoginAPIView,
    LogoutAPIView,
    NotificationViewSet,
    PendingApprovalsAPIView,
    ProfileAPIView,
    RecentInvoicesAPIView,
    RecentPurchaseOrdersAPIView,
    RecentQuotationsAPIView,
    RecentRFQsAPIView,
    RegisterAPIView,
    ResetPasswordAPIView,
    TokenRefreshAPIView,
)

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('auth/register/', RegisterAPIView.as_view(), name='auth-register'),
    path('auth/login/', LoginAPIView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutAPIView.as_view(), name='auth-logout'),
    path('auth/token/refresh/', TokenRefreshAPIView.as_view(), name='auth-token-refresh'),
    path('auth/forgot-password/', ForgotPasswordAPIView.as_view(), name='auth-forgot-password'),
    path('auth/reset-password/', ResetPasswordAPIView.as_view(), name='auth-reset-password'),
    path('auth/profile/', ProfileAPIView.as_view(), name='auth-profile'),
    path('dashboard/', DashboardSummaryAPIView.as_view(), name='dashboard-summary'),
    path('dashboard/recent-rfqs/', RecentRFQsAPIView.as_view(), name='dashboard-recent-rfqs'),
    path('dashboard/recent-quotations/', RecentQuotationsAPIView.as_view(), name='dashboard-recent-quotations'),
    path('dashboard/pending-approvals/', PendingApprovalsAPIView.as_view(), name='dashboard-pending-approvals'),
    path('dashboard/recent-purchase-orders/', RecentPurchaseOrdersAPIView.as_view(), name='dashboard-recent-purchase-orders'),
    path('dashboard/recent-invoices/', RecentInvoicesAPIView.as_view(), name='dashboard-recent-invoices'),
    path('', include(router.urls)),
]