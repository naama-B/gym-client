# PULSE — Gym client

A React front end for the **Gym API** (the .NET class-booking server). Members browse the
schedule, book a spot or join the waitlist, track their queue position, and rate classes they
attended. Admins schedule sessions, curate the class catalogue and instructor roster, and read
each session's waiting list.

> Design language: **"Kinetic & bold", daylight cut** — bright bone canvas, near-black ink, one
> electric-orange accent, oversized display type, motion on transitions. (The auth split-screen
> keeps a dark hero panel.)

## Stack

| | |
|---|---|
| Build | Vite 8 + React 19 + TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme`), hand-built component library |
| Data | TanStack Query v5 (caching, invalidation, optimistic-ish refetch) |
| Routing | React Router v7 |
| Motion | `motion` (Framer Motion) |
| Icons | `lucide-react` |

## Running it

The client talks to the Gym API. Start the API first:

```bash
# in the server repo
dotnet run --project Gym.API        # serves http://localhost:5204
```

Then the client:

```bash
npm install
npm run dev                          # http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5204`, so there's no CORS setup and no
self-signed-certificate prompt. Override the target in `.env.local` (see `.env.example`) if your
API listens elsewhere.

### Demo accounts (seeded by the API)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gym.local` | `Admin#123` |
| Member | `dana@gym.local` | `Member#123` |

The login screen has one-tap buttons for both.

## Scripts

```bash
npm run dev         # dev server with HMR
npm run build       # type-check + production build to dist/
npm run preview     # serve the production build
npm run typecheck   # tsc, no emit
npm run lint        # oxlint
```

## Project shape

```
src/
  api/          fetch client, DTO types, endpoint groups, React Query hooks
  auth/         AuthContext — JWT in localStorage, auto-logout on expiry / 401
  components/
    ui/         Button, Card, Badge, Field, Modal, Toast, StarRating, …
    layout/     AppShell (nav + footer)
    SessionCard, RateModal, ProtectedRoute, Logo
  lib/          cn (class merge), date/format helpers, small hooks
  pages/        Login, Register, Sessions, SessionDetail, Reviews, MyBookings
    admin/      AdminLayout + Sessions / ClassTypes / Instructors
```

## How it maps to the API

- `POST /auth/login|register` → `AuthContext`
- `GET /classsessions` (paged, `search`, `onlyAvailable`, `sortBy`, `fromUtc`) → **Classes** — only sessions that haven't taken place yet
- `GET /classsessions/reviews` → **Reviews** — every rated class, its title + instructor, then the reviews
- `GET /classsessions/{id}` + `GET /classsessions/{id}/ratings` → **Class detail**
- `POST /bookings`, `POST /bookings/{id}/cancel`, `GET /bookings/mine` → booking flow + **My bookings**
- `POST /classsessions/{id}/ratings` → star rating (create or update)
- `GET /classsessions/{id}/waitlist` (admin) → inline waiting-list viewer
- `POST /classsessions`, `POST /classsessions/{id}/cancel` → **Admin › Sessions**
- `GET/POST/PUT/DELETE /classtypes`, `GET/POST /instructors` → **Admin › Class types / Instructors**
