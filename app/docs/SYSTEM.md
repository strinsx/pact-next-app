# Pact — System Context

## 1. What is Pact?

Pact is an **accountability app** that lets people make daily "commitments", hold each
other to them in small groups, and track personal progress. The core loop:

1. Sign up / sign in (email or Google).
2. Complete onboarding (pick a username, optionally create or join a group).
3. Create commitments — **Standard** (one-off), **Routine** (repeats on chosen
   weekdays), or **Scheduled** (on a chosen date).
4. Commit to each one before a per-profile daily **evaluation deadline**.
5. After the deadline, commitments are treated as **missed** automatically.
6. Stats (completion rate, submitted count, day streak) and analysis charts update live.
7. Group members see each other's commitments and completions in a shared feed.

---

## 2. Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Backend / Auth / DB | Supabase (`@supabase/ssr` browser client) |
| Icons | `lucide-react` (FontAwesome is **removed** by ESLint gate) |
| Animation | `motion` (installed, minimal usage) |
| Charts | Hand-rolled SVG (no chart library) |

Path alias `@/*` maps to the repository root (e.g. `@/app/components/X`).

---

## 3. Architecture Overview

- **Client-side SPA-style app** on top of Next.js App Router. Almost every page is a
  thin server shell rendering a `"use client"` component.
- **Supabase access is browser-only** (`createBrowserClient`). There is no server-side
  Supabase client and **no route middleware** — route protection happens in client
  components via `getCurrentUser()` + redirects.
- **Data is fetched on mount** by each card/component directly from the service layer.
- **Cross-component reactivity** uses a tiny module-level pub/sub (`app/lib/events.ts`):
  when one card mutates data it calls `emitDataChanged()`, and every subscribed card
  refetches. `GroupFeedCard` additionally uses a Supabase **real-time** subscription on
  `feed_posts`.

---

## 4. Directory Structure

```
app/
├── page.tsx                      # "/" -> redirect to /home
├── layout.tsx                    # root layout, fonts (Poppins, Nunito)
├── globals.css                   # Tailwind v4 theme tokens + .feed-scroll scrollbar
├── home/
│   └── page.tsx                  # SideNav + Home (protected dashboard)
├── groups/
│   └── page.tsx                  # SideNav + overview/join-access/members cards
├── auth/
│   ├── signup/page.tsx           # SignUp + Branding split layout
│   ├── login/page.tsx            # Login + Branding split layout
│   ├── callback/page.tsx         # OAuth callback: ensure profile, redirect
│   └── onboarding/page.tsx       # Onboarding (username / create / join / solo)
├── components/
│   ├── Home.tsx                  # composes the whole dashboard
│   ├── SideNav.tsx               # collapsible sticky sidebar
│   ├── StatCards.tsx             # completion rate / submitted / day streak
│   ├── CommitmentCard.tsx        # today's commitments + archive + status modal
│   ├── CommitmentModal.tsx       # create commitment (by type)
│   ├── CommitmentOptionsModal.tsx# pick Standard/Routine/Scheduled
│   ├── StatusModalComponent.tsx  # detail/edit/commit-as-status modal
│   ├── StatusDropdown.tsx        # pending/submitted/missed selector
│   ├── CommitConfirmationModal.tsx / ConfirmationModalForMissed.tsx
│   ├── ArchiveModal.tsx          # commitments past evaluation deadline
│   ├── MonthlyAnalysisCard.tsx   # "Daily Commitments" stacked bar chart (submitted/missed)
│   ├── WeeklyAnalysisCard.tsx    # "Weekly Consistency" area chart
│   ├── YearlyHeatmapCard.tsx     # "Yearly Contributions" GitHub-style heatmap
│   ├── AreaChart.tsx             # reusable SVG monotone area chart
│   ├── GroupRankingCard.tsx      # mock leaderboard (home)
│   ├── GroupFeedCard.tsx         # group feed (real-time posts, emoji reactions, comments)
│   ├── GroupsOverviewCard.tsx    # owned-group overview + invite link
│   ├── JoinAccessCard.tsx        # pending requests + invite link/code
│   ├── MembersCard.tsx           # mock member list
│   ├── CreateGroupModal.tsx / JoinGroupModal.tsx
│   ├── ErrorModal.tsx
│   ├── TimePicker.tsx / DatePicker.tsx
│   ├── Onboarding.tsx / SignUp.tsx / Login.tsx / Branding.tsx
│   └── Navbar.tsx                # marketing navbar (legacy)
├── lib/
│   ├── events.ts                 # subscribeDataChanged / emitDataChanged pub-sub
│   ├── commitments.ts            # types + constants (commitment types, weekdays)
│   ├── supabase/client.ts        # createBrowserClient factory
│   └── services/
│       ├── auth.ts               # getCurrentUser, signUp/signIn, Google OAuth, signOut
│       ├── profile.ts            # profiles CRUD + evaluation_time
│       ├── commitments.ts        # commitments CRUD + stats + weekly consistency
│       ├── groups.ts             # groups + membership + join by invite code
│       └── feed.ts               # feed_posts inserts/reads
└── docs/
    ├── MODAL.md                  # modal component reference
    └── SYSTEM.md                 # this document
```

