"""Database models for projects, reports, and join requests."""

from typing import override

from django.conf import settings
from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model


class Project(models.Model):
    """A collaboration project posted by a CWRU student.

    Attributes:
        title: Short display name for the project (max 30 chars).
        short_description: One-line summary shown on project cards.
        author: Username of the user who created the project.
        author_id: Primary key of the creating user.
        extended_description: Full project description shown on the detail page.
        preferred_skills: JSON list of desired skills.
        project_type: Category label (e.g. "Research", "App Dev").
        workload_per_week: Expected weekly time commitment.
        preferred_contact_method: How the author prefers to be contacted.
        contact_information: Contact details for the author.
        creation_time: Timestamp set automatically on creation.
        updated_time: Timestamp updated automatically on each save.
        members: ManyToMany set of users who have joined the project.
    """

    title = models.TextField(max_length=30, help_text='Project Title')
    short_description = models.TextField(max_length=500, help_text='Short Project Description', default="")
    author = models.TextField(max_length=70, help_text='Project Creator')
    author_id = models.IntegerField()
    extended_description = models.TextField(max_length=10000, help_text='Project Description', default="")

    preferred_skills = models.JSONField(default=list)
    project_type = models.TextField(max_length=50, help_text='Project Type', default="Other")
    workload_per_week = models.TextField(max_length=50, help_text='Workload', default="")
    preferred_contact_method = models.TextField(max_length=50, help_text='Preferred Contact Method', default="")
    contact_information = models.TextField(max_length=100, help_text='Contact Information', default="")

    creation_time = models.DateTimeField(auto_now_add=True)
    updated_time = models.DateTimeField(auto_now=True)

    members = models.ManyToManyField(settings.AUTH_USER_MODEL, "projects", blank=True)

    @override
    def __str__(self) -> str:
        return f"Project by {self.author}: {self.title} - '{self.short_description}'"


class Report(models.Model):
    """A user-submitted report flagging a project for review.

    Attributes:
        project: The project being reported.
        reporter: The user who filed the report.
        reason: Category of the report (spam, inappropriate, etc.).
        description: Optional free-text details from the reporter.
        created_at: Timestamp set automatically on creation.
    """

    REASON_CHOICES = [
        ("spam", "Spam"),
        ("inappropriate", "Inappropriate Content"),
        ("misleading", "Misleading Information"),
        ("harassment", "Harassment"),
        ("other", "Other"),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="reports")
    reporter = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="filed_reports")
    reason = models.TextField(max_length=50, choices=REASON_CHOICES)
    description = models.TextField(max_length=1000, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("project", "reporter")]

    @override
    def __str__(self) -> str:
        return f"Report on '{self.project.title}' by {self.reporter.username} - {self.reason}"


class Join_Request(models.Model):
    """A request by a user to join an existing project.

    Attributes:
        project: The project the user wants to join.
        requester: The user submitting the request.
        message: Optional message to the project members.
        created_at: Timestamp set automatically on creation.
        status: Current state — 'pending', 'approved', or 'rejected'.
    """

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="join_request")
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20,
                              choices=[("pending", "pending"), ("approved", "approved"), ("rejected", "rejected")],
                              default="pending")
