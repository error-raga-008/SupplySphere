import secrets
from datetime import datetime, timezone

from rest_framework_simplejwt.tokens import RefreshToken

from core.models import ActivityLog, SessionRecord


def get_client_ip(request):
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def create_activity_log(*, user=None, action, entity_type='', entity_id='', old_values=None, new_values=None, request=None):
    return ActivityLog.objects.create(
        user=user,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id or ''),
        old_values=old_values,
        new_values=new_values,
        ip_address=get_client_ip(request) if request else None,
    )


def issue_token_pair(user):
    refresh = RefreshToken.for_user(user)
    expires_at = datetime.fromtimestamp(int(refresh['exp']), tz=timezone.utc)
    SessionRecord.objects.create(
        user=user,
        token=str(refresh),
        expires_at=expires_at,
        is_active=True,
    )
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


def rotate_session_token(user, old_refresh, new_refresh):
    refresh_token = RefreshToken(str(new_refresh))
    expires_at = datetime.fromtimestamp(int(refresh_token['exp']), tz=timezone.utc)
    SessionRecord.objects.filter(user=user, token=str(old_refresh), is_active=True).update(
        token=str(refresh_token),
        expires_at=expires_at,
    )


def deactivate_session(user, refresh_token=None):
    queryset = SessionRecord.objects.filter(user=user, is_active=True)
    if refresh_token:
        queryset = queryset.filter(token=refresh_token)
    return queryset.update(is_active=False)


def generate_reset_token():
    return secrets.token_urlsafe(48)