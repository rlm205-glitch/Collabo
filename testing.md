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