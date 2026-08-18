# HireDesk — Recruitment Management Platform (Frontend)

A multi-tenant B2B recruitment platform. Organizations register and wait for
admin approval before they can operate; once accepted, their HR and
Interviewer users manage jobs. Candidates never register or log in — they
browse a public job board and apply as a guest. This repo is the frontend
only — there is no backend yet, so all network calls are mocked behind an
`api/` seam per feature (see **Mock API pattern** below).

This is being built as a real production product, not a prototype or demo.
Hold every change to that bar: correctness, accessibility, and visual
craft — not just "it renders."

## Current Project Status

- **Landing page** — real, fully designed: custom cool-blue neutral ramp
  (not stock Tailwind slate), Archivo/Public Sans/JetBrains Mono type
  system, domain-grounded hero (an approval-status stepper, not a generic
  dashboard screenshot). See **Design system** below.
- **Auth** — real multi-organization accounts. Registration is a 2-step
  form (company details → tax verification) that persists a `PENDING`
  organization; sign-in authenticates against those stored accounts — and
  against the HR/Interviewer accounts orgs create for their teams — then
  opens a session. `/dashboard/*` is guarded, with orgs awaiting review held
  at `/pending-approval` and rejected ones at `/registration-rejected`. See
  **Auth: multi-org accounts** below.
- **Dashboard shell** — a floating macOS-style dock (proximity
  magnification, tooltips, no sidebar) navigates 5 sections under
  `/dashboard/*`. See **Dashboard navigation** below.
- **Dashboard overview** (`/dashboard`) — real: composes data from all four
  mock APIs (organization, jobs, candidates, users) into a welcome header
  with org approval-status pill, 4 stat cards (open jobs, active
  candidates, hires, team size), a candidate-pipeline bar breakdown, and
  "recent jobs" / "recent candidates" lists that deep-link into their full
  pages. No longer a `DashboardComingSoon` stub. See **Dashboard overview
  (composed summary pattern)** below.
- **Candidates** (`/dashboard/candidates`) — a 5-column Kanban pipeline
  board with full drag-and-drop (`@dnd-kit`), live search, and
  `localStorage` persistence so board state survives a refresh. Built to a
  reference design the user provided. See **Candidates board (Kanban
  pattern)** below for the full breakdown.
- **Organization** (`/dashboard/organization`) — real: the org's own
  profile (name, email, status, tax info, member-since date) plus a team
  members table. "Invite teammate" opens a real modal that creates an
  HR/Interviewer account the teammate can sign in with. The profile itself
  is still read-only (no edit flow). See **Team invites** below.
- **Jobs** (`/dashboard/jobs`) — real: a data table (not a Kanban board —
  jobs are a simple 3-state lifecycle, not a pipeline) with search, status
  filter tabs (All/Draft/Open/Closed), and per-row actions to Publish/
  Close/Reopen a job. Status changes persist to `localStorage`, same
  pattern as Candidates. "Create Job" opens a real modal with a validated
  form, address→lat/lng auto-geocoding, and an interactive map picker; new
  jobs persist to `localStorage` too. Each row's location is a real link
  that opens the job in Google Maps. See **Jobs list (data table pattern)**
  and **Create Job: geocoding + map picker** below.
- **Applications** (`/dashboard/applications`) — real: a data table of
  every candidate who applied via the public job board (i.e. has an
  `appliedJobId`), showing contact info, the job applied for, resume
  filename, current pipeline stage, and applied date — a submission-focused
  complement to the Candidates Kanban board's pipeline-focused view. Live-
  updates via the same `storage`-event pattern as Candidates. See
  **Applications (data table pattern)** below.
- **Admin console** (`/admin`) — real: a separate platform-administrator
  area (its own login, session, guard and layout) that lists every
  registered organization, approves/rejects/re-reviews them, and drills into
  one org to see its tax evidence plus all of its jobs and candidates. See
  **Admin console** below.
- **Interviews** (`/dashboard/interviews`) — real: every `INTERVIEW`-stage
  candidate with a three-round tracker (HR → Hiring Manager → Technical).
  Passing the final round moves them to `HIRED` automatically; failing any
  round moves them to `REJECTED`. See **Interviews (sequential process
  pattern)** below.
- **Public job board** (`/jobs`) — real: an unauthenticated, candidate-
  facing page (reuses the landing page's `Navbar`/`Footer`, not
  `DashboardLayout`) listing every OPEN job across every organization on
  the platform, with search and a real "Apply" flow that needs no account.
  Linked from the landing page `Navbar` ("Browse jobs", desktop + mobile).
  See **Public job board** below.
- **No real backend, and no seed data either** — every network call is
  mocked behind an `api/` function per feature (see **Mock API pattern**),
  and there is **no fabricated demo content anywhere**: no demo org, no
  sample jobs, no seeded candidates or team members. A fresh browser shows
  a genuinely empty app until an organization registers and starts creating
  things. Don't reintroduce seed fixtures to make a screen "look full."

## Current Task

None in progress — the most recent request built the **Interviews page**:
`INTERVIEW`-stage candidates run through three ordered rounds, and the
outcome moves them on the Candidates board automatically (final round passed
→ `HIRED`, any round failed → `REJECTED`). See **Interviews (sequential
process pattern)**. Pick up from **Next Steps**.

## Known Issues

- The dashboard dock has no home icon — `DOCK_ITEMS` in
  `DashboardDock.tsx` only lists the 5 section routes. Getting back to
  `/dashboard` is now done via the header's `BrandMark` link (see **Auth:
  multi-org accounts**), so this is a smaller gap than it was, but a 6th
  dock icon is still worth considering.
- **All accounts and data are per-browser.** Registered organizations,
  sessions, board state, jobs and applications live in `localStorage` (plus
  IndexedDB for resumes) — nothing syncs across devices or browsers, and
  clearing storage deletes every account. Expected with no backend, but
  don't reason about it as durable or shareable.
- **Passwords are stored in plaintext** in `localStorage` and compared
  directly — including the admin's, which is additionally hardcoded in
  `adminApi.ts` and printed on the admin login screen. Only tolerable
  because there's no server and no real user data; none of it must survive
  contact with a real backend.
- **Admin "auth" is a single localStorage flag** (`hiredesk:admin-session`).
  Anyone who sets it, or who reads the credentials off the login screen,
  is an admin. It gates the UI, not the data.
- **Teammate accounts have no role-based permissions.** An HR and an
  Interviewer account see exactly the same dashboard — `role` is stored and
  displayed, but nothing branches on it yet. The two roles describe intent,
  not enforced access.
