from typing import override
from django.db import models
from django.conf import settings

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
        return f"{self.title} - {self.author}"
