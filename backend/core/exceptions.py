from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated, PermissionDenied
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is None:
        if isinstance(exc, (AuthenticationFailed, NotAuthenticated, PermissionDenied, InvalidToken, TokenError)):
            detail = getattr(exc, 'detail', None) or str(exc)
            message = str(detail)
            lowered_message = message.lower()
            if isinstance(exc, (InvalidToken, TokenError)) and 'expired' in lowered_message:
                message = 'Token expired'
            elif isinstance(exc, PermissionDenied):
                message = 'Permission denied'
            elif isinstance(exc, AuthenticationFailed) and 'invalid' in lowered_message:
                message = 'Invalid credentials'
            return Response({'error': message}, status=getattr(exc, 'status_code', 400))
        return response

    if isinstance(exc, PermissionDenied):
        response.data = {'error': 'Permission denied'}
    elif isinstance(exc, AuthenticationFailed):
        response.data = {'error': 'Invalid credentials'}
    elif isinstance(exc, NotAuthenticated):
        response.data = {'error': 'Authentication required'}
    elif isinstance(exc, (InvalidToken, TokenError)):
        detail = getattr(exc, 'detail', None) or str(exc)
        message = 'Token expired' if 'expired' in str(detail).lower() else 'Invalid token'
        response.data = {'error': message}

    return response