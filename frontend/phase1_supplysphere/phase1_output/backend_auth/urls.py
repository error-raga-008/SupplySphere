from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('login/',           views.LoginView.as_view(),     name='auth-login'),
    path('register/',        views.register_view,           name='auth-register'),
    path('forgot-password/', views.forgot_password_view,    name='auth-forgot-password'),
    path('logout/',          views.logout_view,             name='auth-logout'),
    path('me/',              views.me_view,                 name='auth-me'),
    path('token/refresh/',   TokenRefreshView.as_view(),    name='token-refresh'),
]
