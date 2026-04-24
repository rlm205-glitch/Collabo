# Frontend Testing

Frontend testing was performed using mock objects with Vitest.

## Features Tested

- Project browsing and filtering
- User profile functionality

## Coverage Metrics

- Statement, branch, function, and line coverage

## Test Locations

- frontend/src/components/
- StudentDashboard.test.tsx
- UserProfileModal.test.tsx

## What is Covered

These tests align with functional test cases from the testing document:

- User Profile: TC_UP_01 – TC_UP_07
- Project Browsing & Filtering: TC_PBF_01 – TC_PBF_06

They verify expected frontend behavior for these features.

## How to Run

```bash
cd frontend
npm run test:coverage
```

## Limitations

- Uses mock objects (no real backend interaction)
- Does not test full system integration or API behavior

# Backend Testing

Backend testing was performed using Django's built-in `TestCase` framework with a temporary SQLite test database.

## Features Tested

- User registration and login
- Email verification
- Password reset
- User profile management
- Project creation, retrieval, listing, and deletion
- Project join requests and approvals
- Project reporting and admin moderation

## Coverage Metrics

- Model, view, and URL routing coverage via Django's test client
- Each test run uses an isolated database created and destroyed automatically

## Test Locations

- `backend/user_authentication/tests.py`
- `backend/profile_management/tests.py`
- `backend/project_management/tests.py`

## What is Covered

- Registration validation: email domain enforcement (`@case.edu`), password strength, duplicate accounts
- Login: valid vs invalid credentials, inactive account rejection
- Email verification token flow (send, verify, activate account)
- Password reset token flow (send, weak password rejection, valid reset)
- Profile update and retrieval (major, skills, interests, availability)
- Project CRUD: create, get by ID, list with filters, owner delete
- Join request workflow: request submission, owner approval, email notifications
- Project reporting: duplicate report prevention, invalid reason rejection, nonexistent project handling
- Admin-only endpoints: list reports, admin delete project with cascade, non-staff 403 enforcement

## How to Run

```bash
cd backend
python manage.py test
```

## Limitations

- `llm_integration` has no tests
- Uses Django's test client without real HTTP communication
- Does not test full stack integration with the frontend
