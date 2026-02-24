# Collabo — Architecture & Design Diagrams

## System Architecture

High-level overview of the Collabo platform. The React frontend (Vite dev server on port 5173) communicates with the Django backend (port 8000) via a Vite proxy. Django uses SQLite for persistence and Django's built-in session framework for authentication.

```mermaid
graph TB
    subgraph Client["Browser"]
        React["React 19 + TypeScript<br/>(Vite @ :5173)"]
    end

    subgraph Backend["Django 6.0 Backend @ :8000"]
        CORS["CORS Middleware"]
        Auth["user_authentication"]
        PM["project_management"]
        API["api"]
        Session["Django Session<br/>Middleware"]
    end

    subgraph Database["SQLite3"]
        DB[(db.sqlite3)]
    end

    React -- "HTTP POST<br/>/authentication/*" --> CORS
    React -- "HTTP POST<br/>/project_management/*" --> CORS
    React -- "HTTP GET/POST<br/>/apicall/*" --> CORS

    CORS --> Session
    Session --> Auth
    Session --> PM
    Session --> API

    Auth --> DB
    PM --> DB
```

## Frontend Component Hierarchy

The React component tree showing parent-child relationships and which components render inside others. `App` is the root component and manages all application state. Routing determines whether the unauthenticated pages, the student dashboard, or the admin dashboard are displayed.

```mermaid
raph TD
    App["App<br/>(Router, State, API Calls)"]

    App -- "not logged in" --> Routes["Routes"]
    Routes --> HomePage
    Routes --> LoginPage
    Routes --> CreateAccountPage

    App -- "role = student" --> StudentDashboard
    App -- "role = admin" --> AdminDashboard

    StudentDashboard --> ProjectCard
    StudentDashboard --> CreateProjectModal
    StudentDashboard --> UserProfileModal

    ProjectCard --> EditProjectModal
    ProjectCard --> ProjectDetailsModal

    AdminDashboard --> ProjectCard_Admin["ProjectCard"]
```

## Frontend Component Diagram

Detailed view of each React component, its props, and the data it manages. This shows the contract between parent and child components across the application.

```mermaid
classDiagram
    class App {
        -currentUser: User | null
        -users: User[]
        -projects: Project[]
        -reports: Report[]
        +handleLogin(email, password) string | null
        +handleRegister(email, password, first, last) string | null
        +handleLogout()
        +addProject(project)
        +updateProject(projectId, updates)
        +deleteProject(projectId)
        +reportProject(projectId, reason)
        +fetchProjects()
        +getProjectDetails(projectId) Project | null
        +joinProject(projectId) boolean
    }

    class LoginPage {
        +onLogin(email, password) string | null
    }

    class CreateAccountPage {
        +onRegister(email, password, first, last) string | null
    }

    class HomePage {
        +onGetStarted()
    }

    class StudentDashboard {
        +currentUser: User
        +projects: Project[]
        +users: User[]
        +onLogout()
        +onUpdateProfile(user)
        +onAddProject(project)
        +onUpdateProject(id, updates)
        +onDeleteProject(id)
        +onReportProject(id, reason)
        +onGetProjectDetails(id) Project | null
        +onJoinProject(id) boolean
    }

    class AdminDashboard {
        +currentUser: User
        +projects: Project[]
        +reports: Report[]
        +users: User[]
        +onLogout()
        +onDeleteProject(id)
        +onRestrictUser(id)
        +onUpdateProject(id, updates)
    }

    class ProjectCard {
        +project: Project
        +currentUser: User
        +onDelete(id)
        +onReport(id, reason)
        +onUpdate(id, updates)
        +onGetProjectDetails(id) Project | null
        +onJoinProject(id) boolean
    }

    class CreateProjectModal {
        +onClose()
        +onSubmit(project)
    }

    class EditProjectModal {
        +project: Project
        +onClose()
        +onSave(id, updates)
    }

    class ProjectDetailsModal {
        +projectId: string
        +currentUser: User
        +onClose()
        +onGetProjectDetails(id) Project | null
        +onJoinProject(id) boolean
    }

    class UserProfileModal {
        +user: User
        +onClose()
        +onSave(user)
    }

    App --> LoginPage
    App --> CreateAccountPage
    App --> HomePage
    App --> StudentDashboard
    App --> AdminDashboard
    StudentDashboard --> ProjectCard
    StudentDashboard --> CreateProjectModal
    StudentDashboard --> UserProfileModal
    ProjectCard --> EditProjectModal
    ProjectCard --> ProjectDetailsModal
    AdminDashboard --> ProjectCard
```

