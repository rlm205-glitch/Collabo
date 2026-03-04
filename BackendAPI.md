# Backend API

## Project Management

### Create Project: Via HTTP POST with JSON data

- URL: {backend ip}/project_management/create_project
- Requires Login (Handled automatically by Django)
- JSON Request Data:

```
{
  "title": {title},
  "short_description": {short_description},
  "author": {author},
  "extended_description": {extended_description},

  "preferred_skills": {preferred_skills},
  "project_type": {project_type},
  "workload_per_week": {workload_per_week},
  "preferred_contact_method": {preferred_contact_method},
  "contact_information": {contact_information}
}
```

- Returns JSONResponse:

```
{
  "success": {bool},
  "id": {project_id},
  "redirect_url": {redirect_url}
}
```

### Join Project: Via HTTP POST with JSON data

- URL: {backend ip}/project_management/join_project
- Requires Login (Handled automatically by Django)
- JSON Request Data:

```
{
  "id": {project_id},
}
```

- Returns JSONResponse:

```
{
  "success": {bool},
  "redirect_url": {redirect_url}
}
```

### Get Project: Via HTTP POST with JSON data

- URL: {backend ip}/project_management/get_project
- Requires Login (Handled automatically by Django)
- JSON Request Data:

```
{
  "id": {project_id}
}
```

- Returns JSONResponse:

```
{
  "success": {boolean},
  {
    "id": id,
    "title": title,
    "short_description": short_description,
    "author": author,
    "extended_description": extended_description,
    "preferred_skills": preferred_skills,
    "project_type": project_type,
    "workload_per_week": workload_per_week,
    "preferred_contact_method": preferred_contact_method,
    "contact_information": contact_information,
    "creation_time": creation_time,
    "updated_time": last_updated_time,
    "members": [member user ids]
  }
}
```

### List Projects: Via HTTP POST with JSON data

- URL: {backend ip}/project_management/list_projects
- Requires Login (Handled automatically by Django)
- JSON Request Data:

```
{
  "filters": {
    "extended_description__icontains": {what extended description is filtered for},
    "preferred_skills__contains": [{list of preferred skills that will be filtered for}]
  }
}
```

- Returns JSONResponse:

```
{
  success: {boolean},
  projects: {
    "id": id,
    "title": title,
    "short_description": short_description,
    "author": author,
    "preferred_skills": preferred_skills,
    "project_type": project_type,
    "workload_per_week": workload_per_week,
  },
  project_count: {*size of projects object*}
}
```

### Delete Project: Via HTTP POST with JSON data

- URL: {backend ip}/project_management/delete_project
- Requires Login (Handled automatically by Django)
- JSON Request Data:

```
{
  "id": {id}
}
```

- Returns JSONResponse:

```
{
  success: {boolean}
}
```

### Report Project: Via HTTP POST with JSON data

- URL: {backend ip}/project_management/report_project
- Requires Login (Handled automatically by Django)
- JSON Request Data:

```
{
  "project_id": {project_id},
  "reason": {reason},
  "description": {description}
}
```

- `reason` must be one of: `"spam"`, `"inappropriate"`, `"misleading"`, `"harassment"`, `"other"`
- `description` is optional (free-text, max 1000 chars)
- Each user can only report a given project once
- Returns JSONResponse:

```
{
  "success": {bool},
  "report_id": {report_id}
}
```

### List Reports (Admin): Via HTTP POST with JSON data

- URL: {backend ip}/project_management/list_reports
- Requires Login + Staff (is_staff=True)
- JSON Request Data:

```
{
  "project_id": {project_id}
}
```

- `project_id` is optional — omit to list all reports
- Returns JSONResponse:

```
{
  "success": {boolean},
  "reports": [
    {
      "id": id,
      "project_id": project_id,
      "project_title": project_title,
      "reporter_username": reporter_username,
      "reason": reason,
      "description": description,
      "created_at": created_at
    }
  ],
  "report_count": {size of reports array}
}
```

### Admin Delete Project (Admin): Via HTTP POST with JSON data

- URL: {backend ip}/project_management/admin_delete_project
- Requires Login + Staff (is_staff=True)
- Permanently deletes any project regardless of author
- JSON Request Data:

```
{
  "id": {project_id}
}
```

- Returns JSONResponse:

```
{
  "success": {boolean}
}
```

## User Authentication

### Register User: Via HTTP POST with JSON data

- URL: {backend ip}/user_authentication/register
- JSON Request Data:

```

{
  "email": {email},
  "password": {password},
  "first_name": {first_name},
  "last_name": {last_name}
}

```

- Returns JSONResponse:

```

{
  "success": {bool},
  "redirect_url": {redirect_url}
}

```

### Login User: Via HTTP POST with JSON data

- URL: {backend ip}/user_authentication/login
- JSON Request Data:

```

{
  "email": {email},
  "password": {password},
}

```

- Returns JSONResponse:

```

{
  "success": {bool},
  "redirect_url": {redirect_url}
}

```
