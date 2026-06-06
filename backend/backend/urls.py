from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "message": "SupplySphere API Running"
    })

urlpatterns = [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
    path('api/', include('core.urls')),
    path('admin/', admin.site.urls),
    path('', home),
]