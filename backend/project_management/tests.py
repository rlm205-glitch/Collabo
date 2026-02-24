from django.http import request
from django.test import TestCase
from django.urls import reverse
import json

from project_management.views import get_project
from .models import Project
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

        deletion_response = self.client.post(
            path=reverse("delete_project"),
            data=json.dumps({
                "id": 2,
            }),
            content_type="application/json"
        )

        for (id, (title, _, _, _)) in enumerate(testcases, start=1):
            response = self.client.post(
                path=reverse("get_project"),
                data=json.dumps({
                    "id": id
                }),
                content_type="application/json"
            )

            if not id == 2:
                self.assertEqual(response.json().get("project", {}).get("title", ""), title)
            else:
                self.assertEqual(response.json().get("success"), False)


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
            data=json.dumps({"id": 1}),
            content_type="application/json"
        )

        _ = self.client.post(
            path=reverse("join_project"),
            data=json.dumps({"id": 2}),
            content_type="application/json"
        )

        _ = self.client.login(username="project joiner two", password="TestPswd123!")

        _ = self.client.post(
            path=reverse("join_project"),
            data=json.dumps({"id": 2}),
            content_type="application/json"
        )

        project1 = Project.objects.get(id=1)
        project2 = Project.objects.get(id=2)

        self.assertEqual(len(project1.members.all()), 2)
        self.assertEqual(len(project2.members.all()), 3)
