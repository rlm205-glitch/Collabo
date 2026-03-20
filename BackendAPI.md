# Backend API

## Project Management

### Create Project: Via HTTP POST with JSON data

- URL: `{backend_ip}/project_management/create_project`
- Requires Login (handled automatically by Django)
- JSON Request Body:

```json
{
  "title": "{title}",
  "short_description": "{short_description}",
  "author": "{author}",
  "extended_description": "{extended_description}",
  "preferred_skills": "{preferred_skills}",
  "project_type": "{project_type}",
  "workload_per_week": "{workload_per_week}",
  "preferred_contact_method": "{preferred_contact_method}",
  "contact_information": "{contact_information}"
}
```

- Returns:

```json
{
  "success": true,
  "id": "{project_id}",
  "redirect_url": "{redirect_url}"
}
```

---

### Join Project: Via HTTP POST with JSON data

- URL: `{backend_ip}/project_management/join_project`
- Requires Login (handled automatically by Django)
- JSON Request Body:

```json
{
  "id": "{project_id}"
}
```

- Returns:

```json
{
  "success": true,
  "redirect_url": "{redirect_url}"
}
```

---

### Get Project: Via HTTP POST with JSON data

- URL: `{backend_ip}/project_management/get_project`
- Requires Login (handled automatically by Django)
- JSON Request Body:

```json
{
  "id": "{project_id}"
}
```

- Returns:

```json
{
  "success": true,
  "id": "{id}",
  "title": "{title}",
  "short_description": "{short_description}",
  "author": "{author}",
  "extended_description": "{extended_description}",
  "preferred_skills": "{preferred_skills}",
  "project_type": "{project_type}",
  "workload_per_week": "{workload_per_week}",
  "preferred_contact_method": "{preferred_contact_method}",
  "contact_information": "{contact_information}",
  "creation_time": "{creation_time}",
  "updated_time": "{last_updated_time}",
  "members": ["{member_user_ids}"]
}
```

---

### List Projects: Via HTTP POST with JSON data

- URL: `{backend_ip}/project_management/list_projects`
- Requires Login (handled automatically by Django)
- JSON Request Body:

```json
{
  "filters": {
    "extended_description__icontains": "{filter_string}",
    "preferred_skills__contains": ["{skill_1}", "{skill_2}"]
  }
}
```

- Returns:

```json
{
  "success": true,
  "projects": [
    {
      "id": "{id}",
      "title": "{title}",
      "short_description": "{short_description}",
      "author": "{author}",
      "preferred_skills": "{preferred_skills}",
      "project_type": "{project_type}",
      "workload_per_week": "{workload_per_week}"
    }
  ],
  "project_count": "{size_of_projects_array}"
}
```

---

### Delete Project: Via HTTP POST with JSON data

- URL: `{backend_ip}/project_management/delete_project`
- Requires Login (handled automatically by Django)
- JSON Request Body:

```json
{
  "id": "{project_id}"
}
```

- Returns:

```json
{
  "success": true
}
```

---

### Report Project: Via HTTP POST with JSON data

- URL: `{backend_ip}/project_management/report_project`
- Requires Login (handled automatically by Django)
- JSON Request Body:

```json
{
  "project_id": "{project_id}",
  "reason": "{reason}",
  "description": "{description}"
}
```

- `reason` must be one of: `"spam"`, `"inappropriate"`, `"misleading"`, `"harassment"`, `"other"`
- `description` is optional (free-text, max 1000 chars)
- Each user can only report a given project once
- Returns:

```json
{
  "success": true,
  "report_id": "{report_id}"
}
```

---

### List Reports (Admin): Via HTTP POST with JSON data

- URL: `{backend_ip}/project_management/list_reports`
- Requires Login + Staff (`is_staff=True`)
- JSON Request Body:

```json
{
  "project_id": "{project_id}"
}
```

- `project_id` is optional — omit to list all reports
- Returns:

```json
{
  "success": true,
  "reports": [
    {
      "id": "{id}",
      "project_id": "{project_id}",
      "project_title": "{project_title}",
      "reporter_username": "{reporter_username}",
      "reason": "{reason}",
      "description": "{description}",
      "created_at": "{created_at}"
    }
  ],
  "report_count": "{size_of_reports_array}"
}
```

---

### Update Project: Via HTTP POST with JSON data

- URL: `{backend_ip}/project_management/update_project`
- Requires Login (handled automatically by Django)
- Only the project author can update their own project
- JSON Request Body (all fields optional; omitted fields retain current values):

```json
{
  "id": "{project_id}",
  "title": "{title}",
  "short_description": "{short_description}",
  "extended_description": "{extended_description}",
  "project_type": "{project_type}",
  "preferred_skills": ["{skill_1}", "{skill_2}"],
  "workload_per_week": "{workload_per_week}",
  "preferred_contact_method": "{preferred_contact_method}",
  "contact_information": "{contact_information}"
}
```