---

## 5. Auth Flow

Service: `app/lib/services/auth.ts`. Supabase client: `app/lib/supabase/client.ts`.

### Email sign-up (`SignUp.tsx`)
1. `signUpWithEmail(email, password, fullName)` with `full_name` in `user_metadata`.
2. If `data.user` exists (email confirmation disabled), a `profiles` row is inserted
   (`createProfile`) with `id: crypto.randomUUID()`, `user_id: data.user.id`.
3. Redirects to `/auth/onboarding`.

> **Known caveat:** with email confirmation enabled, `data.user` is `null` after
> signup, so the profile insert is skipped — a DB trigger on `auth.users` is the more
> robust pattern (see §11).

### Email login (`Login.tsx`)
- `signInWithPassword`, then redirects to `/` if a user session exists, else onboarding.

### Google OAuth
- `signInWithGoogle()` redirects to
  `${origin}/auth/callback` — the OAuth code is exchanged there, which is why callback
  is a dedicated route (a straight redirect to `/` would drop the code).
- `/auth/callback` (`app/auth/callback/page.tsx`): loads the user, derives `full_name`
  from `user_metadata.full_name ?? name`, creates the profile if missing, then
  `router.push("/")`.

### Onboarding (`Onboarding.tsx`)
- "Hello {firstName}" + three choices: **Create Group**, **Join Group**, **Solo**.
- Username itself is set on the `/profile` page (not yet wired here).
- All three end up navigating to `/`.

### Protection
- Client-side only: `Home.tsx` calls `getCurrentUser()` and redirects to
  `/auth/login` if absent. No `middleware.ts` exists yet.

---

## 6. Data Model (Supabase)

> User is expected to have run RLS policies (profiles, groups, group_members,
> commitments, comments, reactions) in the Supabase SQL editor.

| Table | Key columns | Notes |
| --- | --- | --- |
| `profiles` | `id uuid` (PK), `user_id uuid` (→ `auth.users`), `full_name text`, `username text`, `evaluation_time time` | RLS: `auth.uid() = user_id`. `evaluation_time` is the daily deadline. |
| `groups` | `id uuid`, `owner_id` (→ profiles.id), `name`, `description`, `invite_code text` (8-char random), `max_members` (2–7), `evaluation_time` | |
| `group_members` | `group_id`, `profile_id`, `role` (owner/admin/member), `status` (pending/approved) | Pending = join request. |
| `commitments` | `id uuid`, `profile_id`, `title`, `description`, `commitment_type` (standard/routine/scheduled), `status` (pending/submitted/missed), `commitment_date date`, `schedule_days int[]`, `scheduled_for date`, `evaluation_time time`, `submitted_at timestamptz`, `created_at` | |
| `feed_posts` | `id`, `group_id`, `profile_id`, `commitment_id`, `type` (created/submitted), `content text`, `created_at` | Written on commitment create/complete for every group the user belongs to. |
| `comments` / `reactions` | (schema referenced by RLS docs) | Not yet wired — feed comments/reactions are currently **client-state mock**. |

