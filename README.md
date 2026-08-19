# Alignment Memory — Frontend

React + TypeScript + Vite SPA. Deployed on Vercel.

## Structure

```
src/
  auth/           GitHub OAuth login
  dashboard/      Project Memory overview
  alignment/      Alignment detail + findings
  graph/          Knowledge graph visualization (@xyflow/react)
  passport/       Context Passport viewer
  feedback/       Handshake + Override UI
  repositories/   Connect + Initial Sync
  shared/         API client, components, styles, types
```

## Quick Start

```bash
npm ci
VITE_API_BASE_URL=http://127.0.0.1:8000 VITE_FIXTURE_MODE=true npm run dev
```

## Environment Variables

- `VITE_API_BASE_URL` — Backend API URL
- `VITE_SUPABASE_URL` — Supabase project URL (for OAuth redirect)
- `VITE_FIXTURE_MODE` — Set to `true` for local development without backend
