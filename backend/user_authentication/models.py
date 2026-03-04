from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db import models

class CollaboUser(AbstractUser):
    major = models.TextField(max_length=50, help_text='Major', default="")
    skills = models.JSONField(default=list)
    interests = models.JSONField(default=list)
    availability =  models.TextField(max_length=500, help_text='Availability', default="")
    preferred_contact_method = models.TextField(max_length=50, help_text='Preferred Contact Method', default="")
    contact_information = models.TextField(max_length=100, help_text='Contact Information', default="")

    def __str__(self):
        return self.email
