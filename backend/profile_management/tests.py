from django.http import request
from django.test import TestCase
from django.urls import reverse
import json

from project_management.views import get_project
from django.contrib.auth import get_user, get_user_model

class ProfileTests(TestCase):
    def test_update_profile(self):
        test_users = [
            ("Test User1", "TestPswd123!", "Xander", "Jhaveri", "xaj3@case.edu", "Computer Science", ["Python", "Rust"], ["ML", "Software Engineering"], "Wednesdays"),
            ("Test User2", "TestPswd123!", "Aris", "Jhaveri", "aaj3@case.edu", "Data Science", ["Python", "Stats"], ["ML", "Data"], "Wednesdays")

        ]

        for (username, password, first_name, last_name, email, major, skills, interests, availability) in test_users:
            get_user_model().objects.create_user(
                username=username,
                password=password
            )

            _ = self.client.login(username=username, password=password)

            json_data = {
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "major": major,
                "skills": skills,
                "interests": interests,
                "availability": availability
            }

            response = self.client.post(
                path=reverse("update_profile"),
                data=json.dumps(json_data),
                content_type="application/json"
            )

            self.assertNotEqual(response.status_code // 100, 4)
            self.assertEqual(response.json().get("success"), True)
            self.assertEqual(
                get_user_model().objects.get(first_name=first_name).email, email
            )



