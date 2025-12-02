# Recipe App - Frontend (React)

A responsive and accessible React UI for browsing, filtering, and viewing recipes, with authentication, profile management, and feedback, powered by a REST API.

## Features

- Home with Featured, Trending, and New sections
- Recipe browsing with filters (category, cuisine, difficulty, sort) and client-side pagination
- Recipe details with image, ingredients, steps, and badges
- Auth: Register, Login, Logout, Profile view/update
- Feedback submission (auth required) and admin feedback list
- Admin-only controls conditionally rendered (e.g., delete recipe button)
- Central API client with bearer JWT handling and environment-driven base URL
- Health check to `/health` for preview readiness
- Mobile-first, semantic, accessible UI
- Mock mode (no-backend preview): all API calls are served from in-app mocks

## Environment Variables

Set one of the following (already supported by container env):
- `REACT_APP_API_BASE` (preferred)
- `REACT_APP_BACKEND_URL`

If neither is set, the app uses same-origin + `/api` as the default base.

Optional:
- `REACT_APP_API_VERSIONED_PATH` to force a versioned path (e.g., `/api/v1`) regardless of the origin provided in the base.
- `REACT_APP_HEALTHCHECK_PATH` (not required; health check uses `/health` on the API base)
- `REACT_APP_USE_MOCK_API` enable mock mode when set to `true`.

Create a `.env` in the app root if needed (do not commit secrets):

```
REACT_APP_API_BASE=https://api.example.com/api/v1
# To run the UI without a backend:
REACT_APP_USE_MOCK_API=true
```

## Mock Mode (No-backend Preview)

When `REACT_APP_USE_MOCK_API=true`:
- GET /recipes, /recipes/{id}, and /categories return representative mock datasets from `src/mocks/`.
- AuthContext uses a fake login with a localStorage token and a mock user; logging in sets a mock token.
- Feedback and profile actions stub success and update local mock profile.
- Header shows a small “Mock Mode” badge and the health indicator reads “API: Mocked.”
- Diagnostics page indicates mock mode and does not perform real network requests.

To disable mock mode, remove the env variable or set it to `false`.

## Getting Started

From the `FrontendWebApplication` directory:

```
npm install
npm start
```

Open http://localhost:3000.

## Routes

- `/` Home
- `/recipes` List with filters
- `/recipes/:id` Details
- `/login`, `/register` Auth
- `/profile` Profile (protected)
- `/feedback` Feedback (protected)
- `/admin` Admin landing (links/controls are guarded and also shown contextually)
- `/diagnostics` Runtime diagnostics for API base and key endpoints

## Notes

- JWT is stored in memory and persisted to localStorage as `auth_token`.
- Authorization is attached automatically via `Authorization: Bearer <token>`.
- If the backend is unavailable, the app handles errors gracefully and shows health status in the header.
- In mock mode, requests are served from in-app mocks and no network is used.
