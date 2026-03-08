import json
from django.test import TestCase
from django.urls import reverse
from django.core import mail
from django.contrib.auth.models import User
from .models import EmailVerificationToken, PasswordResetToken
import hashlib

SUCCESS: int = 200
FAILURE: int = 400

class ForgotPasswordTests(TestCase):

    def setUp(self):
        # create a verified user to test with
        self.user = User.objects.create_user(
            username="xaj3@case.edu",
            email="xaj3@case.edu",
            password="Password123!",
            is_active=True
        )

    def test_forgot_password_valid_email(self):
        # should return 200 even for a valid email
        response = self.client.post(
            path="/authentication/forgot-password/",
            data=json.dumps({"email": "xaj3@case.edu"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, SUCCESS)

    def test_forgot_password_nonexistent_email(self):
        # should still return 200 so we don't leak whether email exists
        response = self.client.post(
            path="/authentication/forgot-password/",
            data=json.dumps({"email": "nobody@case.edu"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, SUCCESS)

    def test_forgot_password_sends_email(self):
        # check that an email is actually sent when a valid user requests reset
        self.client.post(
            path="/authentication/forgot-password/",
            data=json.dumps({"email": "xaj3@case.edu"}),
            content_type="application/json"
        )
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("reset", mail.outbox[0].subject.lower())

    def test_forgot_password_no_email_sent_for_unknown_user(self):
        # no email should be sent if the account doesn't exist
        self.client.post(
            path="/authentication/forgot-password/",
            data=json.dumps({"email": "ghost@case.edu"}),
            content_type="application/json"
        )
        self.assertEqual(len(mail.outbox), 0)

    def test_forgot_password_wrong_method(self):
        # only POST should be accepted
        response = self.client.get("/authentication/forgot-password/")
        self.assertEqual(response.status_code, FAILURE)

    def test_reset_password_invalid_token(self):
        # garbage token should return 400
        response = self.client.post(
            path="/authentication/reset-password/",
            data=json.dumps({"token": "faketoken123", "password": "NewPassword1!"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, FAILURE)

    def test_reset_password_weak_password(self):
        # create a real token for the user
        import secrets
        raw_token = secrets.token_urlsafe(16)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        from django.utils import timezone
        from datetime import timedelta
        PasswordResetToken.objects.create(
            user=self.user,
            token_hash=token_hash,
            expires_at=timezone.now() + timedelta(hours=1)
        )

        # weak password should fail Django's validators
        response = self.client.post(
            path="/authentication/reset-password/",
            data=json.dumps({"token": raw_token, "password": "123"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, FAILURE)

    def test_reset_password_success(self):
        # valid token + strong password should work
        import secrets
        raw_token = secrets.token_urlsafe(16)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        from django.utils import timezone
        from datetime import timedelta
        PasswordResetToken.objects.create(
            user=self.user,
            token_hash=token_hash,
            expires_at=timezone.now() + timedelta(hours=1)
        )

        response = self.client.post(
            path="/authentication/reset-password/",
            data=json.dumps({"token": raw_token, "password": "NewStrongPass1!"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, SUCCESS)


class EmailVerificationTests(TestCase):

    def test_registration_sends_verification_email(self):
        # registering should trigger a verification email
        self.client.post(
            path="/authentication/register/",
            data=json.dumps({"email": "xaj3@case.edu", "password": "Password123!",
                             "first_name": "John", "last_name": "Smith"}),
            content_type="application/json"
        )
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("verify", mail.outbox[0].subject.lower())

    def test_verify_email_invalid_token(self):
        # bad token should return 400
        response = self.client.post(
            path="/authentication/verify-email/",
            data=json.dumps({"token": "notarealtoken"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, FAILURE)

    def test_verify_email_no_token(self):
        # missing token should return 400
        response = self.client.post(
            path="/authentication/verify-email/",
            data=json.dumps({}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, FAILURE)

    def test_verify_email_success(self):
        # register a user, grab their token, verify it
        self.client.post(
            path="/authentication/register/",
            data=json.dumps({"email": "xaj3@case.edu", "password": "Password123!",
                             "first_name": "John", "last_name": "Smith"}),
            content_type="application/json"
        )

        user = User.objects.get(username="xaj3@case.edu")
        token_rec = EmailVerificationToken.objects.get(user=user)

        # reverse the hash to get raw token from the email link
        reset_link = mail.outbox[0].body
        raw_token = reset_link.split("token=")[1].strip()

        response = self.client.post(
            path="/authentication/verify-email/",
            data=json.dumps({"token": raw_token}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, SUCCESS)

        # user should now be active
        user.refresh_from_db()
        self.assertTrue(user.is_active)

class AuthenticationTests(TestCase):
    def test_user_registration(self):
        testcases = [
            ("Xander", "Jhaveri", "xaj3@case.edu", "Pswd123!", SUCCESS),
            ("Jerk", "Person", "jerk@cwru.edu", "ValidPswd1", FAILURE),
            ("Xander", "Two", "xaj3@case.edu", "RepeatRegister2", FAILURE),
            ("Insecure", "Student", "insecure-student@case.edu", "ugh", FAILURE),
            ("Nobody", "Nobody", "@case.edu", "theSchool", FAILURE),
        ]

        for (first_name, last_name, email, password, expected) in testcases:
            json_data = {"first_name": first_name, "last_name": last_name, "email": email, "password": password}

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
            ("Xander", "Jhaveri", "xaj3@case.edu", "Password1"),
            ("AAA", "SSS","als8@case.edu", "Password1"),
            ("Mean", "Person", "threat@cwru.edu", "Password1")
        ]

        testcases = [
            ("xaj3@case.edu", "Password1", SUCCESS),
            ("als8@case.edu", "Password1", SUCCESS),
            ("threat@cwru.edu", "Password1", FAILURE),
            ("xaj4@case.edu", "Password1", FAILURE),
        ]

        for (first_name, last_name, email, password) in db_data:
            json_data = {"first_name": first_name, "last_name": last_name, "email": email, "password": password}

            _ = self.client.post(
                path=reverse("register_user"),
                data=json.dumps(json_data),
                content_type="application/json"
            )
            # activate the user so they can log in without email verification
            try:
                u = User.objects.get(username=email)
                u.is_active = True
                u.save()
            except User.DoesNotExist:
                pass

        for (email, password, expected) in testcases:
            json_data = {"email": email, "password": password}

            response = self.client.post(
                path=reverse("login_user"),
                data=json.dumps(json_data),
                content_type="application/json"
            )
            
            self.assertEqual(response.status_code, expected, f"Email: {email}, Expected Response: {expected}\n{response.content}")
