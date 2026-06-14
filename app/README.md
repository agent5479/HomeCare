# CareMarshall React App

Professional care management system for New Zealand home care providers.

## Development

```bash
cd app
npm install
cp .env.example .env.local
# Fill in Firebase and admin credentials in .env.local
npm run dev
```

Open http://localhost:5173/HomeCare/

## Build

```bash
cd app
npm run build
```

Output is written to `../docs/` for GitHub Pages deployment.

## Architecture

- **React 19 + TypeScript + Vite** — SPA with code-split routes
- **Firebase Realtime Database** — Multi-tenant data at `tenants/{tenantId}/`
- **Offline support**
  - IndexedDB read cache (`offlineCache.ts`) — data survives page refresh offline
  - localStorage write queue (`syncManager.ts`) — compatible with legacy `homeCarePendingChanges` key
  - Unified mutations (`mutations.ts`) — all writes go through optimistic update + queue
- **PWA** — Static asset caching via vite-plugin-pwa (Firebase API not cached)

## Environment Variables

See `.env.example` for all `VITE_*` variables. In production, GitHub Actions injects these from repository secrets.

## Routes

| Path | Feature |
|------|---------|
| `/` | Landing page |
| `/login` | Authentication |
| `/dashboard` | Overview metrics |
| `/clients` | Client list |
| `/clients/new`, `/clients/:id` | Client form + map |
| `/actions`, `/actions/log` | Care action logging |
| `/schedule` | Task scheduling |
| `/tasks` | Task library (admin) |
| `/compliance` | NZ regulatory compliance |
| `/integrity` | Data integrity checks |
| `/team` | Employee management (admin) |
| `/reports` | Care analytics charts |

## Legacy Code

Pre-React vanilla JS app archived at `archive/legacy-react-migration/`.
