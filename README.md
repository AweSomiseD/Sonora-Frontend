# Sonora — Frontend

React 19 + Vite 8 + Tailwind CSS v4 single page app for **Sonora**, a music platform for listeners and artists.

- Everyone signs up as a **listener**. Listeners can apply to become **artists**; an admin approves the request.
- Users who are both listener and artist switch between **Listener** and **Artist Studio** with one click.
- A global player keeps playing while you move between pages (queue, shuffle, repeat, keyboard shortcuts, Media Session).
- Playlists, notifications, artist analytics, listener stats, reports, Stripe Premium, real-time chat.

The backend lives in the sibling `Backend/` folder (see its README for the full architecture and API).

## Requirements

- Node.js **22+**
- The Sonora backend running (default `http://localhost:3000`)

## Setup

```bash
npm install
cp .env.example .env.local   # then edit if your backend is not on localhost:3000
npm run dev                  # http://localhost:5173
```

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` | Backend API base URL (with `/api`) |
| `VITE_SOCKET_URL` | `http://localhost:3000` | Socket.IO server (backend origin) |
| `VITE_MAX_AUDIO_MB` | `25` | Max audio upload size shown/checked in the browser. Keep equal to the backend `MAX_AUDIO_MB`. |

`VITE_*` values are public (they are baked into the JS bundle). Never put secrets in them.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | oxlint |
| `npm test` | Vitest + Testing Library (jsdom) |

## Folder map

```
src/
  components/      shared UI (PlayerBar, DashboardLayout, SwitchRoleButton, Charts, ...)
  components/ui/   small UI kit: Button, Input, Modal, Tabs, Skeleton, EmptyState, ...
  context/         Auth, Notifications, Player, Toast providers
  hooks/           usePageTitle, usePaginatedList
  pages/           one file per route (lazy loaded)
  routes/          AppRoutes + path helpers
  services/        axios instance + refresh-token interceptor
  test/            Vitest tests
```

## How auth works in the browser

- Tokens are **httpOnly cookies** set by the backend. JavaScript never reads them.
- `services/interceptor.js` refreshes the access token once on `401` and retries queued requests.
- It also broadcasts events the app reacts to: `auth:banned` (ban screen with the reason), `auth:role-revoked`
  (artist access removed → back to Listener mode), `auth:session-expired` (login page), `plan:limit` (upgrade modal).

## Deployment

### Docker

```bash
docker build -t sonora-web \
  --build-arg VITE_API_URL=https://api.example.com/api \
  --build-arg VITE_SOCKET_URL=https://api.example.com .
docker run -p 8080:80 sonora-web
```

`nginx.conf` serves the build with an SPA fallback (`try_files ... /index.html`).

### Vercel / Netlify

`vercel.json` already rewrites unknown paths to `index.html`.

**Cookies across domains:** if the frontend and backend are on different sites (for example `app.vercel.app` and
`api.onrender.com`), browsers may block the auth cookies as third-party cookies. The most reliable fix is to serve the
API from the same site, for example with a Vercel rewrite:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://YOUR-BACKEND-HOST/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Then build with `VITE_API_URL=/api`. Socket.IO still connects to the backend origin (`VITE_SOCKET_URL`), so keep the
backend `CLIENT_URL` / `CORS_ORIGINS` set to your frontend URL.
