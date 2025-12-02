# Recipe App - Frontend (React + Vite)

This folder contains the React + Vite application for the Recipe App Frontend Web Application container.

## Getting Started

- Install dependencies:
  - npm install

- Run in development:
  - npm run dev

- Build:
  - npm run build

- Preview the production build:
  - npm run preview

The app renders a Home page with a responsive grid of recipe cards using local placeholder data.

## Current Features

- Route "/" renders Home with heading "Discover Recipes"
- At least 8 placeholder recipe cards with title, image, description, tags, and a "View" button
- Responsive layout: 1 column <480px, 2 columns small, 3 columns medium, 4 columns large
- Accessible semantics: ul/li list, alt text for images, keyboard-focusable controls, focus-visible styles
- No external API calls; uses local data in `src/data/recipes.ts`

## File Structure (selected)

- `src/pages/Home.tsx` — Home page rendering the grid
- `src/components/RecipeCard.tsx` — Card component with accessible markup
- `src/data/recipes.ts` — Local placeholder data
- `src/App.tsx` — Routing and layout
- `src/styles.css` — Global styles including grid, card, and focus styles

## Environment Variables

Do not hardcode configuration. Copy `.env.example` to `.env` and set values as needed:

- `VITE_SITE_URL` - The site base URL (used for link generation or redirects)
- `VITE_API_BASE_URL` - Backend API base URL

These should be configured by the orchestrator in CI/CD or the deployment environment.
