from django.http import request
from django.test import TestCase            # creates tmp database so doesnt mess with real one
from django.urls import reverse
import json

from project_management.views import get_project
from .models import Project
from django.contrib.auth import get_user, get_user_model


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

        get_user_model().objects.create_user(
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

        _ = get_user_model().objects.create_user(
            username="project joiner",
            password="TestPswd123!"
        )

        _ = get_user_model().objects.create_user(
            username="project joiner two",
            password="TestPswd123!"
        )

        _ = get_user_model().objects.create_user(
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

    def test_list_projects(self):
        testcases = [
            (
                "Atlas",
                "A lightweight project management dashboard for small teams",
                "Atlas is a web-based dashboard designed to help small development teams track tasks, deadlines, and progress without the overhead of enterprise tools. It emphasizes simplicity, speed, and clarity while still supporting core collaboration features.",
                "Python, Django, REST APIs, PostgreSQL, Git",
                "Mobile App",
                "5-10 hours"
            ),

            (
                "Gridfall",
                "A roguelike puzzle game built around modular block mechanics",
                "Gridfall is a turn-based puzzle roguelike where players place procedurally generated block pieces onto a grid. The game focuses on emergent mechanics, replayability, and strategic decision-making.",
                "Godot, GDScript, Game Design, Algorithms, Debugging",
                "Game",
                "1-2 hours"
            ),

            (
                "Signal",
                "Real-time chat application with end-to-end encryption",
                "Signal is a real-time messaging platform focused on privacy and performance. It supports group chats, media sharing, and secure authentication while maintaining low latency and scalability.",
                "JavaScript, WebSockets, Cryptography, Node.js, System Design",
                "Web App",
                "10+ hours"
            ),
        ]

        get_user_model().objects.create_user(
            username="testuser",
            password="TestPswd123!"
        )

        _ = self.client.login(username="testuser", password="TestPswd123!")

        for (title, short_description, extended_description, preferred_skills, project_type, workload_per_week) in testcases:
            json_data = {
                "title": title,
                "short_description": short_description,
                "extended_description": extended_description,
                "preferred_skills": preferred_skills,
                "project_type": project_type,
                "workload_per_week": workload_per_week,
                "preferred_contact_method": "email",
                "contact_information": "testuser@case.edu",
            }

            response = self.client.post(
                path=reverse("create_project"),
                data=json.dumps(json_data),
                content_type="application/json"
            )

            self.assertNotEqual(response.status_code // 100, 4)

        response = self.client.post(
            path=reverse("list_projects"),
            data=json.dumps({}),
            content_type="application/json"
        )

        self.assertEqual(response.json().get("success"), True)
        self.assertEqual(response.json().get("project_count"), 3)

        returned_projects = response.json().get("condensed_projects", [])
        returned_titles = [project.get("title", "") for project in returned_projects]

        self.assertEqual(returned_titles, sorted([title for (title, _, _, _, _, _) in testcases]))

        filter_response = self.client.post(
            path=reverse("list_projects"),
            data=json.dumps({
                "filters": {
                    "project_type": "Game"
                }
            }),
            content_type="application/json"
        )

        self.assertEqual(filter_response.json().get("success"), True)
        self.assertEqual(filter_response.json().get("project_count"), 1)
        self.assertEqual(
            filter_response.json().get("condensed_projects", [])[0].get("title", ""),
            "Gridfall"
        )

# ------------------------------------------------------------
# Tests the get_project endpoint.
# Creates projects, requests each one by ID using the API,
# and verifies the full project details are returned correctly,
# including project fields and member information.
# ------------------------------------------------------------
    def test_get_project(self):
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

        get_user_model().objects.create_user(
            username="testuser",
            password="TestPswd123!"
        )

        second_user = get_user_model().objects.create_user(
            username="seconduser",
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

        _ = self.client.login(username="seconduser", password="TestPswd123!")

        _ = self.client.post(
            path=reverse("join_project"),
            data=json.dumps({"id": 2}),
            content_type="application/json"
        )

        for (id, (title, short_description, extended_description, preferred_skills)) in enumerate(testcases, start=1):
            response = self.client.post(
                path=reverse("get_project"),
                data=json.dumps({
                    "id": id
                }),
                content_type="application/json"
            )

            project = response.json().get("project", {})

            self.assertEqual(response.json().get("success"), True)
            self.assertEqual(project.get("title", ""), title)
            self.assertEqual(project.get("short_description", ""), short_description)
            self.assertEqual(project.get("extended_description", ""), extended_description)
            self.assertEqual(project.get("preferred_skills", ""), preferred_skills)
            self.assertEqual(project.get("author", ""), "testuser")

            if id == 1:
                self.assertEqual(len(project.get("members", [])), 1)
            else:
                self.assertEqual(len(project.get("members", [])), 2)

        bad_response = self.client.post(
            path=reverse("get_project"),
            data=json.dumps({
                "id": 999
            }),
            content_type="application/json"
        )

        self.assertEqual(bad_response.json().get("success"), False)
