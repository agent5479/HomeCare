# CareMarshall (HomeCare) — Professional Care Management System

A production-ready web application for New Zealand home care providers. Manage clients, log care actions, schedule visits, coordinate teams, track NZ regulatory compliance, and view analytics — with offline support.

**Live site:** https://agent5479.github.io/HomeCare/

**Version:** 0.8

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Bootstrap 5 |
| Database | Firebase Realtime Database (multi-tenant) |
| Maps | Leaflet + OpenStreetMap |
| Charts | Recharts |
| Deployment | GitHub Actions → GitHub Pages |
| Offline | IndexedDB read cache + localStorage write queue + PWA shell |

## Quick Start

```bash
cd app
npm install
cp .env.example .env.local
# Add Firebase credentials and admin accounts to .env.local
npm run dev
```

## Project Structure

```
HomeCare/
  app/              # React application source
  docs/             # Production build output (GitHub Pages)
  archive/          # Legacy vanilla JS and Python backend
  .github/workflows # CI/CD deployment
```

## Offline Capabilities

1. **Read cache** — Tenant data persisted to IndexedDB; app loads cached data when offline or after refresh
2. **Write queue** — Mutations queued in `homeCarePendingChanges` localStorage; replayed on reconnect
3. **Optimistic UI** — Changes appear immediately; sync status overlay shows pending count
4. **Legacy compatible** — Reads old `beeMarshallPendingChanges` queue key on first load

## User Roles

- **Master Admin / Admin** — Full access including team and task management
- **Employee** — View/create/update; cannot delete records

## Documentation

- [React App README](app/README.md) — Development and architecture details
- [Functional Settings](FUNCTIONAL_SETTINGS_README.md) — Deployment secrets and Firebase rules

## License

MIT
