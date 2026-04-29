"""Custom decorators for view-level authorization checks."""

from functools import wraps

from django.http import JsonResponse


def staff_required(view_func):
    """Restrict a view to users with is_staff=True.

    Must be applied after @login_required so that request.user is already
    populated. Returns a 403 JSON response for non-staff users.

    Args:
        view_func: The Django view function to wrap.

    Returns:
        The wrapped view that enforces staff-only access.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_staff:
            return JsonResponse(
                {"success": False, "error": "Admin access required"},
                status=403,
            )
        return view_func(request, *args, **kwargs)
    return wrapper
