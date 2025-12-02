# Recipe App - Frontend (React)

A responsive and accessible React UI for browsing, filtering, and viewing recipes, with authentication, profile management, and feedback, powered by a REST API.

## Features

- Home with Featured, Trending, and New sections
- Recipe browsing with filters (category, cuisine, difficulty, sort) and client-side pagination
- Recipe details with image, ingredients, steps, and badges
- Auth: Register, Login, Logout, Profile view/update
- Feedback submission (auth required) and admin feedback list
- Favorites: save/unsave recipes and view your saved list (auth required)
- Mock mode (no-backend preview): all API calls are served from in-app mocks
- Favorites in Mock Mode are persisted to localStorage under key `favorites` and work end-to-end without a backend

### Mock Mode Images (Local, category & ingredient aware, unique per recipe)
Mock Mode uses strictly local food images and assigns them deterministically:
- Primary: category group pick using a stable hash of `recipe.id` → no duplicates within a category until its pool is cycled.
- Secondary: another image within the same category group (when available) to avoid flicker and loops.
- Cuisine fallback: maps cuisines to relevant category groups (e.g., Italian → Pasta/Pizza; Mexican → Tacos; Indian → Curry).
- Ingredient-aware nudge: ingredients/title keywords can influence category group choice when category is missing.
- General pool fallback: stable spread across the expanded local pool (24 images).
- Final: bundled local placeholder `/assets/food-placeholder.jpg`.

Files and customization:
- Mapping lives in `src/mocks/imageUtil.js`:
  - PUBLIC_INTERFACE selectCategoryImagePath(recipe): returns `/assets/food/food-XX.jpg` deterministically per recipe.
  - CAT_GROUPS: category groups mapped to indices in the expanded pool (edit to your preference).
  - CUISINE_TO_CATEGORY: routes cuisines to category groups.
- Local assets: `public/assets/food/food-01.jpg` … `food-24.jpg` (provide at least 12; 24 recommended). No external CDNs.
- Components implement a three-stage fallback: primary → same-group alternate → placeholder, and they guard against infinite onError loops.

Note: Local image URLs never get cache busters and remain stable between reloads for preview reliability.
>>>>>>> REPLACE   
````   
````edit file="recipe-app-217252-217372/FrontendWebApplication/README.md"      
<<<<<<< SEARCH
- `/profile` Profile (protected)
- `/favorites` Favorites (protected)
=======
- `/profile` Profile (protected)
- `/favorites` Favorites (protected)
>>>>>>> REPLACE   
````   
````edit file="recipe-app-217252-217372/FrontendWebApplication/README.md"      
<<<<<<< SEARCH
## Favorites

Favorites let authenticated users save recipes they love:

- Heart button on recipe cards and details toggles favorite state (keyboard accessible; aria-pressed reflects state).
- Your Favorites page lists all saved recipes.

Behavior:
- Mock Mode: stored in localStorage (`favorites`) and available offline in preview.
- Live Backend: will call API endpoints if available:
  - GET /user/favorites
  - POST /user/favorites { recipeId }
  - DELETE /user/favorites/{recipeId }
If these endpoints are unavailable, the UI falls back to localStorage gracefully.

## Mock Mode (No-backend Preview)
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
- Mock images now use bundled, local food assets to guarantee reliability in preview environments:
  - Primary: deterministic local URL selected from `/assets/food/food-01.jpg` … `/assets/food/food-12.jpg` by hashing recipe id/category/cuisine/title along with ingredient-derived keywords.
  - Fallback1: alternate local image computed using the next deterministic index.
  - Fallback2: bundled local placeholder at `/assets/food-placeholder.jpg`.
  - Local assets are never cache-busted, ensuring correct caching semantics.
- All external image hosts (Unsplash/picsum/CDN) are removed from mock mode to ensure food-only local images.

To disable mock mode, remove the env variable or set it to `false`.

### Customizing the local image set

Ingredient-aware logic lives in `src/mocks/imageUtil.js`:

- PUBLIC_INTERFACE getIngredientKeywords(recipe): Extracts normalized keywords from ingredients, category, cuisine, and title.
- PUBLIC_INTERFACE selectFoodImageForRecipe(recipe, indexHint): Chooses a local image deterministically; maps stable recipe hash/keywords to an index in the 12-image set.
- PUBLIC_INTERFACE deterministicFallbacks(recipe): Provides the three-stage local fallback chain.

