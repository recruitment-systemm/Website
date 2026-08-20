# Recruitment Management Platform — Frontend

React single-page application for the recruitment management platform. Serves employees, admins, and candidates, consuming the authentication, job, and application/interview backend services.

## Key Features

- Organization and employee authentication (including LinkedIn OAuth)
- Admin dashboard for organization approval
- Job posting management with drag-and-drop status boards
- Candidate application submission and tracking (with resume upload)
- Interview scheduling and management
- Map-based location display (Leaflet)

## Tech Stack

- React 19 + TypeScript
- Vite 8
- React Router
- React Hook Form + Zod (form validation)
- Tailwind CSS 4, Radix UI, shadcn
- dnd-kit (drag and drop)
- Leaflet / react-leaflet (maps)
- oxlint (linting)

## Prerequisites

- Node.js

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` with the backend service URLs (see below), then start the dev server:

```bash
npm run dev
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run lint` | Run oxlint |
| `npm run preview` | Preview the production build locally |
| `npm run deploy` | Build and publish `dist/` to GitHub Pages |

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_AUTH_SERVICE_URL` | Base URL of authentication-service |
| `VITE_JOB_SERVICE_URL` | Base URL of job-service |
| `VITE_APPLICATION_SERVICE_URL` | Base URL of Application-Interview-Services |

For local development with all backend services running locally:

```env
VITE_AUTH_SERVICE_URL=http://localhost:8081
VITE_JOB_SERVICE_URL=http://localhost:8082
VITE_APPLICATION_SERVICE_URL=http://localhost:8083
```

See `.env.example` for an alternative single-tunnel (ngrok) setup used when exposing local backends to a hosted frontend.

## Project Structure

Feature-based organization under `src/`:

```text
src/
├── admin/          # Admin dashboard (organization approval)
├── applications/   # Candidate application pages/components
├── auth/           # Authentication (login, signup, LinkedIn OAuth)
├── candidates/     # Candidate-facing pages
├── components/     # Shared UI primitives (shadcn/Radix-based)
├── dashboard/      # Employee/organization dashboard
├── interviews/     # Interview scheduling and management
├── jobs/           # Job posting management
├── landing/        # Public landing pages
├── lib/            # Utilities
├── organizations/  # Organization profile/management
├── routes/         # Route definitions (AppRoutes.tsx)
├── shared/         # Cross-feature API clients, types, layouts, config
└── users/          # User/employee management
```

Each feature module typically contains its own `api/`, `components/`, `pages/`, `types/`, and `validation/` subfolders.

## Deployment

The app is configured for GitHub Pages deployment (`homepage` in `package.json`, `base: "/Website/"` in `vite.config.ts`). Run `npm run deploy` to build and publish.
