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

> *[Backend teammate: fill in your app structure here — `user_authentication`, `project_management`, `profile_management`, `llm_integration`]*

### Key Endpoints

> *[Backend teammate: list major API endpoints here]*

### Design Choices

> *[Backend teammate: describe major architectural decisions — e.g. session auth approach, LLM integration design, model structure]*

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

> *[Backend teammate: add any AI tools used on the backend — e.g. for Django ORM queries, migration issues, LLM API integration]*

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

> *[Backend teammate: add detail on which apps have tests, what they cover, and any edge cases specifically tested]*

---

## Running the Project

### Backend


### Frontend


