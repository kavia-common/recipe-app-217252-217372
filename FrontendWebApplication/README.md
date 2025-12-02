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
- `REACT_APP_IMAGE_CACHE_BUST` (default: `true`): when true, mock images include a small build seed (`&v=1`). Images always include a stable per-recipe cache buster (`?rid=<id>`), ensuring distinct images in previews.
- Local assets are not modified by cache-busting to preserve caching semantics.

Create a `.env` in the app root if needed (do not commit secrets):

```
REACT_APP_API_BASE=https://api.example.com/api/v1
# To run the UI without a backend:
REACT_APP_USE_MOCK_API=true
# Optional: control mock image build seed (keeps per-ID cache busting regardless)
REACT_APP_IMAGE_CACHE_BUST=true
```

## Mock Mode (No-backend Preview)

When `REACT_APP_USE_MOCK_API=true`:
- GET /recipes, /recipes/{id}, and /categories return representative mock datasets from `src/mocks/`.
- AuthContext uses a fake login with a localStorage token and a mock user; logging in sets a mock token.
- Feedback and profile actions stub success and update local mock profile.
- Header shows a small “Mock Mode” badge and the health indicator reads “API: Mocked.”
- Diagnostics page indicates mock mode and does not perform real network requests.
- Mock images are guaranteed unique per recipe and reliably load in previews thanks to an ingredient-aware curated, food-only image set:
  - Primary: deterministic curated URL chosen by analyzing a recipe’s ingredients, category, cuisine, and title, mapped against a curated keyword→URL list.
  - Fallback1: alternate curated URL computed via the next deterministic index (ensures a different image/host where possible).
  - Fallback2: bundled local placeholder at `/assets/food-placeholder.jpg`.
  - Stable per-recipe cache-busting param: `?rid=<recipe-id>` and optional build seed `&v=1` when `REACT_APP_IMAGE_CACHE_BUST=true`.
  - Local assets are not modified by cache-busting to preserve caching semantics.
- No generic/landscape/random sources (e.g., picsum) are used in mock mode to guarantee food-only visuals.

To disable mock mode, remove the env variable or set it to `false`.

### Customizing the curated image set

Ingredient-aware images live in `src/mocks/imageUtil.js`:

- PUBLIC_INTERFACE getIngredientKeywords(recipe): Extracts normalized keywords like `['chicken','garlic','pasta','salad','curry','soup','taco','pizza','beef','vegan','dessert','pancake','tofu','shrimp']` from ingredients, category, cuisine, and title.
- curatedFoodImageMap: Maps these keywords (ingredients/categories/cuisines) to one or more hand-picked, food-only CDN URLs.
- PUBLIC_INTERFACE selectFoodImageForRecipe(recipe, indexHint): Chooses the best image deterministically based on extracted keywords; uses recipe.id hash or indexHint to pick a stable URL; appends `?rid=<id>` (and `&v=1` when enabled).
- PUBLIC_INTERFACE deterministicFallbacks(recipe): Provides a three-stage fallback chain: primary curated URL → alternate curated URL → local `/assets/food-placeholder.jpg`.

To expand the curated map:
- Edit `curatedFoodImageMap` inside `src/mocks/imageUtil.js` to add or adjust keyword arrays.
- Prefer food-only images around 1200x675 for best quality.
- Use hotlink-friendly sources (e.g., Cloudinary demo, jsDelivr-hosted static images).
- Avoid non-food or random generators.

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