To replace bundled images with your own:
1) Put 12 distinct food images at:
   - `public/assets/food/food-01.jpg` through `food-12.jpg`
2) Ensure they are reasonably sized and visually distinct.
3) No code changes are required if filenames follow the above convention.

Tip: If you need more images, you can extend the `FOOD_ASSETS` array in `src/mocks/imageUtil.js` to include additional local files.

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

## Admin: Edit and Delete Recipes

Admin users see additional controls:
- On Recipe Detail: "Edit" and "Delete" buttons near the title.
- On Recipe cards: a small Edit/Delete control group appears for admins.
- Route: `/recipes/:id/edit` provides a full edit form (title, description, ingredients list editor, steps list editor, imageUrl, category, difficulty, cuisine, prepTime, cookTime, isFeatured). The form uses accessible labels and client-side validation.

Behavior:
- After a successful update, you are redirected to the recipe detail and shown a success banner.
- Deleting a recipe asks for confirmation; on success it navigates back to `/recipes` with a banner.

Mock Mode vs Live Backend:
- Live Backend: Uses `PUT /recipes/{id}` and `DELETE /recipes/{id}` with a bearer JWT (admin only).
- Mock Mode: Updates and deletes are persisted locally in `localStorage` under `mock_recipes_dataset`, so changes survive reloads.

## Notes

- JWT is stored in memory and persisted to localStorage as `auth_token`.
- Authorization is attached automatically via `Authorization: Bearer <token>`.
- If the backend is unavailable, the app handles errors gracefully and shows health status in the header.
- In mock mode, requests are served from in-app mocks and no network is used.

## Top-level Categories (Veg, Non-Veg, Snacks, Desserts)

The UI exposes new top-level categories in multiple places:
- Quick chips on Home and in the Filters component (keyboard focusable, aria-pressed reflects selection).
- Category select dropdown also includes these values.
- Selection is clearable.

Behavior:
- Selecting a top-level category sets the query param `category=<value>` and triggers a fetch to GET /recipes with that param.
- No backend changes are required; the value is passed through as-is to `/recipes?category=<value>`.

Mock Mode mapping:
- Each recipe is assigned a derived `topLevelCategory` field based on ingredients/title/category heuristics:
  - Non-Veg: presence of meats/seafood/egg.
  - Desserts: dessert-like keywords in title/category.
  - Snacks: snack-like keywords in title/category.
  - Veg: default otherwise.
- When `category` matches one of the top-level values, mock filtering uses `recipe.topLevelCategory` instead of `recipe.category`.
- Free-text search (q) includes `topLevelCategory` matches as well.

Diagnostics:
- The Diagnostics page includes quick buttons to test `/recipes` with `category=Veg|Non-Veg|Snacks|Desserts`, showing the final request and counts. Admin edits/deletes are persisted locally.
=======
## Favorites

Favorites let authenticated users save recipes they love:

- Heart button on recipe cards and details toggles favorite state (keyboard accessible; aria-pressed reflects state).
- Your Favorites page lists all saved recipes.

Behavior:
- Mock Mode: stored in localStorage (`favorites`) and available offline in preview.
- Live Backend: will call API endpoints if available:
  - GET /user/favorites
  - POST /user/favorites { recipeId }
  - DELETE /user/favorites/{recipeId }
If these endpoints are unavailable, the UI falls back to localStorage gracefully.

## Mock Mode (No-backend Preview)
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
- Mock images now use bundled, local food assets to guarantee reliability in preview environments:
  - Primary: deterministic local URL selected from `/assets/food/food-01.jpg` … `/assets/food/food-12.jpg` by hashing recipe id/category/cuisine/title along with ingredient-derived keywords.
  - Fallback1: alternate local image computed using the next deterministic index.
  - Fallback2: bundled local placeholder at `/assets/food-placeholder.jpg`.
  - Local assets are never cache-busted, ensuring correct caching semantics.
- All external image hosts (Unsplash/picsum/CDN) are removed from mock mode to ensure food-only local images.

To disable mock mode, remove the env variable or set it to `false`.

### Customizing the local image set