## Backend Class Diagram

Django models and their relationships. The application uses Django's built-in `User` model for authentication and a custom `Project` model for project data. Projects have a many-to-many relationship with users via the `members` field.

```mermaid
classDiagram
    class User {
        <<Django Built-in>>
        +int id
        +str username
        +str email
        +str password
        +str first_name
        +str last_name
        +bool is_staff
        +bool is_active
        +bool is_superuser
        +datetime date_joined
        +authenticate(username, password) User
        +create_user(username, email, password) User
        +get_username() str
    }

    class Project {
        +int id
        +str title
        +str short_description
        +str author
        +str extended_description
        +list preferred_skills
        +str project_type
        +str workload_per_week
        +str preferred_contact_method
        +str contact_information
        +ManyToMany~User~ members
        +__str__() str
    }

    Project "*" -- "*" User : members
```

## Database / ER Diagram

Entity-relationship diagram showing all database tables, their columns, and the relationships between them. The `project_management_project_members` table is the auto-generated join table for the many-to-many relationship between projects and users.

```mermaid
erDiagram
    auth_user {
        int id PK
        varchar username UK
        varchar email
        varchar password
        varchar first_name
        varchar last_name
        boolean is_staff
        boolean is_active
        boolean is_superuser
        datetime date_joined
        datetime last_login
    }

    project_management_project {
        int id PK
        text title
        text short_description
        text author
        text extended_description
        json preferred_skills
        text project_type
        text workload_per_week
        text preferred_contact_method
        text contact_information
    }

    project_management_project_members {
        int id PK
        int project_id FK
        int user_id FK
    }

    django_session {
        varchar session_key PK
        text session_data
        datetime expire_date
    }

    project_management_project ||--o{ project_management_project_members : "has"
    auth_user ||--o{ project_management_project_members : "belongs to"
    auth_user ||--o{ django_session : "authenticated via"
```

## Sequence Diagram — User Registration

A new user registers with their CWRU email address. The frontend validates the password match locally, then the backend validates the email domain, checks password strength, and creates the user record.

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant BE as Django Backend
    participant DB as SQLite

    User->>FE: Fill in name, email, password, confirm password
    FE->>FE: Validate passwords match

    FE->>BE: POST /authentication/register/<br/>{ email, password, first_name, last_name }
    BE->>BE: Validate CWRU email (regex @case.edu)

    alt Invalid email
        BE-->>FE: 400 "Please enter a valid CWRU email"
        FE-->>User: Show error message
    end

    BE->>BE: Validate password strength
    alt Weak password
        BE-->>FE: 400 "Invalid password"
        FE-->>User: Show error message
    end

    BE->>DB: INSERT INTO auth_user
    alt Email already exists
        DB-->>BE: IntegrityError
        BE-->>FE: 400 "This email already has an account"
        FE-->>User: Show error message
    end

    DB-->>BE: User created
    BE-->>FE: 200 { success: true, redirect_url }
    FE->>FE: Set currentUser state
    FE-->>User: Navigate to Student Dashboard
```

## Sequence Diagram — User Login

An existing user logs in. Django's built-in `authenticate()` and `login()` functions handle credential verification and session creation.

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant BE as Django Backend
    participant DB as SQLite

    User->>FE: Enter email and password
    FE->>BE: POST /authentication/login/<br/>{ email, password }
    BE->>DB: SELECT FROM auth_user WHERE username = email
    DB-->>BE: User record (or not found)

    BE->>BE: authenticate(username, password)

    alt Invalid credentials
        BE-->>FE: 400 { success: false, error: "Invalid Login Credentials" }
        FE-->>User: Show error message
    end

    BE->>BE: login(request, user) — create session
    BE->>DB: INSERT INTO django_session
    BE-->>FE: 200 { success: true, redirect_url }<br/>Set-Cookie: sessionid=...
    FE->>FE: Set currentUser state
    FE->>FE: Derive display name from email
    FE-->>User: Navigate to Student Dashboard
```

