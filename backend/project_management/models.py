from typing import override
from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    title = models.TextField(max_length=30, help_text='Project Title')
    subtitle = models.TextField(max_length=70, help_text='Short Project Subtitle')
    author = models.TextField(max_length=70, help_text='Project Creator')
    description = models.TextField(max_length=10000, help_text='Project Description')
    preferred_skills = models.TextField(max_length=300, help_text='Preferred Skills')

    members = models.ManyToManyField(User, "projects", blank=True)

    @override
    def __str__(self) -> str:
        return f"{self.title} - {self.author}"
