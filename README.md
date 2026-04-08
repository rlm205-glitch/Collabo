# CWRU Collaboration

A web platform for CWRU students to discover, create, and join collaborative projects. Students can browse open projects, filter by skills and commitment level, manage their profile, and use an AI-powered assistant to find relevant opportunities.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Frontend](#frontend)
- [Backend](#backend)
- [AI Assistance](#ai-assistance)
- [Quality & Correctness](#quality--correctness)
- [Running the Project](#running-the-project)

---

## Architecture Overview

The application follows a standard client-server architecture:

```
Frontend (React + TypeScript)
        ↕ HTTP/JSON
Backend (Django REST API)
        ↕ ORM queries
Database (SQLite)
```

The team of four split into two pairs: two members handled the frontend and two handled the backend. Development used Git feature branches — each major feature was developed on its own branch and merged via pull request.

---

## Frontend

**Stack:** React, TypeScript, Tailwind CSS, Vite

### Structure

The frontend is organized as a single-page application with 16 components, each scoped to a specific page or modal:

```
src/
├── App.tsx                   # Root component, global state, session management
├── components/
│   ├── StudentDashboard.tsx  # Main project browsing view
│   ├── AdminDashboard.tsx    # Admin moderation view
│   ├── LoginPage.tsx         # Authentication
│   ├── CreateAccountPage.tsx # Registration
│   ├── ProjectCard.tsx       # Individual project display
│   ├── CreateProjectModal.tsx
│   ├── EditProjectModal.tsx
│   ├── UserProfileModal.tsx
│   ├── ProjectDetailsModal.tsx
│   ├── JoinRequestsModal.tsx
│   └── ...
```

### Design Choices

- **TypeScript throughout** — all components use explicit prop interfaces and typed state, catching type mismatches at compile time rather than runtime.
- **Tailwind CSS** — utility-first styling ensures a consistent blue/gray design system across all components without a separate stylesheet.
- **Controlled forms** — all form inputs are controlled React state, making validation and submission straightforward.
- **Error states visible to the user** — the login form shows inline error messages and disables the submit button while loading. The chat assistant shows a friendly error message instead of a blank failure.

---

## Backend

**Stack:** Django, Django REST Framework, SQLite

### Structure

The backend is split into four Django apps, each responsible for a distinct domain:

```
backend/
├── manage.py
├── mainsite/               # Project settings and root URL config
│   ├── settings.py
│   └── urls.py
├── user_authentication/    # Custom user model, registration, login, email verification, password reset
│   ├── models.py           # CollaboUser, EmailVerificationToken, PasswordResetToken
│   ├── views.py
│   └── urls.py
├── project_management/     # Project CRUD, join requests, reporting, admin moderation
│   ├── models.py           # Project, Join_Request, Report
│   ├── views.py
│   └── urls.py
├── profile_management/     # Read and update user profiles
│   ├── views.py
│   └── urls.py
└── llm_integration/        # AI-powered project recommendation assistant (Ollama + tool-calling)
    ├── views.py
    └── urls.py
```

### Key Endpoints

All endpoints accept and return JSON. Authentication endpoints are under `/authentication/`, project endpoints under `/project_management/`, profile endpoints under `/profile_management/`, and the LLM endpoint under `/llm_api/`.

**Authentication**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/authentication/register/` | Register a new account (requires `@case.edu` email) |
| POST | `/authentication/login/` | Log in; returns session cookie and user data |
| GET | `/authentication/whoami/` | Return current session user info |
| POST | `/authentication/logout/` | End the session |
| POST | `/authentication/verify-email/` | Activate account via emailed token |
| POST | `/authentication/resend-verification/` | Resend the account verification email |
| POST | `/authentication/forgot-password/` | Send password reset email |
| POST | `/authentication/reset-password/` | Reset password via emailed token |

**Project Management**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/project_management/create_project/` | Create a new project (auth required) |
| POST | `/project_management/list_projects/` | List projects; supports sorting and field filters |
| POST | `/project_management/get_project/` | Get full details for a project by ID |
| POST | `/project_management/delete_project/` | Delete a project (owner only) |
| POST | `/project_management/update_project/` | Edit a project (owner only) |
| POST | `/project_management/join_project/` | Submit a join request with an optional message |
| POST | `/project_management/list_join_requests/` | List pending join requests (project members only) |
| POST | `/project_management/decide_join_request/` | Approve or reject a join request |
| POST | `/project_management/report_project/` | Flag a project for moderation |
| POST | `/project_management/list_reports/` | List filed reports (staff only) |
| POST | `/project_management/admin_delete_project/` | Delete any project (staff only) |

**Profile Management**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/profile_management/update_profile` | Update the current user's profile fields |
| GET | `/profile_management/get_self_profile` | Fetch the current user's full profile |
| POST | `/profile_management/get_profile` | Fetch another user's public profile by ID |

**LLM Assistant**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/llm_api/prompt_llm` | Send a prompt to the AI assistant; returns a text response |

### Design Choices

- **Session-based authentication** — Django's built-in session middleware handles login state. The frontend sends credentialed requests and Django resolves the user from the session cookie. No JWTs or API tokens are issued.

- **Custom user model (`CollaboUser`)** — Extends `AbstractUser` with extra fields: `major`, `skills` (JSONField), `interests` (JSONField), `availability`, `preferred_contact_method`, and three notification preference flags. Using a custom model from the start avoided the need for a separate profile table.

- **CWRU email restriction** — Registration validates that the email ends in `@case.edu` before creating the account, limiting sign-ups to CWRU students.

- **Secure token pattern for email flows** — Email verification and password reset tokens are generated with `secrets.token_urlsafe`, hashed with SHA-256 before being stored, and expire on a short timer (24 hours for verification, 1 hour for password reset). The raw token is only ever sent by email and never persisted, so a database breach does not expose usable tokens.

- **Join request workflow** — Users cannot add themselves directly to a project; they submit a join request with an optional message. Any existing project member can approve or reject it, and an email notification is sent in both directions. This keeps project membership intentional and gives teams control over who joins.

- **LLM integration with local Ollama** — The AI assistant runs a local `nemotron-3-nano:4b` model via the `ollama` Python library instead of calling an external API. The model is given a structured system prompt and a set of tool functions (`list_projects`, `get_project`, `get_self_profile`, `get_profile`, `link_to_project`) that let it look up real project and user data before generating recommendations. A 25-iteration loop guards against runaway tool-call chains.

- **Staff-gated admin actions** — A custom `@staff_required` decorator protects moderation endpoints. Regular users receive a 403 if they attempt to call `list_reports` or `admin_delete_project`.

- **Frontend served by Django + WhiteNoise** — The production build of the React app is served directly from Django using WhiteNoise static file serving. A catch-all URL rule serves `index.html` for any unmatched path, enabling client-side routing without a separate web server.

---

## AI Assistance

AI tools were used throughout development to accelerate both implementation and debugging:

| Tool | How It Was Used |
|------|----------------|
| **GitHub Copilot Chat** (VS Code) | In-editor suggestions and code generation while writing components |
| **ChatGPT** | Debugging error messages and unexpected behavior |
| **ChatGPT** | Generating initial boilerplate for repeated component patterns (modals, forms) |
| **ChatGPT** | Designing the scoring logic for the Best Match algorithm |
| **ChatGPT** | Tailwind class selection for layout and responsive design |
| **ChatGPT** | Designing the secure token pattern for email verification and password reset |
| **ChatGPT** | Understanding the Ollama tool-calling interface and structuring the LLM system prompt |

AI-generated code was always reviewed and tested before being committed. Variable names, logic, and structure were adjusted to match the overall codebase conventions.

---

## Quality & Correctness

### Frontend

- **TypeScript compiler** — `npm run build` produces zero type errors; type mismatches are caught before the code runs.
- **Unit testing** — unit tests were written for selected frontend features to verify core logic.
- **Visual inspection** — all UI views were manually verified to render correctly across the main user flows (registration, login, browse, create project, edit profile, chat assistant).
- **Browser DevTools** — network requests were inspected to confirm correct API calls were being made to the backend, with expected payloads and response shapes.

### Backend

- **Django test suite** — `python manage.py test` was run against the backend apps to verify API endpoint behavior.

All four backend apps have test suites run with `python manage.py test`.

- **`user_authentication`** — `AuthenticationTests` covers registration (valid CWRU email, invalid/external domains, duplicate email, weak password), login (correct credentials, non-CWRU users rejected), and email domain validation. `EmailVerificationTests` checks that a verification email is sent on registration, that valid tokens activate the account, and that invalid or missing tokens return 400. `ForgotPasswordTests` checks that a reset email is sent for known accounts but not unknown ones (preventing account enumeration), that invalid/expired tokens are rejected, that weak new passwords are rejected by Django's validators, and that a successful reset actually changes the password.

- **`project_management`** — `ProjectTests` covers creating, deleting, fetching, and listing projects (including sort order and field-level filtering). `JoinProjectRequestTest` verifies that submitting a join request triggers an email notification to project members. `ApproveTest` verifies that approving a join request adds the requester to the project's member list. `ReportTests` covers filing reports with valid and invalid reason categories, duplicate-report prevention per user per project, non-existent project handling, staff-only access to `list_reports` (non-staff gets 403), filtering reports by project, `admin_delete_project` staff enforcement, and cascade deletion of reports when a project is removed. `UpdateProjectTest` confirms that only the project owner can update fields (non-owner gets 403).

- **`profile_management`** — `ProfileTests` creates several users (including a staff user), updates each profile via the API, then fetches each profile back and asserts that fields like `major`, `interests`, and `is_staff` are persisted correctly.

---

## Running the Project

### Frontend

Requires Node.js and npm.

```sh
cd frontend
npm install
npm run build
```

This will build the React frontend for Django to host it

### Backend and Hosting Frontend

Requires Python 3.12+ and the [uv](https://github.com/astral-sh/uv) package manager.

```sh
cd backend
uv run manage.py migrate
uv run manage.py runserver
```

The API and frontend (if built) will be available at `http://localhost:8000`.

To run the test suite:

```sh
cd backend
uv run manage.py test
```

> Note for email sending: If you would like the server to send real emails, leave the
> following enviroment variable as it is. If you would prefer that emails simply be
> printed to the console, run `export DJANGO_EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend`

### Running the LLM

This is not necessary to build and run the platform, however the chatbot
will not work without it.

Requires [Ollama](https://github.com/ollama/ollama) v0.20+

Install the model and start the server:

```sh
ollama pull nemotron-3-nano:4b
ollama serve
```

You must run [Ollama](https://github.com/ollama/ollama) simultaneously with Django. The port defaults to 11434, but you can
set it to whatever you choose, as long as you make sure to set the
OLLAMA_HOST environment variable to the corresponding port.

```sh
export OLLAMA_HOST=127.0.0.1:11434
```
