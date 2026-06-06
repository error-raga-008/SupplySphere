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
                message = 'You do not have permission to perform this action.'
            elif isinstance(exc, NotAuthenticated):
                message = 'Authentication required.'
            elif isinstance(exc, AuthenticationFailed) and 'invalid' in lowered_message:
                message = 'Invalid credentials'
            return Response({'detail': message}, status=getattr(exc, 'status_code', 400))
        return response

    if isinstance(exc, PermissionDenied):
        response.data = {'detail': 'You do not have permission to perform this action.'}
    elif isinstance(exc, AuthenticationFailed):
        response.data = {'detail': 'Invalid credentials'}
    elif isinstance(exc, NotAuthenticated):
        response.data = {'detail': 'Authentication required.'}
    elif isinstance(exc, (InvalidToken, TokenError)):
        detail = getattr(exc, 'detail', None) or str(exc)
        message = 'Token expired' if 'expired' in str(detail).lower() else 'Invalid token'
        response.data = {'detail': message}

    return response