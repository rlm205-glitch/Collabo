# CWRU Collaboration

A web platform for CWRU students to discover, create, and join collaborative projects. Students can browse open projects, filter by skills and commitment level, manage their profile, and use an AI-powered assistant to find relevant opportunities.

---

## Table of Contents

- [Architecture Overview](#architecture-overview) -done
- [Tech Stack/ Major Dependencies](#tech-stack-major-dependencies) -done
- [Installation / Setup Instructions](#installation-setup-instructions) -done
- [Usage Example](#usage-example) -done
- [Repository Structure Overview](#repository-structure-overview) -done
- [Team Member Roles & Contributions](#team-member-roles-contributions) -need to do
- [Retrospective (Lessons Learned)](#retrospective-lessons-learned) -need to do
- [License](#license) -done

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

The frontend communicates with the backend via REST API calls (HTTP + JSON).
The backend handles business logic and database interactions.
The database stores users, projects, and related data.

Development was split into frontend and backend teams using Git feature branches and pull requests.

---

## Tech Stack/ Major Dependencies

### Frontend

- React
- TypeScript
- Tailwind CSS
- Vite

### Backend

- Django
- Django REST Framework
- SQLite

### AI Integration

- Ollama (local LLM runtime)
- nemotron-3-nano:4b model

### Other Tools

- Git + GitHub
- Node.js / npm
- Python 3.12+
- uv (Python package manager)

## Installation / Setup Instructions

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

## Usage Example

### Running the Application

1. Start backend server
2. Open http://localhost:8000
3. Register using a @case.edu email
4. Log in

### Example Workflow

Create a project:

- Title: "AI Study Group"
- Skills: Python, ML
- Commitment: 5 hrs/week

Browse projects:

- Filter by skills or availability

Join a project:

- Submit a join request with a message

Use AI assistant:

Example prompt:

"Find projects related to data science"

## Repository Structure Overview

```text
root/
├── frontend/                # React frontend
│   └── src/
│       ├── components/
│       └── App.tsx
│
├── backend/                # Django backend
│   ├── mainsite/
│   ├── user_authentication/
│   ├── project_management/
│   ├── profile_management/
│   └── llm_integration/
│
└── README.md
```

- Frontend handles UI and user interaction
- Backend handles API, authentication, and data
- Each backend app is separated by functionality (auth, projects, profiles, AI)

## Team Member Roles & Contributions

## Retrospective (Lessons Learned)

## License

This project is licensed under the MIT License.
