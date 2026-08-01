<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Continuing Context

## Goal
Build out a Pact accountability Next.js app's auth flow (Supabase email + Google OAuth), username onboarding, protected dashboard with a sidebar, and a rich home page of dashboard cards with mock data.

## Constraints & Preferences
- App is Next.js 16, React 19, Tailwind v4, TypeScript strict; `@/*` path alias maps to repo root.
- Styling tokens: `--color-primary #1f2a5a`, `--color-secondary #4a90f5`, `--color-teal #56d9c8`, `--color-purple #a37af7`, `--color-muted #5c6b8a`, `--color-border #e4e7f5`, `--color-surface #ffffff`.
- Gradients preferred: `from-sky-400 to-purple`; stat values & full name use gradient text; white bg + `text-primary` for create/submit buttons; rounded corners 8px (`rounded-lg`) for buttons, 20px (`rounded-[20px]`) for the modal.
- All icons must be lucide-react (FontAwesome fully removed). `UserGroup` doesn't exist in lucide — use `UserRoundPlus`.
- `profiles` table schema: `id uuid`, `user_id uuid` (links to `auth.users`), `full_name text`, `username text`. RLS uses `auth.uid() = user_id`.
- Colors/hardcoded hex in charts use `#38bdf8` (sky), `#a37af7` (purple), `#56d9c8` (teal), `#4a90f5` (blue).
- ESLint gates: no FontAwesome, no unescaped apostrophes, no `setState` synchronously in effects (must use `useSyncExternalStore` with cached snapshot).

## Progress
### Done
- **Supabase client** `app/lib/supabase/client.ts` — `createBrowserClient` using `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_PUBLISHABLE_KEY` (old `utils/` folder deleted).
- **SignUp.tsx** — email/password signup + `profiles` insert (`crypto.randomUUID()` for id, `user_id: data.user.id`, `full_name`), Google OAuth, redirect to `/auth/onboarding`.
- **Login.tsx** — `signInWithPassword`, Google OAuth, post-auth redirect via `getPostAuthDestination`, fixed pre-existing `Don't` → `Don&apos;t` lint error.
- **Auth callback** `app/auth/callback/page.tsx` — creates profile from Google `user_metadata.full_name ?? name` if missing, redirects by username presence.
- **`app/lib/auth/redirect.ts`** — `getPostAuthDestination(userId)` returns `/` if username exists else `/auth/onboarding`.
- **Onboarding** `app/components/Onboarding.tsx` + `app/auth/onboarding/page.tsx` — "Hello {firstName}", username field saved to `profiles.username`, redirects `/`.
- **SideNav** `app/components/SideNav.tsx` — now collapsible (icon-only `w-20` when collapsed), sticky `h-screen` so it never exceeds viewport; top content (profile header, Notifications, Dark Mode, + Commitment) scrolls internally, Logout + Collapse pinned at bottom. Main nav: Dashboard `/home`, Analysis `/analysis`, Profile `/profile` — all with right-aligned `ChevronRight`. "Management" heading above Groups `/groups`. Dark Mode/Notifications/Commitment buttons are UI-only (no handlers yet).
- **Home** — `app/home/page.tsx` (SideNav + content), `app/page.tsx` redirects to `/home`; protected via `getUser()`; username-exists guard; `m-auto` wrapper fixed scroll clipping caused by `justify-center`.
- **StatCards.tsx** — mock Personal Stats (Completion Rate 86%, Commitments 12, Day Streak 7), gradient values purple→secondary.
- **CommitmentCard.tsx** — mock commitments with status badges (teal/blue/purple), Create button opens modal, subtitle "Be specific - your group will see this".
- **CommitmentModal.tsx** — 20px radius, Title + Description fields, Escape/backdrop/X close, white submit button.
- **Analysis cards** — MonthlyAnalysisCard = "Daily Commitments" area chart, WeeklyAnalysisCard = "Weekly Consistency" area chart with browser-generated week labels `[month 1, 8, 15, current]` (cached module-level snapshot for `useSyncExternalStore`).
- **AreaChart.tsx** — reusable SVG area chart with monotone cubic (d3 `curveMonotoneX` style) curve, gradient fill.
- **Group section** — Groups heading → **GroupRankingCard.tsx** (mock horizontal gradient bars with "ranking for this month" / "who has been the most consistent" muted text).
- **GroupFeedCard.tsx** — full-width, Discord-style emoji reactions (chips that toggle on click + "+" button that adds next emoji from `emojiPool`), working add-comment input (Enter/Send), posts have group leader crown. Feed list is a `h-96` scrollable container using `.feed-scroll` class (thin `--color-secondary` webkit scrollbar in globals.css). 4 mock posts (albert, sarah, mike, priya). Comment icon/count removed per request.
- **Lucide refactor** — removed all FontAwesome from SignUp, Login, Onboarding, SideNav.
- **globals.css** — added `.feed-scroll` custom webkit scrollbar (8px, `--color-secondary` thumb, `--color-purple` on hover; `scrollbar-width: thin` for Firefox).
- **Home.tsx currently has pre-existing eslint warnings**: unused `firstName`/`username` state (welcome heading was removed).

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- Profile insert uses `user_id: data.user.id` instead of `id: data.user.id` because RLS policy checks `auth.uid() = user_id`; id gets `crypto.randomUUID()`.
- OAuth redirects go through `/auth/callback` because redirecting straight to `/` lost the OAuth code in the URL (server redirect to `/auth/login`).
- Post-auth destination is driven by whether `profiles.username` exists rather than always onboarding.
- Charts are hand-rolled SVG (monotone curve) instead of a chart library — none installed.
- Scroll fix: `m-auto` wrapper instead of `justify-center` on flex column to avoid clipped unreachable overflow.
- Weekly labels read browser date via `useSyncExternalStore` + module-level `cachedLabels` to satisfy `react-hooks/set-state-in-effect` and cached-snapshot rules.
- Sidebar: `sticky top-0 h-screen` + internal `flex-1 overflow-y-auto` so Logout/Collapse stay visible without scrolling the page.

