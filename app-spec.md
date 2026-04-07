# App Spec: TripTrack
*Personal project — Draft*

---

## 1. What This Is

TripTrack is a mobile-friendly web app for planning and tracking multiple trips with friends and family. Users manage a list of trips, build day-by-day itineraries, set per-category budgets, and log expenses as each trip unfolds. Multiple travelers share the same trip, so everyone can view the plan and see how spending tracks against each category budget in real time.

---

## 2. Core Features (v1)

- **Trips list**: Home screen showing all trips the user belongs to — trip name, destination photo, dates, trip status, and a simple budget health indicator (Under budget / Over budget). No numbers on the list — full budget detail lives inside each trip.
- **Trip creation**: Create a named trip with destination, date range, and per-category budgets.
- **Trip editing**: Edit trip name, destination, and dates from the trip banner. Per-category budgets are editable from the Budget tab.
- **Per-category budgets**: Set individual budgets for each category (Food, Transport, Lodging, Activities, Supplies, Other) when creating or editing a trip.
- **Shared access**: Invite friends/family by email; all members can view and edit the trip.
- **Itinerary builder**: Add, edit, and delete activities on specific days — each with a type (Activity | Meal | Transport | Stay | Other), name, time, location, and optional notes.
- **Expense logging**: Log, edit, and delete expenses with a category, amount, description, date (defaults to today, editable for past expenses), who paid, and an optional link to an itinerary item. Expenses logged before the trip start date are automatically tagged as "Pre-trip" in the UI (e.g. toiletries, travel-size items, gear bought before departure).
- **Budget tracker**: Per-category breakdown (budget vs. spent vs. remaining per category). The overall Budget / Spent / Remaining summary lives in the trip hero bar, visible from both tabs. No "Planned" total — that concept is removed.
- **Trip dashboard**: Shows today's itinerary items and a single budget health bar (spent vs. remaining). Category drill-down lives in the Budget tab, not here.

---

## 3. Out of Scope (v1)

- Bill splitting / debt tracking between travelers
- Multi-currency / currency conversion
- Offline mode
- Map or routing integrations
- Photo attachments to itinerary items or expenses
- Push notifications
- Export to PDF or calendar

---

## 4. User Flows

**Browsing trips**
User lands on the Trips screen and sees all trips they belong to — past, current, and upcoming. Each trip card shows the destination, dates, and a budget health indicator. They tap a trip to enter it and see the dashboard.

**Planning a trip**
User taps "New Trip," enters a name, destination, and dates, then sets a budget for each spending category — e.g., $400 for Lodging, $200 for Food, $150 for Transport. They add itinerary items day by day — e.g., "Day 1: Arrive, check in hotel at 3pm; dinner at La Mar at 7pm." They share the trip with companions via email invite. Companions accept and can view/edit the same trip.

**Logging an expense on the road**
A user taps "Add Expense," picks a category (e.g., Food), enters the amount, a short description, and a date (defaults to today but can be changed for past expenses). On save, the budget tracker immediately updates that category's spent vs. remaining.

**Checking the trip dashboard**
Any member opens the app and lands on the trip dashboard. They see today's scheduled activities and a single budget health bar showing overall spent vs. remaining. Category detail is one tap away in the Budget tab.

---

## 5. Tech Stack

**Tier 1 — No backend needed.**

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Standard stack, mobile-friendly web app |
| Styling | Tailwind CSS | Responsive/mobile-first layouts |
| Database | Supabase Postgres | Relational data, real-time sync for shared trips |
| Auth | Supabase Auth | Email-based invites, session management |
| Hosting | Vercel | Standard stack |

> **Assumption:** Supabase's real-time subscriptions handle live budget updates across devices without a custom backend.

---

## 6. Data Model

**User**
- `id` (uuid), `email` (text), `display_name` (text)

**Trip**
- `id` (uuid), `name` (text), `destination` (text), `start_date` (date), `end_date` (date), `created_by` (user id)
- One trip has many category budgets, itinerary items, expenses, and members.

**CategoryBudget**
- `id` (uuid), `trip_id` (uuid), `category` (enum: Food | Transport | Lodging | Activities | Supplies | Other), `amount` (numeric)
- One row per category per trip. Not all categories need a budget set.

**TripMember**
- `trip_id` (uuid), `user_id` (uuid), `role` (enum: owner | member)
- Join table connecting users to trips.

**ItineraryItem**
- `id` (uuid), `trip_id` (uuid), `date` (date), `time` (time, optional), `title` (text), `location` (text, optional), `notes` (text, optional), `type` (enum: Activity | Meal | Transport | Stay | Other)

**Expense**
- `id` (uuid), `trip_id` (uuid), `paid_by` (user id), `amount` (numeric), `category` (enum: Food | Transport | Lodging | Activities | Supplies | Other), `description` (text), `date` (date — user-specified, defaults to today), `itinerary_item_id` (uuid, optional — links to an ItineraryItem), `created_at` (timestamp)

---

## 7. Routes

| Path | Component | Notes |
|---|---|---|
| `/` | → `/trips` | Redirect |
| `/login` | `LoginPage` | Redirects to `/trips` if already authed |
| `/trips` | `Trips` | Home screen — trip list |
| `/trips/new` | `TripNew` | Create trip form |
| `/trips/:id` | `TripDetail` | Full trip dashboard with Itinerary / Budget tabs |
| `*` | → `/trips` | Catch-all redirect |

---

## 8. File & Folder Structure

