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

def get_notification_recipient(project: Project, requester: User)-> List[str]:
    """Returns a list of emails of all the recipients of the join notification. As long as they're not the requester's email."""
    requester_email = requester.email or ""
    try:
        owner = User.objects.get(id=project.author_id)
    except User.DoesNotExist:
        return []

    owner_email = owner.email or ""
    if owner_email and owner_email != requester_email:
        return [owner_email]

    return []

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
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL"),
        recipient_list=recipients,
        fail_silently=False,
    )

def send_join_decision_email(project: Project, requester: User, decision:str, reply_message: str="") -> None:
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
    if requester.email:
        send_mail(
            subject=subject,
            message=body,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL"),
            recipient_list=[requester.email],
            fail_silently=False,
        )

    if decision == "approved":
        try:
            owner = User.objects.get(id=project.author_id)
            owner_email = owner.email or ""
        except User.DoesNotExist:
            owner_email = ""

        member_emails = []
        for member in project.members.all():
            if not member.email:
                continue
            if member.email == requester.email:
                continue
            if owner_email and member.email == owner_email:
                continue
            member_emails.append(member.email)

        if member_emails:
            send_mail(
                subject=f"New Member Joined: {project.title}",
                message=f"{user_display} has been added to {project.title}.\n\n{reply_message or ''}",
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL"),
                recipient_list=member_emails,
                fail_silently=False,
            )