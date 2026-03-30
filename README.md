# Gaming Features Admin Panel

A configuration dashboard for managing three independent gaming features — **Leaderboard**, **Raffle**, and **Wheel (Spin-to-Win)** — built as a professional admin panel using React, TypeScript, and Material UI.

---

## 1. Project Overview

The Gaming Features Admin Panel allows operators to create, configure, and manage three types of gaming promotions. Each feature is fully independent: Leaderboard manages competitive scoring configurations with prizes, Raffle manages ticket-based prize draws, and Wheel manages weighted spin-to-win segments. All CRUD operations are backed by a local mock REST API.

---

## 2. Architecture

### Module Boundaries

Each feature (`leaderboard`, `raffle`, `wheel`) lives in its own self-contained directory under `src/features/`. A feature owns its own types, Zod schemas, API functions, React Query hooks, form components, and pages. **No feature imports from another feature.** Shared infrastructure (API client, error boundaries, utility functions, route constants) lives in `src/shared/`, `src/lib/`, and `src/routes/`.

Removing any single feature directory will not break the other two features.

### Folder Structure

```
src/
├── App.tsx                        # Route tree + providers
├── main.tsx
├── features/
│   ├── leaderboard/
│   │   ├── api/index.ts           # leaderboardApi + leaderboardKeys
│   │   ├── components/
│   │   │   └── LeaderboardForm.tsx
│   │   ├── hooks/index.ts         # useLeaderboards, useCreateLeaderboard, …
│   │   ├── pages/
│   │   │   ├── LeaderboardListPage.tsx
│   │   │   ├── LeaderboardCreatePage.tsx
│   │   │   ├── LeaderboardEditPage.tsx
│   │   │   └── LeaderboardDetailPage.tsx
│   │   ├── schemas/index.ts       # Zod schema + inferred form types
│   │   ├── types/index.ts         # Leaderboard, LeaderboardPrize, …
│   │   └── index.ts
│   ├── raffle/                    # (same structure as leaderboard)
│   └── wheel/
│       ├── components/
│       │   ├── WheelForm.tsx
│       │   └── WheelPreview.tsx   # SVG wheel visualisation
│       └── …
├── layouts/
│   └── AdminLayout/index.tsx      # Sidebar + top bar + breadcrumbs
├── lib/
│   ├── apiClient.ts               # Axios instance (baseURL: /api)
│   ├── queryClient.ts             # TanStack Query client
│   └── theme.ts                   # MUI theme
├── routes/
│   └── paths.ts                   # PATHS constants (no hardcoded strings)
├── shared/
│   ├── components/
│   │   ├── ErrorBoundary.tsx      # Global error boundary
│   │   ├── FeatureBoundary.tsx    # Per-feature error boundary (wraps Outlet)
│   │   ├── NotFoundPage.tsx
│   │   └── PageLoader.tsx
│   ├── hooks/
│   │   └── useUnsavedChangesWarning.ts
│   ├── types/index.ts
│   └── utils/index.ts
└── styles/
    └── colors.ts
```

---

## 3. Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | React | 19.x | UI rendering |
| Language | TypeScript | 5.9.x | Type safety |
| Build tool | Vite | 8.x | Fast dev server + bundler |
| Routing | React Router v6 | 6.x | Client-side routing |
| UI library | Material UI (MUI) | 7.x | Component library + sx styling |
| Server state | TanStack React Query | 5.x | Async data fetching + caching |
| Forms | React Hook Form | 7.x | Performant form state |
| Validation | Zod | 4.x | Schema validation (form types via `z.infer<>`) |
| HTTP client | Axios | 1.x | API requests |
| Mock backend | json-server | 0.17.x | REST API from `db.json` |
| Process runner | concurrently | 9.x | Run API + Vite in one command |

---

## 4. Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd onaim-project

# 2. Install dependencies
npm install

# 3. Start the development server (API + Vite run together)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The mock API runs on port **3001** and is proxied through Vite at `/api`.

> **No environment variables required.** The Vite proxy forwards all `/api` requests to `http://localhost:3001`.

---

## 5. Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts **both** the mock API (port 3001) and Vite dev server (port 5173) concurrently |
| `npm run dev:client` | Starts only the Vite dev server (requires API to be running separately) |
| `npm run api` | Starts only the json-server mock API on port 3001 |
| `npm run build` | Type-checks and builds the production bundle into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint across all source files |

---

## 6. API Reference

The mock API is powered by **json-server** reading `db.json`. All endpoints follow REST conventions.

### Base URL

```
http://localhost:3001   (direct)
/api                    (via Vite proxy in development)
```

### Leaderboards — `/leaderboards`

