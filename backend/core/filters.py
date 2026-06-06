from django_filters import rest_framework as filters

from core.models import ActivityLog


class ActivityLogFilter(filters.FilterSet):
	username = filters.CharFilter(field_name='user__name', lookup_expr='icontains')
	action = filters.CharFilter(field_name='action', lookup_expr='iexact')
	entity_type = filters.CharFilter(field_name='entity_type', lookup_expr='iexact')
	start_date = filters.DateFilter(field_name='created_at', lookup_expr='date__gte')
	end_date = filters.DateFilter(field_name='created_at', lookup_expr='date__lte')

	class Meta:
		model = ActivityLog
		fields = ['username', 'action', 'entity_type', 'start_date', 'end_date']