```
triptrack/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx   # Auth screen (email + password)
│   │   ├── Trips.tsx       # Trips list (home screen)
│   │   ├── TripNew.tsx     # Create trip (name, dates, category budgets)
│   │   └── TripDetail.tsx  # Full trip view — Itinerary + Budget tabs
│   ├── components/
│   │   ├── TopNav.tsx      # Back button + page title bar
│   │   ├── TripBanner.tsx  # Destination photo/gradient hero with scrim
│   │   ├── Sheet.tsx       # Slide-up bottom sheet modal
│   │   ├── ProgressBar.tsx # Thin horizontal bar (budget/spend)
│   │   └── CategoryIcon.tsx # SVG icon per expense category
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client singleton
│   │   ├── types.ts        # All TypeScript interfaces + enums
│   │   └── constants.ts    # C color palette, CATEGORY_META, fmtDate, fmtDateFull, destinationGradient, getTripStatus
│   ├── hooks/
│   │   ├── useAuth.ts      # Supabase Auth session wrapper
│   │   ├── useTrips.ts     # Trip list + budget summaries
│   │   └── useTripDetail.ts # Full trip data + real-time subscriptions
│   └── main.tsx
├── index.html
├── vite.config.ts
└── supabase/
    └── migrations/         # Database schema migrations
```

---

## 9. Build Plan

| Phase | Goal | What's built |
|---|---|---|
| 1 | Scaffold + Auth | Vite project setup, Supabase connected, login/signup screens, nav shell |
| 2 | Trip & Itinerary | Create trip, set per-category budgets, invite members, itinerary builder (add/edit/delete items by day) |
| 3 | Budget & Expenses | Expense logging with date picker, per-category budget tracker UI, dashboard screen |
| 4 | Polish + Deploy | Real-time sync, edge case handling, Vercel deploy |

---

## 10. Claude Code Handoff Notes

- Use inline styles with the `C` color palette from `constants.ts` for all design-system colors — do not use Tailwind for colors or spacing that needs to match the palette. Tailwind utility classes are fine for layout (flex, grid, etc.).
- Use React Router for navigation.
- Design mobile-first — all layouts should work well on small screens.
- Use Supabase real-time subscriptions for live expense/budget updates across shared trips.
- No tests unless asked.
- No monorepo — single Vite project.
- Keep components small and in `/components`; no logic in page files beyond hooks.
- Use Row Level Security (RLS) in Supabase — users should only access trips they are members of.

---

## 11. Assumptions & Open Questions

> **Assumption:** The app is a mobile-first web app, accessible from any browser on phone or desktop. No native app store distribution for v1.

> **Assumption:** Trip invites are sent via Supabase Auth email; invited users must create an account to join.

> **Assumption:** Any trip member can add or edit itinerary items and expenses (no permission tiers beyond owner vs. member for now).

**Open questions to resolve before building:**
1. Should there be a way to remove a member from a trip, or is that v2?
2. Any preferred color scheme or app icon direction?

---

## 12. UI/UX Design

### Design System
- **Fonts**: Playfair Display (headings, numbers) + DM Sans (body, UI)
- **Palette**: Sand `#F5F0E8` background · Ink `#1A1A2E` text · Terra `#C4622D` primary accent · Teal `#2A7D6F` positive · Gold `#C89B3C` warning · Danger `#C0392B`
- **Icons**: SVG line icons (Lucide-style), consistent 15px stroke weight — no emojis in UI chrome
- **Cards**: White `#FFFFFF` on sand background, `border-radius: 12px`, subtle `1px` border + light shadow
- **Buttons**: Terra-filled primary, ghost secondary. Pill shape for category selectors.
- **Sheets**: Slide-up bottom sheets for all forms (add activity, log expense)

### Screen Structure

**Trips list**
- Destination photo banner (140px, dark gradient scrim for legibility)
- Trip name + destination/dates overlaid on photo
- Budget health indicator as primary signal: colored dot + label + `$X left` + thin progress bar
- Trip status (In progress / Upcoming / Completed) shown small and secondary
- Members list in muted text
- Upcoming trips: show total budget only, no health indicator (nothing spent yet)
- Completed trips: past-tense labels — "Came in under / Broke even / Went over"

**Trip detail hero**
- 140px destination photo with scrim
- Trip name + destination/dates overlaid
- Dark ink budget bar below photo showing Budget / Spent / Remaining (3 numbers only — no "Planned")
- Single progress bar. Status label: "Under budget / Over budget" only — no "On track" (v2: time-based tracking)

**Tabs: Itinerary / Budget**
Each tab owns its own primary action button (top-right):
- Itinerary → "+ Plan activity"
- Budget → "+ Log expense"

**Itinerary tab**
- "Today" pill (terra-colored) at top left — taps to scroll to today's section
- Full day-by-day list, all days always visible
- Today's day header and card borders highlighted in terra
- Activity cards: category icon, title, location, time, linked expense amount if any
- No cost field on activities — expenses are logged separately

**Dashboard tab**
- Today's itinerary items only (quick glance)
- Single overall budget health bar (spent vs remaining)
- Category drill-down lives in Budget tab, not here

**Budget tab**
- Per-category bars: category SVG icon + name + budget amount + spent amount + progress bar
- Full chronological expense list below
- Pre-trip expenses (date before trip start) tagged with gold "Pre-trip" pill
- Expenses show: date, description, category icon, linked itinerary item if any, amount

**Plan activity form** (sheet)
Fields: Type pill selector, Name, Time (optional), Location (optional), Notes (optional)
No cost field — costs are tracked via expenses, not activities.

**Log expense form** (sheet)
Fields: Category pill selector, Amount, Description, Date (defaults today), Paid by, Link to itinerary item (optional dropdown)

### v2 Notes
- Budget health "On track" label to use time-elapsed vs spend-rate logic (% of trip days passed vs % of budget spent), accounting for fixed pre-paid costs (flights, hotels) vs variable daily spend