| Method | Path | Description |
|---|---|---|
| GET | `/leaderboards` | List all leaderboards. Supports `_page`, `_limit`, `_sort`, `_order`, `status` query params. Returns `X-Total-Count` header. |
| GET | `/leaderboards/:id` | Get a single leaderboard |
| POST | `/leaderboards` | Create a leaderboard |
| PUT | `/leaderboards/:id` | Full update (edit) |
| PATCH | `/leaderboards/:id` | Partial update (bulk status toggle) |
| DELETE | `/leaderboards/:id` | Delete a leaderboard |

**Leaderboard shape:**
```json
{
  "id": "lb-1",
  "title": "Weekly High Rollers",
  "description": "...",
  "startDate": "2026-03-01T00:00:00.000Z",
  "endDate": "2026-03-31T23:59:59.000Z",
  "status": "active",
  "scoringType": "wagered",
  "maxParticipants": 100,
  "prizes": [
    { "id": "lbp-1", "rank": 1, "name": "Gold Trophy", "type": "coins", "amount": 10000, "imageUrl": "..." }
  ],
  "createdAt": "2026-02-15T10:00:00.000Z",
  "updatedAt": "2026-02-15T10:00:00.000Z"
}
```

### Raffles — `/raffles`

| Method | Path | Description |
|---|---|---|
| GET | `/raffles` | List raffles. Supports pagination, sorting, `status` filter. |
| GET | `/raffles/:id` | Get a single raffle |
| POST | `/raffles` | Create a raffle |
| PUT | `/raffles/:id` | Full update |
| DELETE | `/raffles/:id` | Delete |

**Raffle shape:**
```json
{
  "id": "r-1",
  "name": "Spring Mega Raffle",
  "description": "...",
  "startDate": "2026-04-01T00:00:00.000Z",
  "endDate": "2026-04-20T23:59:59.000Z",
  "drawDate": "2026-04-25T18:00:00.000Z",
  "status": "draft",
  "ticketPrice": 5,
  "maxTicketsPerUser": 10,
  "totalTicketLimit": 1000,
  "prizes": [
    { "id": "rp-1", "name": "Grand Prize", "type": "coins", "amount": 50000, "quantity": 1, "imageUrl": "..." }
  ],
  "createdAt": "2026-03-10T09:00:00.000Z",
  "updatedAt": "2026-03-10T09:00:00.000Z"
}
```

### Wheels — `/wheels`

| Method | Path | Description |
|---|---|---|
| GET | `/wheels` | List wheels. Supports pagination, sorting, `status` filter. |
| GET | `/wheels/:id` | Get a single wheel |
| POST | `/wheels` | Create a wheel |
| PUT | `/wheels/:id` | Full update |
| DELETE | `/wheels/:id` | Delete |

**Wheel shape:**
```json
{
  "id": "w-1",
  "name": "Daily Bonus Wheel",
  "description": "...",
  "status": "active",
  "backgroundColor": "#FFFFFF",
  "borderColor": "#2C3E50",
  "maxSpinsPerUser": 3,
  "spinCost": 0,
  "segments": [
    { "id": "ws-1", "label": "100 Coins", "color": "#E74C3C", "weight": 40, "prizeType": "coins", "prizeAmount": 100, "imageUrl": "" }
  ],
  "createdAt": "2026-02-20T12:00:00.000Z",
  "updatedAt": "2026-02-20T12:00:00.000Z"
}
```

---

## 7. Design Decisions — არქიტექტურული გადაწყვეტილებები

### Feature-based არქიტექტურა

პროექტში გამოვიყენეთ feature-based მიდგომა, რადგან ის უზრუნველყოფს მოდულარობას და მასშტაბირებადობას. თითოეული ფიჩერი დამოუკიდებელია, რაც ამარტივებს როგორც დეველოპმენტს, ისე ტესტირებას და მომავალში გაფართოებას.

### Server State-ის მართვა React Query-ით

სერვერის მონაცემების მართვისთვის არჩეულია TanStack React Query, რადგან:
	•	ავტომატურად მართავს caching-ს
	•	ამარტივებს loading/error state-ების კონტროლს
	•	უზრუნველყოფს cache invalidation-ს მუტაციების შემდეგ

ამის შედეგად კომპონენტები ხდება უფრო მარტივი და მხოლოდ UI ლოგიკაზე ფოკუსირებული.

### Mock Backend — json-server

რეალური backend-ის ნაცვლად გამოყენებულია json-server, რათა:
	•	სწრაფად ამუშავდეს პროექტი დამატებითი კონფიგურაციის გარეშე
	•	შესაძლებელი იყოს სრული CRUD ფუნქციონალის ტესტირება
	•	reviewer-მა მარტივად გაუშვას პროექტი ერთ ბრძანებაში

ეს განსაკუთრებით მნიშვნელოვანია დემო და შეფასების პროცესისთვის.
