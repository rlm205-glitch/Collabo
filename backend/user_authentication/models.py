from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db import models

class CollaboUser(AbstractUser):
    def __str__(self):
        return self.email # Or any other unique identifier

