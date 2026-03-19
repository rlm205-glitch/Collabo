from django.http import request
from django.test import TestCase
from django.urls import reverse
import json

from project_management.views import get_project
from django.contrib.auth import get_user, get_user_model

class ProfileTests(TestCase):
    def test_update_and_get_profiles(self):
        test_users = [
            ("xaj3@case.edu", "TestPswd123!", "Xander", "Jhaveri", "xaj3@case.edu", "Computer Science", ["Python", "Rust"], ["ML", "Software Engineering"], "Wednesdays", False),
            ("jxb3@case.edu", "TestPswd123!", "Joe", "Bo", "jxb3@case.edu", "Data Science", ["Python", "Stats"], ["ML", "Data"], "Wednesdays", True),
            ("ahh7@case.edu", "TestPswd123!", "Allan", "Human", "ahh7@case.edu", "Data Science", ["Python", "Stats"], ["ML", "Data"], "Wednesdays", False)
        ]

        # update_profile tests
        for (username, password, first_name, last_name, email, major, skills, interests, availability, staff) in test_users:
            get_user_model().objects.create_user(
                username=username,
                password=password,
                is_staff=staff
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
            self.assertEqual(
                get_user_model().objects.get(first_name=first_name).is_staff, staff
            )

        # get_self_profile tests
        for (username, password, first_name, last_name, email, major, skills, interests, availability, staff) in test_users:
            _ = self.client.login(username=email, password=password)


            response = self.client.get(
                path=reverse("get_self_profile"),
            )

            self.assertNotEqual(response.status_code // 100, 4)
            self.assertEqual(response.json().get("major"), major)
            self.assertEqual(response.json().get("interests"), interests)

        # get_profile currently untested
