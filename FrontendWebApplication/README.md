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

## Environment Variables

Set one of the following (already supported by container env):
- `REACT_APP_API_BASE` (preferred)
- `REACT_APP_BACKEND_URL`

If neither is set, the app uses `/api` as the default base.

You may also set (optional):
- `REACT_APP_HEALTHCHECK_PATH` (not required; health check uses `/health` on the API base)

Create a `.env` in the app root if needed (do not commit secrets):

```
REACT_APP_API_BASE=https://api.example.com/api/v1
```

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

## Notes

- JWT is stored in memory and persisted to localStorage as `auth_token`.
- Authorization is attached automatically via `Authorization: Bearer <token>`.
- If the backend is unavailable, the app handles errors gracefully and shows health status in the header.
