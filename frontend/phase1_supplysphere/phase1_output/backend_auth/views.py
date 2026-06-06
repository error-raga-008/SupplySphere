from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    ForgotPasswordSerializer,
)


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/  →  { access, refresh, user }"""
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """POST /api/auth/register/"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {'message': 'Account created successfully.', 'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request):
    """POST /api/auth/forgot-password/"""
    serializer = ForgotPasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']
    try:
        user = User.objects.get(email=email)
        uid   = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        send_mail(
            subject='SupplySphere – Password Reset',
            message=f'Click the link to reset your password:\n{reset_url}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=True,
        )
    except User.DoesNotExist:
        pass  # Don't reveal whether email exists

    return Response({'message': 'If that email exists, a reset link has been sent.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """POST /api/auth/logout/  — blacklists the refresh token"""
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Logged out successfully.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """GET /api/auth/me/  — returns current user"""
    return Response(UserSerializer(request.user).data)