- Candidates has no "Add Candidate" control at all (removed rather than left
  disabled — candidates arrive by applying on the public board). Every other
  primary action ("Create Job", "Invite teammate") is a real flow.
- Nominatim (free geocoding, see below) can fail to resolve a full real
  address that includes a postal code or an abbreviated street segment,
  even though a less-specific version of the same address resolves fine —
  this is a genuine limitation of free-text geocoding, not a bug. The UI
  has a fallback (progressively simplify the query) and always allows
  manual correction via the map or the raw lat/lng fields.
- The public `/jobs` board is empty until some registered organization
  publishes an `OPEN` job — there are no sample listings to browse on a
  fresh install. To exercise the apply flow end to end you have to register
  an org, approve it, create a job, and publish it first.

## Next Steps

Roughly in priority order:

1. Interview **scheduling** — dates, times, and which teammate runs each
   round. The Interviews page tracks outcomes only; nothing in the app
   represents *when* an interview happens or who conducts it, which is the
   obvious next layer now that rounds exist (and the natural first consumer
   of the `INTERVIEWER` role).
2. Enforce the `HR` / `INTERVIEWER` roles. Accounts carry a role but every
   signed-in user sees the same dashboard — an Interviewer arguably
   shouldn't reach Jobs or create postings. Needs the session to track
   *which user* signed in, not just which org (see **Team invites**).
3. Eventually, a real backend: every `api/*.ts` file is the seam to swap in
   actual HTTP calls; UI code shouldn't need to change when it happens. At
   that point, real geocoding (Nominatim or a paid provider) should
   probably move server-side too, both for rate-limit reasons and to hide
   the request from the browser.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`, CSS-first config via `@theme` — no `tailwind.config.js`)
- **shadcn/ui** — `radix-nova` preset, Radix UI base, components live in `src/components/ui`
- **react-router-dom** v7 (client-side `BrowserRouter`, no SSR)
- **react-hook-form** + **zod** (`@hookform/resolvers/zod`) for all forms
- **lucide-react** for icons
- **leaflet** + **react-leaflet** (v5, React 19-compatible) for the Create
  Job location map picker — no API key needed; see **Create Job:
  geocoding + map picker**

## Commands

```sh
npm run dev       # start Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # oxlint
npm run preview   # preview production build
```

Always run `npx tsc -b --noEmit` and `npm run lint` after non-trivial
changes — both must be clean before considering work done.

## Architecture: feature-based, not layer-based

```text
src/
  <feature>/            e.g. auth, admin, organizations, dashboard, landing
    api/                mock (eventually real) network calls
    components/         feature-specific components
    pages/               route-level components
    types/               domain types
    validation/          zod schemas
    utils/                feature-specific helpers
  shared/
    components/          cross-feature reusable components (FormField, HomeLink, ScrollToTop, ComingSoonPage)
    layouts/              cross-feature layouts (AuthLayout)
    config/                site-wide config (site.ts)
  components/ui/          shadcn primitives — treat as a library, restyle via className, don't fork
  lib/utils.ts             shadcn's `cn()` helper
  routes/AppRoutes.tsx     the single route table
