from functools import wraps

from django.http import JsonResponse


def staff_required(view_func):
    """Restrict access to users with is_staff=True.
    Must be applied after @login_required."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_staff:
            return JsonResponse(
                {"success": False, "error": "Admin access required"},
                status=403,
            )
        return view_func(request, *args, **kwargs)
    return wrapper
