import secrets
from datetime import datetime, timezone

from django.db import connection
from rest_framework_simplejwt.tokens import RefreshToken

from core.permissions import get_user_permissions
from core.models import SessionRecord
from .activity_logger import create_activity_log, get_client_ip, log_activity


_SESSION_SCHEMA_CHECKED = False


def build_auth_payload(user, *, access=None, refresh=None):
	role_name = getattr(user.role, 'name', None) if getattr(user, 'role_id', None) else None
	payload = {
		'user': {
			'id': user.id,
			'name': user.name,
			'email': user.email,
			'phone': user.phone,
			'role': role_name,
		},
		'permissions': get_user_permissions(user),
	}
	if access is not None:
		payload['access'] = access
	if refresh is not None:
		payload['refresh'] = refresh
	return payload


def ensure_session_record_schema():
	global _SESSION_SCHEMA_CHECKED

	if _SESSION_SCHEMA_CHECKED:
		return

	with connection.cursor() as cursor:
		cursor.execute("SHOW COLUMNS FROM sessions LIKE 'token'")
		has_token = cursor.fetchone() is not None

		cursor.execute("SHOW COLUMNS FROM sessions LIKE 'is_active'")
		has_is_active = cursor.fetchone() is not None

		cursor.execute("SHOW COLUMNS FROM sessions LIKE 'updated_at'")
		has_updated_at = cursor.fetchone() is not None

		alterations = []
		if not has_token:
			alterations.append("ADD COLUMN token VARCHAR(512) NULL UNIQUE")
		if not has_is_active:
			alterations.append("ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE")
		if not has_updated_at:
			alterations.append(
				"ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
			)

		if alterations:
			cursor.execute(f"ALTER TABLE sessions {', '.join(alterations)}")

	_SESSION_SCHEMA_CHECKED = True


def issue_token_pair(user):
	ensure_session_record_schema()
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
	ensure_session_record_schema()
	refresh_token = RefreshToken(str(new_refresh))
	expires_at = datetime.fromtimestamp(int(refresh_token['exp']), tz=timezone.utc)
	SessionRecord.objects.filter(user=user, token=str(old_refresh), is_active=True).update(
		token=str(refresh_token),
		expires_at=expires_at,
	)


def deactivate_session(user, refresh_token=None):
	ensure_session_record_schema()
	queryset = SessionRecord.objects.filter(user=user, is_active=True)
	if refresh_token:
		queryset = queryset.filter(token=refresh_token)
		token = RefreshToken(refresh_token)
		try:
			token.blacklist()
		except Exception:
			pass
	return queryset.update(is_active=False)


def generate_reset_token():
	return secrets.token_urlsafe(48)