```

Path alias: `@/*` → `src/*` (configured in both `vite.config.ts` and
`tsconfig.app.json`). Always import via `@/`, never relative `../../`.

**shadcn CLI gotcha**: `shadcn add <component>` has, more than once in this
repo, silently written files into a literal `./@/components/...` folder at
the repo root instead of resolving the `@/*` alias to `src/`. It happened
even with `baseUrl: "."` correctly set in `tsconfig.app.json` (which the
CLI otherwise needs to resolve the alias at all — kept for that reason,
alongside `ignoreDeprecations: "6.0"` to silence the modern-TS deprecation
warning on `baseUrl`), so treat it as a flaky CLI quirk rather than a
config bug to "fix" once and forget. After running `shadcn add`, always
check `git status` / `find` for a stray `@` folder at the repo root; if
present, `mv` its contents into the matching path under `src/` and `rm -rf`
the `@` folder.

`TooltipProvider` is mounted once at the app root (`App.tsx`) — any
`Tooltip` anywhere in the tree works without wrapping it locally. Don't add
a second nested `TooltipProvider` around individual features; it's
redundant (this was tried in `DashboardDock` and reverted once the root
provider was added).

**`CardHeader` is `display: grid`, not flex.** Passing `flex-row` alone does
nothing — the grid wins and children stack instead of sitting side by side.
Always write `className="flex flex-row …"` when you want a header row (this
silently mis-laid-out five cards before it was caught).

The `form` shadcn registry item is an empty stub in the `radix-nova`
preset — don't bother running `shadcn add form`. Forms are hand-built with
`react-hook-form` directly, using the shared `FormField` wrapper
(`src/shared/components/FormField.tsx`) around plain `Input`/`Label`
primitives, with `Controller` for anything that isn't a plain
register-able text input (file inputs, formatted-as-you-type inputs).

## Design system

### Brand tokens (mandated, do not change)

- Primary: `#2563EB`
- Background: `#F8FAFC`

### Everything else is deliberately custom — not stock Tailwind defaults

The neutral ramp (`--foreground: #0b1220`, `--muted-foreground: #56617a`,
`--border: #dfe4ec`, etc., in `src/index.css`) is a custom cool-blue-tinted
scale, not copy-pasted Tailwind slate hex values. Keep it that way — reaching
for `slate-500`/`gray-200`/etc. directly instead of the theme tokens is a
regression.

Semantic status colors (`--pending`, `--approved`) mirror the actual
`organizations.status` enum (`PENDING` / `ACCEPTED` / `REJECTED`) — they are
a real domain device, not decoration. Use them wherever organization/job
status is shown; don't invent new status colors ad hoc.

### Typography — three faces, each with a job

- **`font-heading`** (Archivo Variable) — all headings, wordmarks, large numerals
- **`font-sans`** (Public Sans Variable, the default body face) — body copy, labels, buttons
- **`font-mono`** (JetBrains Mono Variable) — eyebrows, status pills, metadata, counts, timestamps — anything "system-generated" rather than authored prose

Do not introduce Inter, Geist, or Space Grotesk — they were deliberately
replaced (see "Avoid AI-generic patterns" below).

### Avoid AI-generic patterns

This codebase had an earlier pass that looked like generic AI SaaS output;
it was deliberately redesigned away from that. Don't drift back:

- No gradient text, no blurred glow/blob background decorations
- No gradient-filled icon badges in rounded squares
- Ground new UI in what's actually true of the product (e.g. the approval
  workflow, the real org/job status states) rather than generic dashboard
  filler content
- Don't fabricate social proof — no fake customer logos, testimonials, or
  stats. If a number isn't real, don't show it.
- Numbered steps/markers are only justified when the content is a genuine
  sequence (e.g. the 4-step registration process) — don't reach for them as
  decoration
- Every internal link must go somewhere real. If a page doesn't exist yet,
  route it to `ComingSoonPage` rather than leaving a dead `#` link.

### The `HomeLink`, `ScrollToTop`, and `ScrollToHash` components

`src/shared/components/HomeLink.tsx` wraps the logo/wordmark link used in
Navbar, Footer, and AuthLayout: clicking it while already on `/` smooth-scrolls
to top and clears any `#hash` instead of doing nothing (React Router won't
remount on a same-path `Link` click). Reuse `HomeLink` for any future logo
instance rather than a bare `<Link to="/">`.

`ScrollToTop` and `ScrollToHash` (both mounted once in `App.tsx`, siblings
of `AppRoutes`) split scroll-restoration into two concerns: `ScrollToTop`
resets to `(0, 0)` on every route change *except* when a hash is present
(it defers to `ScrollToHash` instead, so the two don't fight); `ScrollToHash`
watches `location.hash` and smooth-scrolls to `document.getElementById(id)`
on any navigation that carries one. This exists because the landing page's
`Navbar`/`Footer` section links (`Features`/`How it works`/`FAQ`) must work
from *any* route, not just `/` — e.g. clicking "Features" while on `/jobs`
needs to route to `/` **and** land on the right section in one motion. A
plain `<a href="#features">` only scrolls within the current page, so those
links are router `Link`s to `/#features` etc. instead, with `ScrollToHash`
performing the actual scroll uniformly whether the navigation was cross-route
or same-route. If you add a new landing-page section that should be
deep-linkable, give it a real `id` (with `scroll-mt-16` to clear the sticky
header) and point a `Link to="/#that-id"` at it — don't reach for a plain
anchor tag if the link needs to work from outside `/`.

## Forms

Every form: zod schema in `validation/`, `react-hook-form` with
`zodResolver`, the shared `FormField` wrapper for label/error/hint, a
disabled+spinner submit button while `isSubmitting`, and a `role="alert"`
banner for submission-level errors. See
`src/organizations/components/RegisterOrganizationForm.tsx` for the fullest
example (multi-step, file upload via `Controller`, formatted-as-you-type
input via `Controller`).

Multi-step forms use one `useForm` instance for the whole schema and
`trigger(fieldNamesForCurrentStep)` to validate just the visible step before
advancing — don't split into multiple form instances per step.

## Mock API pattern

No backend exists yet. Each feature's `api/` folder holds an `async`
function shaped like the eventual real call (typed payload in, typed result
out, `await` a `setTimeout` in between) — e.g. `organizationsApi.ts`,
`authApi.ts`. When a real backend exists, only these functions change; UI
code should never need to know the call is mocked. Keep the payload type
separate from the form's `FormValues` type (e.g. don't send
`confirmPassword` to the API) — map explicitly at the call site.

**There is no seed data.** Every list starts empty and only fills up
through real user actions (registering, creating a job, applying). This
replaced an earlier build that shipped a hardcoded `Acme Recruiting Ltd.`
demo org with 19 sample jobs, 22 candidates and 6 team members — all of it
deleted on purpose. Don't add fixtures back to make a screen look
populated; build/verify the empty state instead.

Current mocked behavior, so it isn't mistaken for real auth/persistence:

- `registerOrganization()` writes a real `PENDING` organization (plus its
  plaintext password) into `localStorage` and rejects duplicate emails with
  `EmailAlreadyRegisteredError`.
- `login()` authenticates against those stored organizations and throws
  `InvalidCredentialsError` on an unknown email or wrong password. On
  success it records the org id as the session.
- `getCurrentOrganization()` resolves whoever is signed in, or `null` when
  there's no session. Everything under `/dashboard/*` may assume non-null —
  `RequireOrganization` redirects first.
- `adminLogin()` / `setOrganizationStatus()` / `getOrganizationDetail()`
  (`src/admin/api/adminApi.ts`) back the admin console — see **Admin
  console**. `setOrganizationStatus()` is the only writer of
  `organizations.status` after registration.
- `listJobs()` / `listCandidates()` / `listOrganizationUsers()` are all
  scoped to the session org, so each organization sees only its own data.
  They return `[]` when there's no session.
- `listPublicJobs()` is the candidate-facing counterpart to `listJobs()` —
  no org filtering, `status === 'OPEN'` only, across every organization.
- `updateJobStatus()` / `createJob()` persist to `localStorage`; created
  jobs are stamped with the session org's id and name.
- `applyToJob()` stamps the new candidate with the organization that owns
  the applied-for job, so it surfaces on that org's board once someone from
  that org signs in.
- `listOrganizationUsers()` / `inviteTeammate()` back the team-members table,
  scoped to the session org and persisted via `userStore.ts`. Invited
  accounts can sign in through the normal `/login` form — see **Team
  invites**.

## Database schema (reference — backend not yet built)

Frontend types should stay structurally aligned with this schema. Source of
truth until a backend repo exists.

```sql
CREATE TABLE organizations (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tax_registration_number VARCHAR(100) NOT NULL UNIQUE,
  tax_registration_document VARCHAR(500) NOT NULL
);

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations (id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('HR', 'INTERVIEWER')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
  id BIGSERIAL PRIMARY KEY,
  created_by BIGINT NOT NULL REFERENCES users (id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  address VARCHAR(255) NOT NULL,
  latitude DECIMAL(9,6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DECIMAL(9,6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Note: `organizations.tax_registration_number` is stored/validated on the
frontend in `XXX-XXX-XXX` format (9 digits, dash-separated) — see
`src/organizations/utils/formatTaxRegistrationNumber.ts` and the regex in
`registerOrganizationSchema.ts`.

## Auth: multi-org accounts

Multiple organizations can register and sign in, each seeing only its own
jobs, candidates and applications. All of it is browser-local; a real
backend replaces `organizationStore.ts` + the two `api/` files wholesale.

- `src/organizations/utils/organizationStore.ts` is the single source of
  truth: the registered-org list (`hiredesk:organizations`) and the current
  session (`hiredesk:session`, just an org id). Passwords are stored in
  **plaintext** — acceptable only because this is a browser-only mock with
  no server; the real schema hashes them (`organizations.password_hash`).
- **Scope data by session, never by a constant.** Every dashboard-facing
  API calls `getSessionOrganizationId()` and filters on it. An earlier
  build hardcoded a `CURRENT_ORGANIZATION_ID`; that constant is gone, and
  reintroducing one would silently break tenant isolation.
- `RequireOrganization` (`src/auth/components/`) wraps the whole
  `/dashboard` route as a layout route. No session → `/login`; status not
  `ACCEPTED` → `/pending-approval`. Because it renders an `<Outlet />`,
  everything below it can assume a signed-in, approved org.
- **Each non-approved status has its own screen**, not one screen with
  branches: `PendingApprovalPage` ("wait, we're reviewing") and
  `RegistrationRejectedPage` ("the answer was no"). They're different
  messages, and the rejected one deliberately shows **no**
  `ApprovalStatusStepper` — a progress tracker would imply the process is
  still moving. It uses the `--destructive` token, states when the decision
  was made, and offers a `mailto:` support link so it isn't a dead end.
  Neither screen can change status; only the admin console can.
- Sign-in routes on status via `STATUS_DESTINATION` in `LoginForm`, which
  mirrors the guard's branches — so a rejected org goes straight to its
  screen instead of hitting `/dashboard` and visibly bouncing. Keep the two
  in sync when adding a status.
- **The status screens redirect each other.** A rejected org sent to
  `/pending-approval` is forwarded on, an approved one lands on
  `/dashboard`, and so on. This matters because the admin can reverse a
  decision at any time — an org must never be stranded on a screen that no
  longer describes it.
- New organizations start **genuinely empty** (no jobs, candidates, or
  teammates). That's the intended experience, not a gap to paper over with
  fixtures — see **Mock API pattern**.
- `ApprovalStatusStepper` (`src/organizations/components/`) renders the
  Submitted → Reviewed → Approved progression from an `OrganizationStatus`.
  Shared by `RegistrationSuccess` and `PendingApprovalPage`; reuse it
  rather than re-inlining the step markup a third time.
- `DashboardLayout`'s header shows the signed-in org's name and a **Sign
  out** button, and its `BrandMark` links to `/dashboard` (not `/`) — this
  is how you get back to the overview, since the dock has no home icon.

## Admin console

`/admin` is the platform-administrator area: a separate account type with
its own login, session, guard and layout, living in its own `src/admin/`
feature folder. It's what makes the `PENDING → ACCEPTED/REJECTED` lifecycle
real rather than self-served.

- **One hardcoded admin.** `ADMIN_CREDENTIALS` in `src/admin/api/adminApi.ts`
  (`admin@hiredesk.app` / `admin1234`). Organizations register themselves,
  but nothing in a browser-only app can provision an administrator, so this
  account is a constant — and its credentials are printed on the admin login
  screen, because an unreachable console is a useless one. A real backend
  seeds this row and hashes the password.
- **Two mutually exclusive sessions.** `hiredesk:admin-session` (a boolean
  flag) is tracked separately from `hiredesk:session` (an org id), and
  signing in as either clears the other. Verified both ways: an org session
  hitting `/admin` bounces to `/admin/login`, an admin session hitting
  `/dashboard` bounces to `/login`. Don't collapse these into one key.
- `RequireAdmin` reads the flag synchronously, so unlike
  `RequireOrganization` (which awaits an org record) it needs no loading
  state.
- **Cross-tenant reads are opt-in and named as such.** `listAllJobs()` and
  `listAllCandidates()` exist purely for this console; every org-facing
  screen must keep using the session-scoped `listJobs()` / `listCandidates()`
  or tenant isolation breaks. `getOrganizationDetail()` is the only place
  that deliberately reads across orgs and then narrows to one.
- **Status actions are contextual** (`OrganizationStatusActions.tsx`): a
  `PENDING` org shows inline Approve / Reject buttons — that's the decision
  the admin opened the console to make — while an already-decided org gets a
  quieter overflow menu (revoke, approve instead, move back to review). The
  same component is reused in the list rows and on the detail header.
- `ORGANIZATION_STATUS_CONFIG` + `OrganizationStatusBadge`
  (`src/organizations/config/` and `components/`) were extracted while
  building this — the status pill markup had been copy-pasted into
  `OrganizationProfileCard` and `DashboardOverview`. Reuse the badge rather
  than re-inlining a fourth copy.
- The admin is deliberately **read-only over org data**: it can change an
  organization's status, but not edit its jobs or move its candidates. That
  belongs to the organization.

## Dashboard navigation: floating dock, not a sidebar

`/dashboard/*` has no sidebar — navigation is a macOS-style floating dock
(`src/dashboard/components/DashboardDock.tsx` + `DockIcon.tsx`), fixed to
the bottom of `DashboardLayout`. Real proximity-based magnification (icon
size grows as the cursor nears it, with falloff to neighbors — not just a
flat hover scale), a Radix `Tooltip` per icon showing its label, and an
active-route dot indicator via `NavLink`'s render-prop `isActive`. Adding a
new dashboard section = add it to `DOCK_ITEMS` in `DashboardDock.tsx` (label,
route, lucide icon) and add the matching nested `<Route>` in
`AppRoutes.tsx`. Keep this pattern — don't reintroduce a sidebar.

Dashboard section pages that have no real content yet use
`DashboardComingSoon` (`src/dashboard/components/DashboardComingSoon.tsx`),
**not** the top-level `ComingSoonPage` — the latter is `min-h-svh` and
built for standalone routes; nested inside `DashboardLayout` that would
double up on viewport height.

### Dashboard overview (composed summary pattern)

`/dashboard` (`DashboardPage.tsx` → `src/dashboard/components/
DashboardOverview.tsx`) doesn't own any data model of its own — it's a
read-only composition over the four existing mock APIs
(`getCurrentOrganization`, `listJobs`, `listCandidates`,
`listOrganizationUsers`), fetched in parallel via `Promise.all`, same
convention as `OrganizationPage`. This is the pattern to follow for any
future summary/overview screen: derive everything from existing feature
APIs rather than inventing new mock endpoints just for a dashboard view.

- `src/dashboard/components/StatCard.tsx` — small reusable stat tile
  (label/value/icon, optional hint + accent color) built from the shadcn
  `Card` primitive; used for Open Jobs, Active Candidates, Hires, Team
  Members. "Active candidates" and "Hires" are derived client-side from
  `Candidate.stage` (`stage !== 'HIRED' && stage !== 'REJECTED'` vs.
  `stage === 'HIRED'`) — there's no separate stats endpoint to keep in
  sync, so if the stage set ever changes, update this derivation too.
- `src/dashboard/components/PipelineSummary.tsx` — a horizontal bar per
  `CandidateStage` (in `CANDIDATE_STAGES` order) reusing `STAGE_CONFIG`
  from the Candidates feature for label/color, so the overview never
  drifts out of sync with the board's own color coding.
- `src/dashboard/components/RecentJobsCard.tsx` /
  `RecentCandidatesCard.tsx` — client-side sort of the full mock list by
  `createdAt`/`appliedAt` descending, sliced to the 5 most recent; reuse
  `JobStatusBadge`, `CandidateAvatar`, `STAGE_CONFIG`, and the shared
  `formatRelativeTime` util rather than re-deriving any of that
  presentation logic. Each card's header links out to the full
  `/dashboard/jobs` or `/dashboard/candidates` page.
- The org-status pill in the welcome header intentionally duplicates the
  small `STATUS_CONFIG` shape already local to
  `OrganizationProfileCard.tsx` (label/text/bg/dot per `OrganizationStatus`)
  rather than importing it — that config isn't exported, and the two usages
  are small enough that extracting a shared file isn't worth it yet. If a
  third consumer shows up, factor it into `src/organizations/config/`.
- `DashboardOverviewSkeleton.tsx` mirrors the real layout's grid shape
  (stat-card row + two-column row) rather than being a generic spinner —
  same convention as `CandidateBoardSkeleton`/`JobsTableSkeleton`.

### Candidates board (Kanban pattern)

`/dashboard/candidates` is the first dashboard section with real UI instead
of `DashboardComingSoon` — a 5-column pipeline board (Sourced → In Progress
→ Interview → Hired → Rejected), built to a reference design the user
provided. It's the template to follow if Applications/Interviews get
similar treatment:

- `src/candidates/types/candidate.ts` — `CandidateStage` union +
  `CANDIDATE_STAGES` ordered array (drives column order everywhere)
- `src/candidates/config/stageConfig.ts` — per-stage label + Tailwind
  color classes. Hired/Rejected reuse the existing `--approved`/
  `--destructive` tokens (semantic reuse, not new colors); Sourced/
  Interview use stock Tailwind amber/violet since they're one-off
  categorical tags, not brand-critical hues; In Progress uses `--primary`.
- `src/candidates/components/CandidateAvatar.tsx` — deterministic
  initials-avatar (name hash → color from a small palette). Deliberately
  **not** photographic (no stock/generated "person" images) — avoids
  implying real people behind fictional mock candidates.
- Card content (`CandidateCardContent.tsx`) shows name, current
  title/company, location, and relative applied date (`formatDaysAgo`) —
  no LinkedIn link or file/comment-count icons; those weren't useful for
  scanning a pipeline. `HIRED`-stage candidates additionally get a
  highlighted `--approved`-tinted strip showing the position/department
  they were actually hired into at this org plus a start date
  (`Candidate.hiredDetails`, required on every candidate but only
  *rendered* when `stage === 'HIRED'`) — distinct from `title`/`company`,
  which is their prior/outside employer background. Gate this on `stage`,
  never on whether the field is present — an earlier version gated on
  `hiredDetails` truthiness and the badge got stuck showing/hiding
  incorrectly after drag-and-drop moved a candidate in or out of `HIRED`.
- `src/candidates/api/candidatesApi.ts` — same mock-API convention as
  other features (`listCandidates()`, simulated latency); board shows a
  `Skeleton`-based loading state while it resolves. Board order/stage is
  persisted to `localStorage` (`saveCandidateBoard()`, called from
  `CandidatesBoard`'s `onDragEnd`) so drag-and-drop survives a refresh —
  this is the one feature page with any persistence at all; every other
  mock API is stateless per page load. If a real backend lands, this is
  the seam to replace with an actual PATCH call.
- `CandidatesBoard.tsx` also listens for the browser's `storage` event
  (`window.addEventListener('storage', ...)`) and silently refetches
  `listCandidates()` when either `CANDIDATES_BOARD_STORAGE_KEY` or
  `APPLIED_CANDIDATES_STORAGE_KEY` (both exported from `candidatesApi.ts`)
  changes — this is what makes a new application submitted on the public
  `/jobs` board (see below) show up on an already-open dashboard tab
  without a manual refresh. `storage` only fires in *other* tabs/windows of
  the same origin, never the tab that made the write, so this can't loop
  with the board's own `saveCandidateBoard()`/`applyToJob()` calls. The
  listener skips refetching while `activeCandidate` is set (a drag is in
  progress) so an incoming update can't yank a card out from under the
  user mid-drag. This is genuinely the only "live update" mechanism in the
  app — there's no polling and no backend to push events, so updates made
  in the *same* tab (e.g. drag-and-drop) still rely on normal React state,
  not this listener.
- Search box does real client-side filtering (name/email) that also
  recomputes the per-column counts — not decorative.
- Columns are a responsive CSS grid (`grid-cols-1` → `sm:2` → `lg:3` →
  `xl:5`), not `overflow-x-auto` — the board must always fit the viewport
  width, no horizontal scrollbar.
- Drag-and-drop uses `@dnd-kit` (core + sortable + utilities), not
  `react-beautiful-dnd` (unmaintained since 2022). Board state lives as
  `CandidateBoard = Record<CandidateStage, Candidate[]>`
  (`src/candidates/utils/board.ts`), not a flat array — `onDragOver` moves
  the card across columns live as you hover (Trello-style), `onDragEnd`
  finalizes in-column reordering via `arrayMove`. `CandidateCard` is split
  from `CandidateCardContent` so the same presentational markup can render
  both the sortable card and the non-interactive `DragOverlay` preview.
  Dragging is disabled (`disabled` passed down to `useSortable`/
  `useDroppable`) while a search query is active, since the board's real
  order and the filtered view diverge — don't try to make both work at
  once.

### Organization page

`/dashboard/organization` composes two independent features on one page:
`OrganizationProfileCard` (`src/organizations/components/`, reads
`getCurrentOrganization()`) and `TeamMembersList` (`src/users/components/`,
reads `listOrganizationUsers()`) — fetched in parallel via `Promise.all` in
`OrganizationPage.tsx`. `users` is its own feature folder (not nested under
`organizations/`) because it maps directly to the schema's own `users`
table. The profile card is read-only (no edit flow); the team list has a
real invite flow, below.

### Team invites

"Invite teammate" on the Organization page opens `InviteTeammateModal`
(`src/users/components/`) — a validated `react-hook-form` + `zod` form
(`inviteTeammateSchema.ts`) that creates an `HR` or `INTERVIEWER` account
under the signed-in organization.

- `src/users/utils/userStore.ts` mirrors `organizationStore.ts`: teammates
  live in `hiredesk:users`, each row stamped with `organizationId`, with the
  password in plaintext for the same reason (browser-only mock; the real
  schema hashes it).
- **Invited accounts really sign in.** `login()` checks organizations first,
  then teammates, and opens the *organization's* session either way — so a
  teammate lands in their org's dashboard. Without this the whole feature
  would be inert: you could create accounts nobody could use.
- Because both account types share one sign-in form, `inviteTeammate()`
  rejects an email already taken by a teammate **or** by an organization
  login. A collision would make one of the two accounts unreachable.
  (`users.email` is globally UNIQUE in the schema anyway.)
- The form asks for first/last name even though the request was
  email/password/role: `users.first_name`/`last_name` are NOT NULL in the
  schema, and the team table already has a Name column that would otherwise
  render blank.
- Role is a `Controller`-wrapped radio group (`role="radiogroup"` +
  `aria-checked`), not a `select` — with only two roles, each of which
  changes what the person can do, stating the consequence beats naming the
  option. Note the roles are **not enforced anywhere yet** (see Known
  Issues); the session tracks the org, not which user signed in.
- The new account is prepended to the list in-memory via an `onInvited`
  callback rather than refetching, same convention as `handleJobCreated` in
  `JobsList`.

### Jobs list (data table pattern)

`/dashboard/jobs` is deliberately **not** a Kanban board like Candidates —
`JobStatus` (`DRAFT` / `OPEN` / `CLOSED`) is a simple 3-state lifecycle, not
a multi-branch pipeline, and real ATS products (Greenhouse, Lever) list
jobs as a table, reserving Kanban for candidate pipelines specifically.
Don't reach for the Candidates pattern by default — match the structure to
what the data actually is.

- `src/jobs/types/job.ts` / `src/jobs/config/statusConfig.ts` — mirrors the
  Candidates `stageConfig.ts` shape, but only `OPEN` gets a color
  (`--approved` green, reused); `DRAFT`/`CLOSED` stay neutral since neither
  is the semantically "good" state — don't invent colors for the other two
  just for variety.
- `src/jobs/components/JobsTable.tsx` — a real `<table>`, not a div-grid
  (data tables get real table semantics; Kanban cards don't). Wrapped in
  `overflow-x-auto` on its own container for mobile — that's the correct,
  idiomatic use of horizontal scroll for a data table, unlike the Candidates
  board where `overflow-x-auto` was the bug being fixed.
- Row actions (`JobRowActions.tsx`) use shadcn `dropdown-menu` and are
  genuinely functional, not disabled placeholders: Draft → Publish → Open,
  Open → Close → Closed, Closed → Reopen → Open. These are real (locally
  mocked) status transitions, following the same "interactions should
  actually do something, even if mocked" bar as Candidates drag-and-drop.
- Status filter tabs (All/Draft/Open/Closed with live counts) are a
  hand-rolled segmented control, not shadcn `Tabs` — consistent with how
  `RegistrationProgress` and the dock were also hand-rolled rather than
  pulling in a primitive for something this simple.
- `src/jobs/api/jobsApi.ts` persists status changes to `localStorage`
  (`updateJobStatus()`), same convention as `saveCandidateBoard()`. User-
  created jobs (see below) persist separately via `createJob()`.
- "Create Job" opens a real modal — see **Create Job: geocoding + map
  picker** below.

### Create Job: geocoding + map picker

`CreateJobModal.tsx` (`src/jobs/components/`) is a validated
`react-hook-form` + `zod` form (`src/jobs/validation/createJobSchema.ts`)
for title/description/address/latitude/longitude. Latitude/longitude are
`.optional()` at the field level (so RHF defaults can be `undefined`
instead of a misleading `0`) with object-level `.refine()` checks giving
friendly "enter a latitude/longitude" messages — same pattern already used
for `taxRegistrationDocument` in `registerOrganizationSchema.ts`.

- `src/jobs/utils/geocode.ts` — `geocodeAddress()` calls OpenStreetMap's
  **Nominatim** service (free, no API key) to turn a free-text address into
  lat/lng, triggered on the address field's `onBlur`. Because Nominatim can
  fail on a fully-specific real address (postal code, abbreviated street)
  even though a less-specific version resolves fine, it progressively drops
  trailing comma-separated segments and retries until something matches —
  this is a genuine limitation of free-text geocoding being worked around,
  not a bug to "properly fix." Always allows manual correction via the map
  or the raw lat/lng fields; see **Known Issues**.
- `src/jobs/components/LocationPickerMap.tsx` — a **Leaflet** +
  **react-leaflet** map (chosen over Google Maps JS API specifically to
  avoid needing an API key/billing account), toggled via a `MapPin` icon
  button next to the address field (`aria-pressed` + a distinct
  `aria-label` so it doesn't collide with other `aria-pressed` controls on
  the page, e.g. the status filter tabs). Uses a custom brand-blue
  `L.divIcon` marker instead of Leaflet's default (sidesteps the
  well-known bundler asset-path bug for the default marker icon, and
  matches brand color). The marker is both draggable and click-to-place;
  `onChange` rounds coordinates to 6 decimal places before writing back to
  the form.
- `src/jobs/utils/googleMapsUrl.ts` — a plain
  `https://www.google.com/maps?q=lat,lng` link, used by `JobsTable.tsx`'s
  location cell to open a job's location in Google Maps in a new tab. This
  is just a hyperlink, **not** an embedded map, so it needs no API key —
  don't confuse this with the Leaflet picker above, which is a separate,
  unrelated integration.
- New jobs are created as `status: 'DRAFT'` and persisted via
  `createJob()` in `jobsApi.ts` (separate `localStorage` bucket from status
  overrides — see **Mock API pattern**), then prepended to the in-memory
  list and the status filter reset to "All" so the new job is immediately
  visible.

### Public job board

`/jobs` (`JobBoardPage.tsx` → `PublicJobBoard.tsx`, both in
`src/jobs/`) is the only candidate-facing surface in the app — candidates
never register or authenticate anywhere. It reuses the landing page's
`Navbar`/`Footer` directly (not `DashboardLayout`, which is dashboard-only
chrome behind the dock), and is linked from `Navbar.tsx`'s "Browse jobs"
link (desktop nav + mobile `Sheet`, alongside the existing `#anchor` nav
links — it's a real route, not a hash scroll, so it's a `Link`, not an
`<a href="#...">` like its siblings).

- `listPublicJobs()` (`src/jobs/api/jobsApi.ts`) returns every `OPEN` job
  across every organization, unfiltered by org — the dashboard-facing
  `listJobs()` filters to the session org so the two don't bleed into each
  other. The board is empty until some registered org publishes a job.
- `PublicJobBoard.tsx` is a search-only board (title/company/location) — no
  status filter tabs like the dashboard Jobs table, since every job here is
  already `OPEN` by definition. `PublicJobCard.tsx` shows title, org name,
  location, a truncated description, and an "Apply" button.
- `ApplyToJobModal.tsx` is a validated `react-hook-form` + `zod` form
  (`src/candidates/validation/applyToJobSchema.ts`) collecting name, email,
  phone, location, and a CV upload — **not** current title/company: the job
  itself already carries that context (`job.title`, `job.organizationName`),
  so the submitted `Candidate.title`/`.company` are set directly from the
  job at the call site in `ApplyToJobModal`, not asked of the applicant.
  `phone`, `resumeFileName`, `appliedJobId`, and `appliedJobTitle` are
  **optional** fields on `Candidate` — every candidate currently arrives by
  applying, so they're always populated in practice, but they stay optional
  so a future "add candidate manually" flow doesn't have to fake a job
  application. On success the modal swaps the
  form for an in-dialog confirmation state (not a toast) naming the job and
  organization, since this may be the only confirmation a guest applicant
  ever sees.
  - Phone uses the same format-as-you-type pattern as
    `taxRegistrationNumber` (`formatEgyptPhoneNumber.ts`, `Controller`-
    wrapped): groups as `010 1234 5678`, validated against
    `/^01[0125] \d{4} \d{4}$/` (Egyptian mobile prefixes `010`/`011`/
    `012`/`015`, 11 digits total). This app has no i18n/locale system, so
    "Egypt format" is hardcoded, not derived from anything — if
    international candidates need to apply, this validation will need
    loosening or a country picker.
  - CV upload's field-level validation reuses the exact
    `taxRegistrationDocument` pattern from `registerOrganizationSchema.ts`
    (`z.instanceof(File)` + size/type `.refine()`s, `.optional()` at the
    field level with an object-level `.refine()` for the friendly
    "required" message, a `Controller`-wrapped hidden `<input
    type="file">` behind a styled dashed-border label) — but unlike the tax
    document, the actual file content **is** persisted (not discarded), via
    `src/candidates/utils/resumeStore.ts` (see **Applications (data table
    pattern)** below for why IndexedDB rather than localStorage). The
    `File` object is passed straight through `ApplyToJobModal` →
    `applyToJob()` → `saveResumeBlob()` with no conversion in the modal
    itself.
- `applyToJob()` (`src/candidates/api/candidatesApi.ts`) creates a new
  `Candidate` with `stage: 'SOURCED'`, `appliedAt: now`, and the
  `organizationId` of the org that owns the applied-for job — that stamp is
  what makes the applicant show up on exactly one org's board. Applications
  to orgs nobody can sign in as are still stored; they're simply never
  displayed.

### Applications (data table pattern)

`/dashboard/applications` (`ApplicationsPage.tsx` → `src/applications/
components/ApplicationsList.tsx`) is a **submission-focused** view,
deliberately distinct from the Candidates Kanban board's **pipeline-focused**
view — same underlying `Candidate` data, different lens. It's list-shaped
(one row per application), so it follows the Jobs table pattern
(`ApplicationsTable.tsx` — a real `<table>`, `overflow-x-auto` wrapper), not
the Kanban pattern.

- No new API or data model — `ApplicationsList.tsx` calls the existing
  (session-scoped) `listCandidates()` and filters to
  `candidate.appliedJobId !== undefined`. Only candidates who came through
  the public job board have that field set, which keeps the page's meaning
  precise — "Applications" is "a specific submission for a specific job,"
  so any future manually-added candidate correctly won't appear here.
- Because that filter can legitimately be empty (a fresh install/browser
  profile has zero applications until someone actually applies), the empty
  state is a distinct, non-generic message linking to `/jobs` — don't
  conflate this with `ApplicationsTable`'s own empty state, which only
  fires when a *search* filters an otherwise non-empty list down to zero.
- Columns: candidate (avatar + name + location), contact (email + phone),
  applied for (`appliedJobTitle`), resume (clickable filename), current
  stage (reusing `STAGE_CONFIG`, so it never drifts from the board's own
  colors/labels), and applied date. A footer link ("View full pipeline in
  Candidates →") goes to `/dashboard/candidates` for the actual
  stage-management UI — this page is read-only, it doesn't duplicate
  drag-and-drop.
- Clicking a resume filename opens `ResumePreviewModal.tsx`, which fetches
  the actual file via `getResumeBlob()` and renders it inline in an
  `<iframe>` for PDFs (the overwhelming majority case — the modal checks
  `blob.type === 'application/pdf'`), or offers a download link for
  DOC/DOCX (Word documents can't render inline in a browser at all — that's
  a hard platform limitation, not something to work around). Object URLs
  (`URL.createObjectURL`) are created on open and revoked on close/unmount
  to avoid leaking memory.
- **Resumes are stored in IndexedDB, not localStorage** — the one
  deliberate exception to this app's "everything mock persists via
  localStorage" convention (see **Mock API pattern**). Real uploaded CVs
  can be several MB; base64-encoding a file for localStorage inflates it
  ~33% on top of that, and every localStorage key in this app shares one
  ~5-10MB origin quota — a single real-world CV (e.g. a certificate-heavy
  PDF) reliably blew past it, silently failing to save with no way to
  preview it later. `src/candidates/utils/resumeStore.ts` wraps a minimal
  IndexedDB object store (`saveResumeBlob(candidateId, fileName, blob)` /
  `getResumeBlob(candidateId)`) keyed by candidate id, storing the actual
  `Blob` — IndexedDB's quota is far larger and it's built for exactly this.
  If a save still fails (e.g. IndexedDB blocked in some private-browsing
  modes), it fails silently the same way every other persistence call in
  this app does: the application itself still succeeds, only the preview
  is unavailable (`ResumePreviewModal` shows a "not available to preview"
  fallback rather than erroring).
- Live-updates via the exact same `storage`-event pattern as
  `CandidatesBoard` (see **Candidates board (Kanban pattern)** above) —
  both watch `CANDIDATES_BOARD_STORAGE_KEY` and
  `APPLIED_CANDIDATES_STORAGE_KEY`, exported from `candidatesApi.ts`
  specifically so every listener stays in sync with the real key names
  instead of duplicating string literals.

### Interviews (sequential process pattern)

`/dashboard/interviews` (`InterviewsPage.tsx` → `src/interviews/components/
InterviewsList.tsx`) tracks candidates through three ordered rounds:
`HR` → `FIRST` (Hiring Manager) → `SECOND` (Technical). It's neither a table
nor a Kanban board — a per-candidate card with a vertical round tracker,
because the content is a **sequence with a gate at each step**, not a list of
peers or a set of columns. Match the structure to the process, same principle
as Jobs-as-a-table vs. Candidates-as-Kanban.

- **The board stays the source of truth for who is interviewing.**
  `listInterviewCandidates()` filters `listCandidates()` to
  `stage === 'INTERVIEW'` — drag someone into that column and they appear
  here; pass or fail them and they leave. There is no separate "is
  interviewing" flag that could disagree with the board.
- **Outcomes drive the stage, not the other way round.**
  `recordRoundOutcome()` writes the round result *and* applies the
  consequence: failing any round → `REJECTED`, passing the **final** round →
  `HIRED`. That auto-transition is the whole point of the screen — a
  recruiter shouldn't have to remember to also drag the card. Because a
  candidate then disappears from this page, the UI shows a banner naming
  where they went rather than letting the row silently vanish.
- `setCandidateStage()` (`candidatesApi.ts`) is the seam that makes this
  possible. Stage is stored as *which column's id list holds the candidate*
  (see `applyPersistedOrder`), so a programmatic move rewrites the persisted
  order rather than a field — and it folds in candidates the order doesn't
  know about yet, otherwise moving one would silently drop the others.
- Round progress lives in its own `localStorage` key
  (`hiredesk:interview-progress`), keyed by candidate id, separate from the
  board order. Keeping them apart means a candidate dragged out of Interview
  and back again still has their recorded rounds (verified).
- **Only the current round is actionable.** `getCurrentRound()` returns the
  first round not yet passed; later rounds render dimmed and buttonless, so
  nobody can pass a technical before HR has cleared them. Decided rounds get
  an Undo for mis-clicks — but only while the candidate is still on this
  page, since passing/failing moves them off it.
- `ROUND_CONFIG` / `OUTCOME_CONFIG` (`src/interviews/config/`) follow the
  same shape as `STAGE_CONFIG` and `JOB_STATUS_CONFIG`. Outcome colours
  deliberately reuse `--approved` / `--destructive` — the same tokens as the
  `HIRED` / `REJECTED` stages they lead to — so the two screens read as one
  system rather than two colour schemes.
- Live-updates via the same `storage`-event pattern as `CandidatesBoard` and
  `ApplicationsList`, since a drag in another tab changes who belongs here.

### `BrandMark` / `HomeLink`

The logo mark + wordmark is factored into `BrandMark`
(`src/shared/components/BrandMark.tsx`, with `markClassName`/
`wordmarkClassName` overrides for the couple of places sizing/color
differs) and always wrapped in `HomeLink` for the smart scroll-to-top
behavior. Every new place the logo appears should reuse both rather than
inlining the markup again.

## Current routes

| Path | Page | Status |
| --- | --- | --- |
| `/` | `LandingPage` | Real |
| `/jobs` | `JobBoardPage` | Real public job board + guest apply flow, mocked data |
| `/login` | `LoginPage` | Real form, authenticates against registered orgs |
| `/register` | `RegisterOrganizationPage` | Real 2-step form, persists a PENDING org |
| `/pending-approval` | `PendingApprovalPage` | Real gate for orgs awaiting review |
| `/registration-rejected` | `RegistrationRejectedPage` | Real screen for orgs an admin rejected |
| `/admin/login` | `AdminLoginPage` | Real form, hardcoded admin credentials |
| `/admin` | `AdminOrganizationsPage` | Real review list, inside `AdminLayout` |
| `/admin/organizations/:organizationId` | `AdminOrganizationDetailPage` | Real per-org detail |
| `/dashboard` | `DashboardPage` | Real composed overview, session-scoped, inside `DashboardLayout` |
| `/dashboard/candidates` | `CandidatesPage` | Real Kanban board, session-scoped |
| `/dashboard/organization` | `OrganizationPage` | Real profile + team list, session-scoped |
| `/dashboard/applications` | `ApplicationsPage` | Real data table, session-scoped |
| `/dashboard/interviews` | `InterviewsPage` | Real round tracker, session-scoped |
| `/dashboard/jobs` | `JobsPage` | Real data table, session-scoped |

Everything under `/dashboard` sits behind `RequireOrganization`, and
everything under `/admin` behind `RequireAdmin` — see **Auth: multi-org
accounts** and **Admin console**.

Every dashboard section now has real content. Not yet built: interview
**scheduling** (dates/times and who runs each round — the Interviews page
tracks outcomes only), and role-based permissions for the `HR` /
`INTERVIEWER` accounts.

## Verifying UI changes

There's no test suite yet. Before calling a UI change done:

1. `npx tsc -b --noEmit` and `npm run lint` — must be clean
2. Actually run the dev server and check it in a browser (headless
   Chromium via Playwright is available — see prior session transcripts for
   the working pattern: fonts/deps sometimes need `npx playwright install
   chromium`, and scripts must be run from a directory where the
   `playwright` package resolves, e.g. its npx cache dir, due to ESM
   resolution)
3. Check both desktop and mobile viewport widths
4. Check the browser console for errors — a page can render its shell while
   still failing silently underneath

## Conventions from prior sessions

- Don't add pages, features, or scaffolding beyond what's asked. Feature
  folders (`auth/`, `organizations/`, etc.) are created when their first
  real file is needed, not pre-scaffolded empty.
- Never leave a dead-end link — route to `ComingSoonPage` if the real page
  doesn't exist yet.
- No fabricated stats, testimonials, or customer logos anywhere in
  marketing copy.
