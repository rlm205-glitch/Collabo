"""Helper functions for creating and sending join-request notifications."""

import email

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail

from .models import Project, Join_Request


def create_join_request(project: Project, user: User, message: str) -> tuple[Join_Request, bool]:
    """Create a new pending join request if one does not already exist.

    Uses get_or_create so duplicate submissions are idempotent.

    Args:
        project: The project the user wants to join.
        user: The user submitting the request.
        message: An optional message to the project members.

    Returns:
        A (join_request, created) tuple where created is True if a new
        record was inserted, False if one already existed.
    """
    return Join_Request.objects.get_or_create(
        project=project,
        requester=user,
        status="pending",
        defaults={"message": message},
    )


def get_notification_recipients(project: Project, requester: User) -> list[str]:
    """Return email addresses of all project members except the requester.

    Args:
        project: The project whose members should be notified.
        requester: The user who submitted the join request (excluded).

    Returns:
        A sorted list of unique, non-empty email strings.
    """
    requester_email = requester.email or ""
    recipients = project.members.exclude(email="").values_list("email", flat=True)
    return sorted({r for r in recipients if r and r != requester_email})


def send_join_request_email(project: Project, requester: User, message: str, recipients: list[str]) -> None:
    """Email all project members to notify them of a new join request.

    Does nothing if the recipients list is empty.

    Args:
        project: The project being requested to join.
        requester: The user who submitted the request.
        message: The optional message included with the request.
        recipients: List of email addresses to notify.
    """
    if not recipients:
        return

    user_display = requester.get_full_name() or requester.username

    subject = f"Join Request: {project.title}"
    body = (
        f"{user_display} has requested to join {project.title}.\n\n "
        f"Message from {user_display}: \n{message or 'no message'}\n"
    )

    send_mail(
        subject=subject,
        message=body,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@cwru-collab.com"),
        recipient_list=recipients,
        fail_silently=False,
    )


def send_join_decision_email(project: Project, requester: User, decision: str, reply_message: str = "") -> None:
    """Email the requester with the outcome of their join request.

    Args:
        project: The project the request was made for.
        requester: The user who submitted the original request.
        decision: Either 'approved' or 'rejected'.
        reply_message: Optional message from the project member who decided.
    """
    if not requester:
        return
    user_display = requester.get_full_name() or requester.username
    subject = f"Join Request Update: {project.title}"
    if decision == "approved":
        body = (
            f"Hey {user_display}!,\n\n"
            f"Your request to join '{project.title}' has been approved.\n\n"
            f"{reply_message or ''}"
        )
    else:
        body = (
            f"Hey {user_display},\n\n"
            f"Your request to join '{project.title}' has been rejected.\n\n"
            f"{reply_message or ''}"
        )
    send_mail(
        subject=subject,
        message=body,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@cwru-collab.com"),
        recipient_list=[requester.email],
        fail_silently=False,
    )
