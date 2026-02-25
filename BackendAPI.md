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
