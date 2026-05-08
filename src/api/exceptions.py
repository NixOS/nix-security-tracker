from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ErrorDetail
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler


def _leaf_to_detail(error: DjangoValidationError) -> ErrorDetail:
    assert error.message is not None
    message = error.message % error.params if error.params else error.message
    return ErrorDetail(message, code=error.code)


def django_to_drf(exc: DjangoValidationError) -> DRFValidationError:
    """
    Map from Django to DRF exceptions.
    Consult the respective source code to verify the mapping:

    https://github.com/django/django/blob/stable/5.2.x/django/core/exceptions.py#L134
    https://github.com/encode/django-rest-framework/blob/3.17.1/rest_framework/exceptions.py#L143
    """
    if hasattr(exc, "error_dict"):
        assert exc.error_dict is not None
        return DRFValidationError(
            detail={
                field: list(DjangoValidationError(errors))  # pyright: ignore[reportArgumentType]
                for field, errors in exc.error_dict.items()
            }
        )

    if hasattr(exc, "message"):
        assert exc.message is not None
        msg = exc.message % exc.params if exc.params else exc.message
        return DRFValidationError(detail=msg, code=exc.code)

    assert exc.error_list is not None
    return DRFValidationError(detail=[_leaf_to_detail(e) for e in exc.error_list])


def custom_exception_handler(exc: Exception, context: dict) -> Response | None:
    if isinstance(exc, DjangoValidationError):
        exc = django_to_drf(exc)
    return exception_handler(exc, context)
