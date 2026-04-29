"""Tool functions exposed to the LLM for project and profile lookups."""

from project_management.models import Project
from django.contrib.auth import get_user_model
from user_authentication.models import CollaboUser


def list_projects() -> dict:
    """Return condensed data for all projects available to join.

    Returns:
        A dict with keys success (bool), condensed_projects (list of dicts),
        and project_count (int).
    """
    try:
        projects = Project.objects.prefetch_related('members').all()

        condensed_project_data = [
            {
                "id": p.id,
                "title": p.title,
                "short_description": p.short_description,
                "author": p.author,
                "author_id": p.author_id,
                "project_type": p.project_type,
                "workload_per_week": p.workload_per_week,
                "preferred_skills": p.preferred_skills,
                "member_ids": [m.id for m in p.members.all()],
            }
            for p in projects
        ]

        return {
            "success": True,
            "condensed_projects": condensed_project_data,
            "project_count": len(condensed_project_data),
        }

    except Exception as e:
        return {"success": False, "error": f"Failed to retrieve projects: {str(e)}"}


def get_project(id: int) -> dict:
    """Return detailed information about a single project.

    Args:
        id: The primary key of the project to retrieve.

    Returns:
        A dict with keys success (bool) and project (dict of project fields).
    """
    try:
        project = Project.objects.get(id=id)

        return {
            "success": True,
            "project": {
                "id": project.id,
                "title": project.title,
                "short_description": project.short_description,
                "author_id": project.author_id,
                "extended_description": project.extended_description,
                "preferred_skills": project.preferred_skills,
                "project_type": project.project_type,
                "workload_per_week": project.workload_per_week,
                "preferred_contact_method": project.preferred_contact_method,
                "contact_information": project.contact_information,
                "creation_time": project.creation_time.isoformat() if project.creation_time else None,
                "updated_time": project.updated_time.isoformat() if project.updated_time else None,
                "members": [user.id for user in project.members.all()],
            },
        }

    except Exception as e:
        return {"success": False, "error": f"Failed to get project: {str(e)}"}


def get_profile(user_id: int) -> dict:
    """Return a user's profile including skills, interests, and availability.

    Args:
        user_id: The primary key of the user to look up.

    Returns:
        A dict with success (bool) and profile fields on success, or an
        error message on failure.
    """
    try:
        user = CollaboUser.objects.get(id=user_id)

        return {
            "success": True,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "email": user.email,
            "major": user.major,
            "skills": user.skills,
            "interests": user.interests,
            "availability": user.availability,
            "preferred_contact_method": user.preferred_contact_method,
            "is_staff": user.is_staff,
        }

    except Exception:
        return {"success": False, "error": "Failed to get user profile"}


def create_link_to_project(id: int, base_url: str) -> str:
    """Build a URL pointing to a project's detail page.

    Args:
        id: The project's primary key.
        base_url: The site's base URL including trailing slash.

    Returns:
        A full URL string for the project page.
    """
    return base_url + "project/" + str(id)