### Key relationships
- `commitments.profile_id` → `profiles.id` (the actual user identity used by RLS checks,
  NOT `auth.users.id`).
- Commitments are shared to groups only indirectly via `feed_posts` (a post is written
  per group), not via a `commitments.group_id` column.

---

## 7. Services Layer (`app/lib/services/`)

| File | Responsibility |
| --- | --- |
| `auth.ts` | Session + auth actions (wraps the Supabase auth API). |
| `profile.ts` | `getProfileByUserId`, `createProfile`, `updateUsername`, `updateEvaluationTime`. |
| `commitments.ts` | CRUD, `nextEvaluationDate`, `isPastEvaluation`, `getSubmittedCommitmentsBetween`, `getWeeklyCommitmentBreakdown`, `getWeeklyConsistency`, `getYearlyConsistency`, `getProfileStats`, duplicate-title check. |
| `groups.ts` | `getMyGroups`, `createGroup`, `joinGroupByInviteCode`, `getPendingJoinRequests`, `getMyGroupOverview`. |
| `feed.ts` | `postCommitmentToFeed` (fan-out insert to all user's groups), `getGroupFeed` (joins group + profile names, relative time). |

### Commitment evaluation logic
- `nextEvaluationDate(baseDate, evaluationTime)` picks today if the deadline hasn't
  passed, otherwise tomorrow.
- `isPastEvaluation(commitmentDate, profileEvalTime)` compares now against
  `commitment_date` at the profile's `evaluation_time`.
- `getProfileStats` derives the effective status: a row still `pending` whose deadline
  has passed counts as **missed**. Completion rate = `submitted / (submitted + missed)`.
  Day streak walks back day-by-day; a day counts toward the streak only if every
  commitment that day is done.

---

## 8. Dashboard & Key Features (`Home.tsx` composition)

Layout (`max-w-7xl`, `m-auto` wrapper avoids scroll-clipping):

1. **StatCards** — Completion Rate %, Commitments Submitted, Day Streak
   (gradient values `from-purple to-secondary`).
2. **CommitmentCard** — "Commitments for today", per-item status pill
   (pending `purple`, submitted `teal`, missed `red`), per-profile `TimePicker`
   (evaluation deadline), Archive button, Create button.
3. **MonthlyAnalysisCard** (Daily Commitments) — stacked bar chart (teal =
   submitted, red = missed per day, Mon-Sun) + **WeeklyAnalysisCard**
   (Weekly Consistency) — hand-rolled SVG area charts with browser-generated
   week labels.
4. **YearlyHeatmapCard** (Yearly Contributions) — GitHub-style daily completion
   heatmap for the last year (weeks × Mon-Sun, shaded `--color-border` →
   `--color-purple`, hover tooltip with date + completion %).
5. **GroupFeedCard** — real-time feed of group posts with emoji reaction chips and an
   add-comment input (both currently mock/client-state).

### Commitment lifecycle UI
- **Create**: `CommitmentOptionsModal` → `CommitmentModal` (fields vary by type; routine
  requires ≥1 weekday, scheduled requires a date; duplicate titles rejected via
  `ErrorModal`). On success it posts a `created` feed post.
- **Status change**: clicking a pending commitment opens `StatusModalComponent` where the
  user edits fields, deletes, or **Commits** — a status dropdown selects
  Submitted/Missed and a confirmation modal (`CommitConfirmationModal` or
  `ConfirmationModalForMissed`) applies `submitCommitment(id, status)`. A "submitted"
  commit also posts to the feed.
- **Archive**: commitments past the evaluation deadline move to the Archive modal
  (`Completed` / `Missed`).

### Live refresh (fix in place)
`app/lib/events.ts` exposes `emitDataChanged()` / `subscribeDataChanged()`.
`CommitmentCard` emits after create/update/delete/status-submit/evaluation-time changes;
`StatCards`, `MonthlyAnalysisCard`, and `WeeklyAnalysisCard` subscribe and refetch —
no full page reload needed.

---

## 9. Groups

- **Groups page** (`/groups`): `GroupsOverviewCard` (owned group name, pending count,
  member count, roles, invite link), `JoinAccessCard` (pending requests, invite
  link/code copy), `MembersCard` (mock member list with Owner/Admin/Member roles).
- **Create**: `CreateGroupModal` (name, description, max members 2–7, evaluation
  deadline, confirm step). Generates an 8-char uppercase `invite_code`.
- **Join**: `JoinGroupModal` by invite code → inserts a `group_members` row with
  `status: "pending"`; the owner later approves (approval UI not yet built).
- **SideNav**: Create Group / Join Group buttons + "Management" nav; when on `/groups`
  it shows Overview / Join Access / Members scroll-spy sub-nav
  (`useSyncExternalStore` + rAF-driven scroll listener).

---

## 10. Styling & Design Tokens

Defined in `app/globals.css` via Tailwind v4 `@theme inline`:

| Token | Value |
| --- | --- |
| `--color-primary` | `#1f2a5a` |
| `--color-secondary` | `#4a90f5` |
| `--color-teal` | `#56d9c8` |
| `--color-purple` | `#a37af7` |
| `--color-muted` | `#5c6b8a` |
| `--color-border` | `#e4e7f5` |
| `--color-surface` | `#ffffff` |
| `--color-background` | `#f6f7fc` |

Conventions:
- Fonts: Poppins (headings/values), Nunito (body).
- Buttons: 8px (`rounded-lg`), white bg + `text-primary` for primary create/submit.
- Modals: 20px (`rounded-[20px]`), Escape/backdrop/X to close.
- Gradients: `from-sky-400 to-purple` for active nav / avatar / charts;
  stat values use `from-purple to-secondary`.
- Hardcoded chart hexes: `#38bdf8` (sky), `#a37af7` (purple), `#56d9c8` (teal),
  `#4a90f5` (blue).
- Dark mode is stubbed (commented-out block in `globals.css`); the SideNav Dark Mode
  button is UI-only.

---

## 11. Known Issues, Caveats & Next Steps

- **Email confirmation caveat**: if enabled, profile insert after signup is skipped
  (see §5). A DB trigger on `auth.users` is the robust fix.
- **Route protection is client-side** — optional `middleware.ts` +
  `createServerClient` is on the roadmap.
- **Feed reactions/comments are mock**: toggling an emoji or posting a comment updates
  client state only; `comments`/`reactions` tables exist in RLS docs but are unwired.
- **Mock data**: `MembersCard` and `GroupRankingCard` render hardcoded lists; stats and
  charts are real (from `commitments`).
- **Group approval flow**: pending join requests are shown but cannot be approved yet.
- **Sidebar dead buttons**: Notifications, Dark Mode, and the + Commitment button have
  no handlers.
- **Missing routes**: `/analysis`, `/profile`, `/groups/create`, `/groups/join` are
  referenced but not yet implemented (currently 404). `/groups/join?code=...` is what
  invite links point to.
- **Stale typecheck**: `npx tsc --noEmit` can report a stale
  `.next/types/validator.ts` error until `.next` types regenerate.
- **Home lint warnings**: unused `firstName`/`username` state in `Home.tsx` (welcome
  heading removed).

---

## 12. Useful Commands

```bash
npm run dev      # dev server (http://localhost:3000)
npm run build    # production build
npm start        # serve production build
npm run lint     # ESLint (gates: no FontAwesome, no unescaped apostrophes,
                 #   no synchronous setState in effects)
npx tsc --noEmit # type check
```

---

## 13. Gotchas for Future Work

- All mutating flows (`createCommitment`, `submitCommitment`, `updateCommitment`,
  `deleteCommitment`, `updateEvaluationTime`, create/join group) must call
  `emitDataChanged()` after success so every subscribed card refreshes.
- New icons must come from `lucide-react`; `UserGroup` does not exist (use
  `UserRoundPlus`).
- Profile identity for data ownership is `profiles.id`, not `auth.users.id`.
- Feed fan-out writes one `feed_posts` row **per group** the author belongs to.
