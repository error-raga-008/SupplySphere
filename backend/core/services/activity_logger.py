from core.models import ActivityLog


def get_client_ip(request):
	if not request:
		return None

	meta = getattr(request, 'META', {}) or {}
	forwarded_for = meta.get('HTTP_X_FORWARDED_FOR')
	if forwarded_for:
		return forwarded_for.split(',')[0].strip()
	return meta.get('REMOTE_ADDR')


def log_activity(*, user=None, action, entity_type, entity_id, old_values=None, new_values=None, request=None):
	try:
		return ActivityLog.objects.create(
			user=user,
			action=action,
			entity_type=entity_type or '',
			entity_id=str(entity_id or ''),
			old_values=old_values,
			new_values=new_values,
			ip_address=get_client_ip(request),
		)
	except Exception:
		return None


create_activity_log = log_activity