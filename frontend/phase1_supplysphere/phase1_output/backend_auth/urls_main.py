from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/',      admin.site.urls),
    path('api/auth/',   include('core.urls')),   # auth endpoints
    # Phase 2+: path('api/', include('core.api_urls')),
]
