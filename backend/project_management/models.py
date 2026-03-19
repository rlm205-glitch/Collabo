from typing import override
from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

class Project(models.Model):
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
