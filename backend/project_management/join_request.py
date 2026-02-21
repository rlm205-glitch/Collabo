import email
from typing import Tuple, List

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail

from .models import Project, Join_Request

def create_join_request(project: Project, user: User, message: str )-> Tuple[Join_Request, bool]:
    """ Creates a new pending join request if one does not exist. Create or get an instance of the join request model."""
    return Join_Request.objects.get_or_create(
        project=project,
        requester=user,
        status = "pending",
        defaults={"message": message},   #not a lookup, only set when creating
    )

def get_notification_recipients(project: Project, requester: User)-> List[str]:
    """Returns a list of emails of all the recipients of the join notification. As long as they're not the requester's email."""
    requester_email = requester.email or ""
    recipients = project.members.exclude(email="").values_list("email", flat=True)

    return sorted({recipient for recipient in recipients if recipient and recipient !=requester_email})

def send_join_request_email(project: Project, requester: User, message: str, recipients:List[str]) -> None:
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

def send_join_decision_email(project: Project, requester: User, decision:str, reply_message: str="") -> None:
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