- Returns:

```json
{
  "success": true
}
```

---

### List Join Requests: Via HTTP POST with JSON data

- URL: `{backend_ip}/project_management/list_join_requests`
- Requires Login (handled automatically by Django)
- Only project members can view join requests for their project
- JSON Request Body:

```json
{
  "project_id": "{project_id}"
}
```

- Returns:

```json
{
  "success": true,
  "data": [
    {
      "id": "{join_request_id}",
      "requester_username": "{username}",
      "requester_email": "{email}",
      "message": "{message}",
      "created_at": "{created_at}",
      "status": "pending"
    }
  ]
}
```

---

### Decide Join Request (Accept/Reject): Via HTTP POST with JSON data

- URL: `{backend_ip}/project_management/decide_join_request`
- Requires Login (handled automatically by Django)
- Only project members can approve or reject join requests
- JSON Request Body:

```json
{
  "join_request_id": "{join_request_id}",
  "decision": "{decision}",
  "reply_message": "{reply_message}"
}
```

- `decision` must be either `"approved"` or `"rejected"`
- `reply_message` is optional
- If approved, the requester is added to the project's members and notified by email
- If rejected, the requester is notified by email
- Returns:

```json
{
  "success": true,
  "status": "{approved_or_rejected}"
}
```

---

### Admin Delete Project (Admin): Via HTTP POST with JSON data

- URL: `{backend_ip}/project_management/admin_delete_project`
- Requires Login + Staff (`is_staff=True`)
- Permanently deletes any project regardless of author
- JSON Request Body:

```json
{
  "id": "{project_id}"
}
```

- Returns:

```json
{
  "success": true
}
```

---

## Profile Management

### Update Profile: Via HTTP POST with JSON data

- URL: `{backend_ip}/profile_management/update_profile`
- Requires Login (handled automatically by Django)
- JSON Request Body (all fields optional; omitted fields retain current values):

```json
{
  "first_name": "{first_name}",
  "last_name": "{last_name}",
  "email": "{email}",
  "major": "{major}",
  "skills": "{skills}",
  "interests": "{interests}",
  "availability": "{availability}",
  "preferred_contact_method": "{preferred_contact_method}",
  "active_project_notifications": true,
  "project_expiration_notifications": true,
  "weekly_update_notifications": true
}
```

- Returns:

```json
{
  "success": true,
  "id": "{user_id}"
}
```

### Get Self Profile: Via HTTP GET

- URL: {backend ip}/profile_management/get_self_profile
- Requires Login (Handled automatically by Django)
- No request body needed

- Returns JSONResponse:

```
{
  "success": {bool},
  "id": {user_id},
  "first_name": {first_name},
  "last_name": {last_name},
  "username": {username},
  "email": {email},
  "major": {major},
  "skills": {skills},
  "interests": {interests},
  "availability": {availability},
  "preferred_contact_method": {preferred_contact_method},
  "active_project_notifications": {bool},
  "project_expiration_notifications": {bool},
  "weekly_update_notifications": {bool},
  "is_staff": {bool}
}
```

### Get Profile: Via HTTP POST with JSON data

- URL: {backend ip}/profile_management/get_profile
- Requires Login (Handled automatically by Django)
- JSON Request Data:

```
{
  "id": {user_id}
}
```

- Returns JSONResponse:

```
{
  "success": {bool},
  "first_name": {first_name},
  "last_name": {last_name},
  "username": {username},
  "email": {email},
  "major": {major},
  "skills": {skills},
  "interests": {interests},
  "availability": {availability},
  "preferred_contact_method": {preferred_contact_method},
  "is_staff": {bool}
}
```

## User Authentication

### Register User: Via HTTP POST with JSON data

- URL: `{backend_ip}/user_authentication/register`
- JSON Request Body:

```json
{
  "email": "{email}",
  "password": "{password}",
  "first_name": "{first_name}",
  "last_name": "{last_name}"
}
```

- Returns:

```json
{
  "success": true,
  "redirect_url": "{redirect_url}"
}
```

---

### Login User: Via HTTP POST with JSON data

- URL: `{backend_ip}/user_authentication/login`
- JSON Request Body:

```json
{
  "email": "{email}",
  "password": "{password}"
}
```

- Returns:

```json
{
  "success": {bool},
  "redirect_url": {redirect_url},
  "id": {user_id},
  "first_name": {first_name},
  "last_name": {last_name},
  "username": {username},
  "email": {email},
  "major": {major},
  "skills": {skills},
  "interests": {interests},
  "availability": {availability},
  "preferred_contact_method": {preferred_contact_method},
  "active_project_notifications": {bool},
  "project_expiration_notifications": {bool},
  "weekly_update_notifications": {bool},
  "is_staff": {bool}
}
```
