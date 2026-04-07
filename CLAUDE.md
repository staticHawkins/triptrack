# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # TypeScript check (tsc -b) + Vite production build
npm run preview  # Preview production build locally
```

There are no lint or test scripts configured. The build command (`tsc -b`) acts as the type-checker — always run `npm run build` to verify TypeScript before considering a change complete.

## Architecture

TripTrack is a React 19 + TypeScript SPA for shared trip planning. Stack: Vite, Tailwind CSS 4, React Router 7, Supabase (auth + Postgres + realtime), deployed on Vercel.

### Layers

```
React Router (App.tsx) → Pages → Custom Hooks → Supabase client
```

- **No global state manager.** All state lives in custom hooks and component state.
- **Real-time sync** is handled inside `useTripDetail` via Supabase channel subscriptions.
- **Auth** is managed by `useAuth` (wraps Supabase Auth session); `ProtectedRoute` in `App.tsx` guards non-login routes.

### Key directories

| Path | Role |
|---|---|
| `src/pages/` | Route-level components: `LoginPage`, `Trips` (home), `TripNew`, `TripDetail` |
| `src/components/` | Shared UI: `TopNav`, `TripBanner`, `Sheet` (bottom-sheet modal), `ProgressBar`, `CategoryIcon` |
| `src/hooks/` | `useAuth`, `useTrips` (trip list + budget summaries), `useTripDetail` (full trip dashboard, real-time) |
| `src/lib/` | `types.ts` (all TS interfaces), `constants.ts` (colors, gradients, `formatDate`), `supabase.ts` (client singleton) |
| `supabase/migrations/` | Database schema migrations |

### Data model

Core entities: `Profile`, `Trip`, `TripMember` (owner/member roles), `CategoryBudget` (per-trip per-category), `ItineraryItem`, `Expense`.

Budget categories are an enum: Food, Transport, Lodging, Activities, Supplies, Other. Colors and display names are centralized in `src/lib/constants.ts`.

### Environment

Requires a `.env` file with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_UNSPLASH_ACCESS_KEY` (destination cover photos)

### Deployment

`vercel.json` configures client-side routing rewrites so all paths serve `index.html`. Vercel reads env vars from its dashboard.
