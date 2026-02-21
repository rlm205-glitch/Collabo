from datetime import timezone

from django.core import mail
from django.test import TestCase
from django.urls import reverse
import json
from .models import Project, Join_Request
from django.contrib.auth.models import User


# Create your tests here.
class ProjectTests(TestCase):
    def test_create_project(self):
        testcases = [
            (
                "Atlas",
                "A lightweight project management dashboard for small teams",
                "Atlas is a web-based dashboard designed to help small development teams track tasks, deadlines, and progress without the overhead of enterprise tools. It emphasizes simplicity, speed, and clarity while still supporting core collaboration features.",
                "Python, Django, REST APIs, PostgreSQL, Git"
            ),

            (
                "Gridfall",
                "A roguelike puzzle game built around modular block mechanics",
                "Gridfall is a turn-based puzzle roguelike where players place procedurally generated block pieces onto a grid. The game focuses on emergent mechanics, replayability, and strategic decision-making.",
                "Godot, GDScript, Game Design, Algorithms, Debugging"
            ),

            (
                "Signal",
                "Real-time chat application with end-to-end encryption",
                "Signal is a real-time messaging platform focused on privacy and performance. It supports group chats, media sharing, and secure authentication while maintaining low latency and scalability.",
                "JavaScript, WebSockets, Cryptography, Node.js, System Design"
            ),

            (
                "Nimbus",
                "Cloud-based file storage and synchronization service",
                "Nimbus provides seamless cloud file storage with automatic synchronization across devices. The project emphasizes fault tolerance, efficient data transfer, and secure access control.",
                "AWS, Docker, Linux, Networking, Distributed Systems"
            ),

            (
                "Lens",
                "AI-assisted study tool for summarizing academic content",
                "Lens helps students digest complex academic material by generating concise summaries and concept maps. The application integrates NLP models with an intuitive UI for focused learning.",
                "Python, Machine Learning, NLP, React, Data Processing"
            )
        ]

        _ = User.objects.create_user(
            username="testuser",
            password="TestPswd123!"
        )

        _ = self.client.login(username="testuser", password="TestPswd123!")

        for (title, short_description, extended_description, preferred_skills) in testcases:
            json_data = {
                "title": title,
                "short_description": short_description,
                "extended_description": extended_description,

                "preferred_skills": preferred_skills,
                "project_type": "Mobile App",
                "workload_per_week": "5-10 hours",
                "preferred_contact_method": "email",
                "contact_information": "testuser@case.edu",
            }

            response = self.client.post(
                path=reverse("create_project"),
                data=json.dumps(json_data),
                content_type="application/json"
            )

            self.assertNotEqual(response.status_code // 100, 4)

        for (id, (title, _, _, _)) in enumerate(testcases, start=1):
            project = Project.objects.get(id=id)

            self.assertEqual(project.title, title)

    def test_join_project(self):
        testcases = [
            (
                "Atlas",
                "A lightweight project management dashboard for small teams",
                "Atlas is a web-based dashboard designed to help small development teams track tasks, deadlines, and progress without the overhead of enterprise tools. It emphasizes simplicity, speed, and clarity while still supporting core collaboration features.",
                "Python, Django, REST APIs, PostgreSQL, Git"
            ),

            (
                "Gridfall",
                "A roguelike puzzle game built around modular block mechanics",
                "Gridfall is a turn-based puzzle roguelike where players place procedurally generated block pieces onto a grid. The game focuses on emergent mechanics, replayability, and strategic decision-making.",
                "Godot, GDScript, Game Design, Algorithms, Debugging"
            ),
        ]

        _ = User.objects.create_user(
            username="project joiner",
            password="TestPswd123!"
        )

        _ = User.objects.create_user(
            username="project joiner two",
            password="TestPswd123!"
        )

        _ = User.objects.create_user(
            username="project creator",
            password="TestPswd123!"
        )

        _ = self.client.login(username="project creator", password="TestPswd123!")

        for (title, short_description, extended_description, preferred_skills) in testcases:
            json_data = {
                "title": title,
                "short_description": short_description,
                "extended_description": extended_description,

                "preferred_skills": preferred_skills,
                "project_type": "Mobile App",
                "workload_per_week": "5-10 hours",
                "preferred_contact_method": "email",
                "contact_information": "testuser@case.edu",
            }

            response = self.client.post(
                path=reverse("create_project"),
                data=json.dumps(json_data),
                content_type="application/json"
            )

            self.assertNotEqual(response.status_code // 100, 4)

        _ = self.client.login(username="project joiner", password="TestPswd123!")

        _ = self.client.post(
            path=reverse("join_project"),
            data=json.dumps({"project_id": 1}),
            content_type="application/json"
        )

        _ = self.client.post(
            path=reverse("join_project"),
            data=json.dumps({"project_id": 2}),
            content_type="application/json"
        )

        _ = self.client.login(username="project joiner two", password="TestPswd123!")

        _ = self.client.post(
            path=reverse("join_project"),
            data=json.dumps({"project_id": 2}),
            content_type="application/json"
        )

        project1 = Project.objects.get(id=1)
        project2 = Project.objects.get(id=2)

        self.assertEqual(len(project1.members.all()), 2)
        self.assertEqual(len(project2.members.all()), 3)


class JoinProjectRequestTest(TestCase):
    def setUp(self):
        #requester
        self.user = User.objects.create_user(
            username="tester",
            password="password",
            email="tester@case.edu"
        )
        #recipient
        self.owner = User.objects.create_user(
            username="owner",
            password="password",
            email="owner@case.edu"
        )
        self.project = Project.objects.create(
            title="Test Project",
            author="admin"
        )
        self.project.members.add(self.owner)
        self.client.force_login(self.user)

    def test_join_project(self):
        response = self.client.post(
            reverse("join_project"),
            data= json.dumps({"project_id": self.project.id,
                              "message": "Hey I'd like to join this project!"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        # email sent?
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Join Request:", mail.outbox[0].subject)
        self.assertIn(self.owner.email, mail.outbox[0].to)

class ApproveTest(TestCase):
    def setUp(self):
        #requester
        self.user = User.objects.create_user(
            username="tester",
            password="password",
            email="tester@case.edu"
        )
        #owner
        self.owner = User.objects.create_user(
            username="owner",
            password="password",
            email="owner@case.edu"
        )
        self.project = Project.objects.create(
            title="Test Project",
            author="admin"
        )
        self.project.members.add(self.owner)
        self.client.force_login(self.owner)

    def test_approve_project(self):
        self.join_request = Join_Request.objects.create(
            project=self.project,
            requester=self.user,
            status="pending",
            message="Hey I'd like to join this project!",
        )

        response = self.client.post(
            reverse("decide_join_request"),
            data=json.dumps({
                    "join_request_id": self.join_request.id,
                    "decision": "approved",
                    "reply_message": "Welcome!"
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        # refresh from DB
        self.join_request.refresh_from_db()

        # status updated
        self.assertEqual(self.join_request.status, "approved")

        # requester added to members
        self.assertTrue(self.project.members.filter(id=self.user.id).exists())