## Sequence Diagram — Create Project

An authenticated student creates a new project. The `@login_required` decorator ensures the user has a valid session before processing.

```mermaid
sequenceDiagram
    actor Student
    participant FE as React Frontend
    participant BE as Django Backend
    participant DB as SQLite

    Student->>FE: Click "Create New Project"
    FE-->>Student: Show CreateProjectModal

    Student->>FE: Fill in project details and submit
    FE->>BE: POST /project_management/create_project/<br/>{ title, short_description, extended_description,<br/>project_type, preferred_skills, workload_per_week,<br/>preferred_contact_method, contact_information }

    BE->>BE: @login_required check session
    alt Not authenticated
        BE-->>FE: Redirect to login
    end

    BE->>DB: INSERT INTO project_management_project
    BE->>DB: INSERT INTO project_members (creator as member)
    DB-->>BE: Project created (id)
    BE-->>FE: 200 { success: true, id, redirect_url }

    FE->>BE: POST /project_management/list_projects/ { }
    BE->>DB: SELECT * FROM project_management_project
    DB-->>BE: Project list
    BE-->>FE: { success: true, condensed_projects: [...] }
    FE-->>Student: Refresh project grid with new project
```

## Sequence Diagram — Browse & Join Project

A student browses the project list, views details of a specific project, and joins it. This involves three sequential API calls.

```mermaid
sequenceDiagram
    actor Student
    participant FE as React Frontend
    participant BE as Django Backend
    participant DB as SQLite

    Note over FE: Dashboard loads on login
    FE->>BE: POST /project_management/list_projects/<br/>{ sortkey: "title" }
    BE->>DB: SELECT id, title, short_description,<br/>author, project_type, preferred_skills<br/>FROM project ORDER BY title, author
    DB-->>BE: Condensed project list
    BE-->>FE: { condensed_projects: [...], project_count: N }
    FE-->>Student: Render project cards in grid

    Student->>FE: Click "View & Join" on a project
    FE->>BE: POST /project_management/get_project/<br/>{ id: projectId }
    BE->>DB: SELECT * FROM project WHERE id = ?
    DB-->>BE: Full project record + member IDs
    BE-->>FE: { success: true, project: { ... } }
    FE-->>Student: Show ProjectDetailsModal

    Student->>FE: Click "Join Project"
    FE->>BE: POST /project_management/join_project/<br/>{ id: projectId }
    BE->>DB: INSERT INTO project_members (project_id, user_id)
    DB-->>BE: Member added
    BE-->>FE: { success: true }
    FE-->>Student: Show "Successfully joined!" message
```

## Sequence Diagram — Admin Moderation

An admin reviews reported projects and takes action (hide, delete, or restrict user). These operations currently happen client-side only.

```mermaid
sequenceDiagram
    actor Admin
    participant FE as React Frontend
    participant State as App State

    Admin->>FE: Navigate to Admin Dashboard
    FE-->>Admin: Show tabs (Reported / All Projects / Users)

    Admin->>FE: Click "Reported Projects" tab
    FE-->>Admin: Display projects with report count > 0

    Admin->>FE: View report details
    FE-->>Admin: Show reporter, reason, date

    alt Hide Project
        Admin->>FE: Click "Hide"
        FE->>State: updateProject(id, { isActive: false })
        FE-->>Admin: Project marked as hidden
    end

    alt Delete Project
        Admin->>FE: Click "Delete"
        FE->>State: deleteProject(id)
        FE->>State: Remove associated reports
        FE-->>Admin: Project removed from list
    end

    alt Restrict User
        Admin->>FE: Click "Restrict User"
        FE->>State: restrictUser(userId)
        FE-->>Admin: Confirmation alert
    end
```
