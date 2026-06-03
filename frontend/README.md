# Frontend (Module Federation)

Micro-frontend layout:

| App | Role | Dev port |
|-----|------|----------|
| `shell/` | Host (health, links, loads remotes) | 5173 |
| `members-mfe/` | Members tester remote | 5174 |
| `facilities-mfe/` | Facilities tester remote | 5175 |
| `bookings-mfe/` | Bookings tester remote | 5176 |

## Local development

Start backends (`docker compose up` from repo root), then:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the shell loads remotes from ports 5174–5176.

## Production / Docker build

```bash
cd frontend
npm install
npm run build   # builds remotes, stages to shell/public/mf/*, builds shell
```

`docker compose` builds `frontend/Dockerfile` (one image, remotes served under `/mf/{members,facilities,bookings}/`).

## Architecture

- **Module Federation** (`@module-federation/vite`): each remote exposes `./MembersApp`, `./FacilitiesApp`, `./BookingsApp`.
- **Shell** lazy-imports remotes at runtime — separate builds, composed in the browser.
- **JWT** still shared via `localStorage` (`members_jwt_token`) between Members and Bookings remotes.
