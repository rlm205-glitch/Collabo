from project_management.models import Project
from django.contrib.auth import get_user_model
from user_authentication.models import CollaboUser


def list_projects():
    """
    List all projects available for users to join with condensed data about the projects. This will return a list of dictionaries containing project data.
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


def get_project(id: int):
    """
    Get information about a project. Returns a dictionary detailed data about a specific project given its project id. Use this function to give users specific data about projects or to narrow down your recommendations to the finer details.
    Args:
        id: The project id of the project information to return
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

def get_profile(user_id: int):
    """
    Gets a user's profile. This will give information about their preferences, skills, interests, and availability.
    Args:
        user_id: the user_id of the user information to return
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

def create_link_to_project(id: int, base_url: str):
    return base_url + "project/" + str(id)
    
