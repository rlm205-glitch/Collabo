from django.http import request
from django.test import TestCase            # creates tmp database so doesnt mess with real one
from django.urls import reverse
import json

from project_management.views import get_project
from .models import Project, Report
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model


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
            password="TestPswd123!",
            email="pj1@case.edu"
        )

        _ = get_user_model().objects.create_user(
            username="project joiner two",
            password="TestPswd123!",
            email="pj2@case.edu"
        )

        _ = get_user_model().objects.create_user(
            username="project creator",
            password="TestPswd123!",
            email="pc1@case.edu"
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
            password="TestPswd123!",
            email="testuser@case.edu"
        )

        second_user = get_user_model().objects.create_user(
            username="seconduser",
            password="TestPswd123!",
            email="seconduser@case.edu"
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


class ReportTests(TestCase):
    def test_report_project(self):
        creator = get_user_model().objects.create_user(
            username="creator@case.edu",
            password="TestPswd123!"
        )

        reporter = get_user_model().objects.create_user(
            username="reporter@case.edu",
            password="TestPswd123!"
        )

        second_reporter = get_user_model().objects.create_user(
            username="reporter2@case.edu",
            password="TestPswd123!"
        )

        # Create two projects as creator
        _ = self.client.login(username="creator@case.edu", password="TestPswd123!")

        testcases = [
            ("Spam Project", "This project is spam"),
            ("Good Project", "A legitimate project"),
        ]

        for (title, short_description) in testcases:
            response = self.client.post(
                path=reverse("create_project"),
                data=json.dumps({
                    "title": title,
                    "short_description": short_description,
                    "extended_description": "Extended",
                    "preferred_skills": ["Python"],
                    "project_type": "Research",
                    "workload_per_week": "5-10 hours",
                    "preferred_contact_method": "email",
                    "contact_information": "creator@case.edu",
                }),
                content_type="application/json"
            )
            self.assertNotEqual(response.status_code // 100, 4)

        project1_id = 1
        project2_id = 2

        # Report with valid reason as reporter
        _ = self.client.login(username="reporter@case.edu", password="TestPswd123!")

        response = self.client.post(
            path=reverse("report_project"),
            data=json.dumps({
                "project_id": project1_id,
                "reason": "spam",
                "description": "This looks like spam",
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])
        self.assertIn("report_id", response.json())

        # Duplicate report on same project should fail
        response = self.client.post(
            path=reverse("report_project"),
            data=json.dumps({
                "project_id": project1_id,
                "reason": "harassment",
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"], "You have already reported this project")

        # Same reporter can report a different project
        response = self.client.post(
            path=reverse("report_project"),
            data=json.dumps({
                "project_id": project2_id,
                "reason": "misleading",
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])

        # Different reporter can report the same project
        _ = self.client.login(username="reporter2@case.edu", password="TestPswd123!")

        response = self.client.post(
            path=reverse("report_project"),
            data=json.dumps({
                "project_id": project1_id,
                "reason": "inappropriate",
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])

        # Invalid reason should fail
        response = self.client.post(
            path=reverse("report_project"),
            data=json.dumps({
                "project_id": project2_id,
                "reason": "invalid_reason",
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()["success"])

        # Nonexistent project should fail
        response = self.client.post(
            path=reverse("report_project"),
            data=json.dumps({
                "project_id": 99999,
                "reason": "spam",
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)

        # Verify total reports created
        self.assertEqual(Report.objects.count(), 3)

    def test_list_reports(self):
        creator = get_user_model().objects.create_user(
            username="creator@case.edu",
            password="TestPswd123!"
        )

        reporter = get_user_model().objects.create_user(
            username="reporter@case.edu",
            password="TestPswd123!"
        )

        admin = get_user_model().objects.create_user(
            username="admin@case.edu",
            password="AdminPswd123!",
            is_staff=True
        )

        # Create two projects
        _ = self.client.login(username="creator@case.edu", password="TestPswd123!")

        testcases = [
            ("Project Alpha", "First project"),
            ("Project Beta", "Second project"),
        ]

        project_ids = []
        for (title, short_description) in testcases:
            response = self.client.post(
                path=reverse("create_project"),
                data=json.dumps({
                    "title": title,
                    "short_description": short_description,
                    "extended_description": "Extended",
                    "preferred_skills": ["Python"],
                    "project_type": "Research",
                    "workload_per_week": "5-10 hours",
                    "preferred_contact_method": "email",
                    "contact_information": "creator@case.edu",
                }),
                content_type="application/json"
            )
            project_ids.append(response.json()["id"])

        # File reports on both projects
        _ = self.client.login(username="reporter@case.edu", password="TestPswd123!")

        for (project_id, reason) in [(project_ids[0], "spam"), (project_ids[1], "harassment")]:
            self.client.post(
                path=reverse("report_project"),
                data=json.dumps({
                    "project_id": project_id,
                    "reason": reason,
                    "description": f"Reporting for {reason}",
                }),
                content_type="application/json"
            )

        # Non-staff user should get 403
        response = self.client.post(
            path=reverse("list_reports"),
            data=json.dumps({}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)

        # Staff user should see all reports
        _ = self.client.login(username="admin@case.edu", password="AdminPswd123!")

        response = self.client.post(
            path=reverse("list_reports"),
            data=json.dumps({}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["report_count"], 2)

        # Filter by project_id should narrow results
        response = self.client.post(
            path=reverse("list_reports"),
            data=json.dumps({"project_id": project_ids[0]}),
            content_type="application/json"
        )
        data = response.json()
        self.assertEqual(data["report_count"], 1)
        self.assertEqual(data["reports"][0]["reason"], "spam")
        self.assertEqual(data["reports"][0]["project_title"], "Project Alpha")

        # Filter with nonexistent project should return empty
        response = self.client.post(
            path=reverse("list_reports"),
            data=json.dumps({"project_id": 99999}),
            content_type="application/json"
        )
        self.assertEqual(response.json()["report_count"], 0)

    def test_admin_delete_project(self):
        creator = get_user_model().objects.create_user(
            username="creator@case.edu",
            password="TestPswd123!"
        )

        regular_user = get_user_model().objects.create_user(
            username="regular@case.edu",
            password="TestPswd123!"
        )

        admin = get_user_model().objects.create_user(
            username="admin@case.edu",
            password="AdminPswd123!",
            is_staff=True
        )

        # Create two projects
        _ = self.client.login(username="creator@case.edu", password="TestPswd123!")

        testcases = [
            ("Reported Project", "Will be deleted by admin"),
            ("Safe Project", "Will survive"),
        ]

        project_ids = []
        for (title, short_description) in testcases:
            response = self.client.post(
                path=reverse("create_project"),
                data=json.dumps({
                    "title": title,
                    "short_description": short_description,
                    "extended_description": "Extended",
                    "preferred_skills": ["Python"],
                    "project_type": "Research",
                    "workload_per_week": "5-10 hours",
                    "preferred_contact_method": "email",
                    "contact_information": "creator@case.edu",
                }),
                content_type="application/json"
            )
            project_ids.append(response.json()["id"])

        # File a report on the first project
        _ = self.client.login(username="regular@case.edu", password="TestPswd123!")

        self.client.post(
            path=reverse("report_project"),
            data=json.dumps({
                "project_id": project_ids[0],
                "reason": "spam",
            }),
            content_type="application/json"
        )
        self.assertEqual(Report.objects.count(), 1)

        # Non-staff user should get 403
        response = self.client.post(
            path=reverse("admin_delete_project"),
            data=json.dumps({"id": project_ids[0]}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)
        self.assertTrue(Project.objects.filter(id=project_ids[0]).exists())

        # Staff user can delete any project (not just their own)
        _ = self.client.login(username="admin@case.edu", password="AdminPswd123!")

        response = self.client.post(
            path=reverse("admin_delete_project"),
            data=json.dumps({"id": project_ids[0]}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])
        self.assertFalse(Project.objects.filter(id=project_ids[0]).exists())

        # Reports should be cascade-deleted with the project
        self.assertEqual(Report.objects.count(), 0)

        # Second project should still exist
        self.assertTrue(Project.objects.filter(id=project_ids[1]).exists())

        # Deleting nonexistent project should return 404
        response = self.client.post(
            path=reverse("admin_delete_project"),
            data=json.dumps({"id": 99999}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)
