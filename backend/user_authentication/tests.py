import json
from django.test import TestCase
from django.urls import reverse

SUCCESS: int = 200
FAILURE: int = 400

class AuthenticationTests(TestCase):
    def test_user_registration(self):
        testcases = [
            ("xaj3@case.edu", "Pswd123!", SUCCESS),
            ("jerk@cwru.edu", "ValidPswd1", FAILURE),
            ("xaj3@case.edu", "RepeatRegister2", FAILURE),
            ("insecure-student@case.edu", "ugh", FAILURE),
            ("@case.edu", "theSchool", FAILURE),
        ]

        for (email, password, expected) in testcases:
            json_data = {"email": email, "password": password}

            response = self.client.post(
                path=reverse("register_user"),
                data=json.dumps(json_data),
                content_type="application/json"
            )

            
            self.assertEqual(response.status_code, expected, f"- Email: {email},\n- Password: {password},\n- Expected Response: {expected}\n{response.content}")

    def test_differentiate_case_vs_external_email(self):
        testcases = [ 
            ("xaj3@case.edu", SUCCESS),
            ("xaj3@cwru.edu", FAILURE),
            ("notcase@gmail.com", FAILURE),
            ("sgd2983@case.edu", SUCCESS),
            ("plural@case.edus", FAILURE),
            ("double@trouble@case.edu", FAILURE)
        ]

        json_data = { "password": "ValidPswd123" }

        for (email, expected) in testcases:
            json_data["email"] = email

            response = self.client.post(
                path=reverse("register_user"),
                data=json.dumps(json_data),
                content_type="application/json"
            )

            self.assertEqual(response.status_code, expected, f"Email: {email}, Expected Response: {expected}\n{response.content}")

    def test_user_login(self):
        db_data = [
            ("xaj3@case.edu", "Password1"),
            ("als8@case.edu", "Password1"),
            ("threat@cwru.edu", "Password1")
        ]

        testcases = [
            ("xaj3@case.edu", "Password1", SUCCESS),
            ("als8@case.edu", "Password1", SUCCESS),
            ("threat@cwru.edu", "Password1", FAILURE),
            ("xaj4@case.edu", "Password1", FAILURE),
        ]

        for (email, password) in db_data:
            json_data = {"email": email, "password": password}

            _ = self.client.post(
                path=reverse("register_user"),
                data=json.dumps(json_data),
                content_type="application/json"
            )

        for (email, password, expected) in testcases:
            json_data = {"email": email, "password": password}

            response = self.client.post(
                path=reverse("login_user"),
                data=json.dumps(json_data),
                content_type="application/json"
            )
            
            self.assertEqual(response.status_code, expected, f"Email: {email}, Expected Response: {expected}\n{response.content}")
