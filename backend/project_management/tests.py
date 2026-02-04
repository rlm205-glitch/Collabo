from django.test import TestCase
from django.urls import reverse
import json
from .models import Project
from django.contrib.auth.models import User


# Create your tests here.
class ProjectTests(TestCase):
    def test_create_project(self):
        testcases = [
            (
                "Atlas",
                "A lightweight project management dashboard for small teams",
                "Xander Jhaveri",
                "Atlas is a web-based dashboard designed to help small development teams track tasks, deadlines, and progress without the overhead of enterprise tools. It emphasizes simplicity, speed, and clarity while still supporting core collaboration features.",
                "Python, Django, REST APIs, PostgreSQL, Git"
            ),

            (
                "Gridfall",
                "A roguelike puzzle game built around modular block mechanics",
                "Alex Morgan",
                "Gridfall is a turn-based puzzle roguelike where players place procedurally generated block pieces onto a grid. The game focuses on emergent mechanics, replayability, and strategic decision-making.",
                "Godot, GDScript, Game Design, Algorithms, Debugging"
            ),

            (
                "Signal",
                "Real-time chat application with end-to-end encryption",
                "Jamie Chen",
                "Signal is a real-time messaging platform focused on privacy and performance. It supports group chats, media sharing, and secure authentication while maintaining low latency and scalability.",
                "JavaScript, WebSockets, Cryptography, Node.js, System Design"
            ),

            (
                "Nimbus",
                "Cloud-based file storage and synchronization service",
                "Priya Patel",
                "Nimbus provides seamless cloud file storage with automatic synchronization across devices. The project emphasizes fault tolerance, efficient data transfer, and secure access control.",
                "AWS, Docker, Linux, Networking, Distributed Systems"
            ),

            (
                "Lens",
                "AI-assisted study tool for summarizing academic content",
                "Marcus Lee",
                "Lens helps students digest complex academic material by generating concise summaries and concept maps. The application integrates NLP models with an intuitive UI for focused learning.",
                "Python, Machine Learning, NLP, React, Data Processing"
            )
        ]

        _ = User.objects.create_user(
            username="testuser",
            password="TestPswd123!"
        )

        self.client.login(username="testuser", password="TestPswd123!")

        for (title, subtitle, author, description, preferred_skills) in testcases:
            json_data = {
                "title": title,
                "subtitle": subtitle,
                "author": author,
                "description": description,
                "preferred_skills": preferred_skills,
            }

            response = self.client.post(
                path=reverse("create_project"),
                data=json.dumps(json_data),
                content_type="application/json"
            )

            self.assertNotEqual(response.status_code // 100, 4)

        for (id, (title, _, _, _, _)) in enumerate(testcases, start=1):
            project = Project.objects.get(id=id)

            self.assertEqual(project.title, title)




