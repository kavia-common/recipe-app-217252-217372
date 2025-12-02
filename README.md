# Recipe App - Frontend (React + Vite)

This folder contains the minimal React + Vite application for the Recipe App Frontend Web Application container. It replaces the previous empty placeholder so the preview no longer renders a blank page.

## Getting Started

- Install dependencies:
  - npm install

- Run in development:
  - npm run dev

- Build:
  - npm run build

- Preview the production build:
  - npm run preview

The app renders a simple header and routes to confirm the build and runtime environment work.

## Environment Variables

Do not hardcode configuration. Copy `.env.example` to `.env` and set values as needed:

- `VITE_SITE_URL` - The site base URL (used for link generation or redirects)
- `VITE_API_BASE_URL` - Backend API base URL

These should be configured by the orchestrator in CI/CD or the deployment environment.

## Notes

- This is a bootstrap to avoid blank preview. Replace with real UI, routes, and API integration.
