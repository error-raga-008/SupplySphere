from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        if response.status_code == 401:
            response.data = {'detail': 'Authentication required.'}
        elif response.status_code == 403:
            detail = response.data.get('detail', 'You do not have permission to perform this action.')
            response.data = {'detail': str(detail)}
    return response