## Next Steps
- Build the pending routes referenced by SideNav: `/analysis`, `/groups/create`, `/groups/join`, `/groups` (currently 404).
- Wire up Dark Mode (globals.css has a commented-out dark mode block), Notifications, and + Commitment buttons in SideNav.
- Connect commitment modal and feed reactions/comments to Supabase (currently client-state mock).
- Decide whether the welcome heading + firstName/username should return to Home, or remove the unused state to clear lint warnings.
- Optionally add server-side route protection (`middleware.ts` + `createServerClient`) — current protection is client-side.
- Verify Google OAuth redirect URL `/auth/callback` is whitelisted in Supabase auth settings.

## Critical Context
- Email confirmation enabled means `data.user` is `null` after signup — profile insert is skipped; a DB trigger on `auth.users` is the more robust pattern.
- User must have run the RLS SQL (profiles, groups, group_members, commitments, comments, reactions policies) in Supabase.
- `getPostAuthDestination` failure mode: if the profiles query errors, it falls back to `/auth/onboarding`.
- Home page container: `m-auto flex w-full max-w-7xl flex-col items-center gap-2 mt-10` in `Home.tsx` — components are `w-full` and follow it.
- `npx tsc --noEmit` error `.next/types/validator.ts ... Cannot find module '../../app/home/page.js'` is stale and resolves once `/home` route build regenerates types (route now exists).

## Relevant Files
- `app/lib/supabase/client.ts`: browser Supabase client singleton factory.
- `app/lib/auth/redirect.ts`: `getPostAuthDestination` username-based redirect helper.
- `app/components/SignUp.tsx`, `app/components/Login.tsx`: email + Google auth flows.
- `app/auth/callback/page.tsx`: OAuth callback, profile creation fallback, destination redirect.
- `app/auth/onboarding/page.tsx`, `app/components/Onboarding.tsx`: username onboarding.
- `app/components/SideNav.tsx`: collapsible sticky sidebar, profile header, Notifications/Dark Mode/Commitment buttons, nav, logout, collapse toggle.
- `app/home/page.tsx`, `app/page.tsx`: protected dashboard layout; `/` redirects to `/home`.
- `app/components/Home.tsx`: dashboard composition (StatCards, CommitmentCard, analysis cards, Group section).
- `app/components/StatCards.tsx`, `CommitmentCard.tsx`, `CommitmentModal.tsx`, `MonthlyAnalysisCard.tsx` (Daily Commitments), `WeeklyAnalysisCard.tsx`, `AreaChart.tsx`, `GroupFeedCard.tsx`, `GroupRankingCard.tsx`: dashboard card components.
- `app/globals.css`: theme tokens incl. `--color-teal`/`--color-purple` + `.feed-scroll` webkit scrollbar.
- `app/components/Navbar.tsx`: marketing navbar (links to `/home`, `/about`, `/features`, `/auth/signup`), still references `/about`/`/features` routes that may not exist.