Ingredient-aware logic lives in `src/mocks/imageUtil.js`:

- PUBLIC_INTERFACE getIngredientKeywords(recipe): Extracts normalized keywords from ingredients, category, cuisine, and title.
- PUBLIC_INTERFACE selectFoodImageForRecipe(recipe, indexHint): Chooses a local image deterministically; maps stable recipe hash/keywords to an index in the 12-image set.
- PUBLIC_INTERFACE deterministicFallbacks(recipe): Provides the three-stage local fallback chain.

To replace bundled images with your own:
1) Put 12 distinct food images at:
   - `public/assets/food/food-01.jpg` through `food-12.jpg`
2) Ensure they are reasonably sized and visually distinct.
3) No code changes are required if filenames follow the above convention.

Tip: If you need more images, you can extend the `FOOD_ASSETS` array in `src/mocks/imageUtil.js` to include additional local files.

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
=======
- Mock mode (no-backend preview): all API calls are served from in-app mocks
- Favorites in Mock Mode are persisted to localStorage under key `favorites` and work end-to-end without a backend
>>>>>>> REPLACE   
````   
````edit file="recipe-app-217252-217372/FrontendWebApplication/README.md"      
<<<<<<< SEARCH
- `/profile` Profile (protected)
- `/favorites` Favorites (protected)
=======
- `/profile` Profile (protected)
- `/favorites` Favorites (protected)
>>>>>>> REPLACE   
````   
````edit file="recipe-app-217252-217372/FrontendWebApplication/README.md"      
<<<<<<< SEARCH
## Favorites

Favorites let authenticated users save recipes they love:

- Heart button on recipe cards and details toggles favorite state (keyboard accessible; aria-pressed reflects state).
- Your Favorites page lists all saved recipes.

Behavior:
- Mock Mode: stored in localStorage (`favorites`) and available offline in preview.
- Live Backend: will call API endpoints if available:
  - GET /user/favorites
  - POST /user/favorites { recipeId }
  - DELETE /user/favorites/{recipeId }
If these endpoints are unavailable, the UI falls back to localStorage gracefully.

## Mock Mode (No-backend Preview)
=======
## Favorites

Favorites let authenticated users save recipes they love:

- Heart button on recipe cards and details toggles favorite state (keyboard accessible; aria-pressed reflects state).
- Your Favorites page lists all saved recipes.

Behavior:
- Mock Mode: stored in localStorage (`favorites`) and available offline in preview.
- Live Backend: will call API endpoints if available:
  - GET /user/favorites
  - POST /user/favorites { recipeId }
  - DELETE /user/favorites/{recipeId }
If these endpoints are unavailable, the UI falls back to localStorage gracefully.

## Mock Mode (No-backend Preview)
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
- Mock images now use bundled, local food assets to guarantee reliability in preview environments:
  - Primary: deterministic local URL selected from `/assets/food/food-01.jpg` … `/assets/food/food-12.jpg` by hashing recipe id/category/cuisine/title along with ingredient-derived keywords.
  - Fallback1: alternate local image computed using the next deterministic index.
  - Fallback2: bundled local placeholder at `/assets/food-placeholder.jpg`.
  - Local assets are never cache-busted, ensuring correct caching semantics.
- All external image hosts (Unsplash/picsum/CDN) are removed from mock mode to ensure food-only local images.

To disable mock mode, remove the env variable or set it to `false`.

### Customizing the local image set

Ingredient-aware logic lives in `src/mocks/imageUtil.js`:

- PUBLIC_INTERFACE getIngredientKeywords(recipe): Extracts normalized keywords from ingredients, category, cuisine, and title.
- PUBLIC_INTERFACE selectFoodImageForRecipe(recipe, indexHint): Chooses a local image deterministically; maps stable recipe hash/keywords to an index in the 12-image set.
- PUBLIC_INTERFACE deterministicFallbacks(recipe): Provides the three-stage local fallback chain.

To replace bundled images with your own:
1) Put 12 distinct food images at:
   - `public/assets/food/food-01.jpg` through `food-12.jpg`
2) Ensure they are reasonably sized and visually distinct.
3) No code changes are required if filenames follow the above convention.

Tip: If you need more images, you can extend the `FOOD_ASSETS` array in `src/mocks/imageUtil.js` to include additional local files.

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
