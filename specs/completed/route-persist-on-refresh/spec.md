# Specification: Persist Current Page on Refresh

**Task ID:** route-persist-on-refresh  
**Created:** 2026-09-13  
**Status:** Completed  
**Completed:** 2026-09-13  
**Version:** 1.0

## 1. Problem Statement

- **The Problem:** When a logged-in user refreshes the browser on any page in the system, they are sent to **Systems / Dashboard** instead of remaining on the same page.
- **Current Situation:** Auth restores the token (cookie) and loads the user, but navigation guards (global `beforeEach`, access-control, and route-level checks) often redirect denied/uncertain access to `SystemsPage`. On refresh this can fire incorrectly (timing, empty permissions, or overly aggressive fallback), so the user loses their place.
- **Desired Outcome:** Hard refresh (F5 / Ctrl+R / browser reload) on any allowed deep link keeps the user on that same route (path + query + params), with the same auth and permission rules applied only after session data is ready.

## 2. User Personas

### Primary User: Authenticated staff (all roles)

- **Who:** Any logged-in user (HR, dashboard, recruitment, finance, reservation, etc.).
- **Goals:** Continue work after accidental or intentional refresh without re-navigating from Systems.
- **Pain points:** Landing on Systems/Dashboard after every refresh; lost context (filters, open detail pages).

### Secondary User: Admin / power user

- **Who:** Users with broad permissions who jump between deep modules.
- **Goals:** Reliable deep links and refresh behavior for bookmarked URLs.
- **Pain points:** Same Systems fallback interrupts multi-step workflows.

## 3. Functional Requirements

### FR-1: Same route after refresh

**Description:** Refreshing while on an allowed authenticated route must reopen that same route (name/path, params, and query string).

**User Story:**
> As a logged-in user, I want refreshing the browser to keep me on the same page so that I do not have to navigate again from Systems.

**Acceptance Criteria:**
- [ ] Given I am on a protected page I am allowed to open (e.g. HR Employees, a detail route with `:id`, or a list with query params), when I refresh, then the URL and rendered view match the pre-refresh route.
- [ ] Given I refresh on a public page (`login`, `reset-password`, public careers, etc.), when the app loads, then I remain on that public page (or login rules as today if already authenticated—see FR-3).
- [ ] Behavior applies to **all authenticated users**, not a single role.

**Priority:** Must Have

### FR-2: Auth + permissions ready before access redirects

**Description:** Navigation must not treat “permissions not loaded yet” as “no permission.” Redirects to Systems/Dashboard (or other fallbacks) may only happen after the session bootstrap has finished and permissions are known.

**User Story:**
> As a logged-in user, I want the app to finish restoring my session before deciding I lack access so that refresh does not falsely send me to Systems.

**Acceptance Criteria:**
- [ ] Given a valid token cookie exists, when the app starts, then token restore + user/permissions load complete before any guard redirects to `SystemsPage` / dashboard for missing permission.
- [ ] Given permissions are still loading, when a guarded navigation runs, then the guard waits (or defers) instead of redirecting to Systems.
- [ ] Given permissions are loaded and the user truly lacks access, when they open a forbidden route, then redirect/deny behavior remains (Systems or existing module fallback)—this is intentional, not a refresh bug.

**Priority:** Must Have

### FR-3: Preserve intentional security redirects

**Description:** Expired/invalid session still goes to login. Truly unauthorized routes still deny access. Refresh must not weaken access control.

**User Story:**
> As the product owner, I want refresh persistence without bypassing auth or permissions so that security stays intact.

**Acceptance Criteria:**
- [ ] Given no valid token (or token rejected by `getUserByToken`), when I refresh a protected URL, then I am sent to `login` (current secure behavior).
- [ ] Given a valid session but missing required permission, when I open/refresh that URL, then I am denied (existing fallback such as Systems or module-specific page)—not silently granted access.
- [ ] Query params and route params are preserved on successful refresh restore; they are not required to be preserved on deny → Systems redirects.

**Priority:** Must Have

### FR-4: Consistent fallback policy (document + keep)

**Description:** Document where “no access” should go (Systems vs module home). Prefer one consistent pattern; do not invent a new home page in this feature unless needed to fix false redirects.

**User Story:**
> As a developer, I want a clear deny destination so that legitimate denials stay predictable while false denials on refresh are fixed.

**Acceptance Criteria:**
- [ ] Legitimate permission failures continue to a documented fallback (default: `SystemsPage`, unless a route already defines a better local fallback e.g. `hr-my-payroll`).
- [ ] No new “last visited page” storage is required for the happy path if the URL itself is the source of truth (History mode + correct guards).

**Priority:** Should Have

## 4. Non-Functional Requirements

- **Performance:** Auth bootstrap before first meaningful guarded navigation should not add more than ~1–2s beyond the existing `getUserByToken` call on typical networks.
- **Security:** No granting of routes before permissions are verified; no persisting tokens outside the existing cookie approach.
- **Reliability:** Hard refresh and open-in-new-tab of a deep link behave the same for allowed users.
- **Compatibility:** Works with current Vue Router `createWebHistory`, Pinia `authStore`, and existing `access-control` / `meta.requiresPermission` / HR `beforeEnter` checks.
- **UX:** Avoid flash of wrong page (Systems) then correcting to the deep link; prefer wait/spinner or stay on target URL until ready.

## 5. Out of Scope

- ❌ Restoring unsaved form draft data after refresh — separate feature.
- ❌ Restoring scroll position or open modals — nice-to-have later.
- ❌ Changing login success landing (`/systems`) — unrelated unless it interferes.
- ❌ Backend permission model changes — client bootstrap/guards only.
- ❌ Exam/student flows that intentionally clear session or force home — leave as-is unless they share the same false Systems redirect bug.

## 6. Edge Cases & Error Handling

| Scenario | Expected Behavior |
|----------|-------------------|
| Refresh on allowed deep link with valid session | Stay on same route (path + params + query) |
| Refresh on forbidden deep link with valid session | Deny → existing fallback (e.g. Systems) |
| Refresh on protected link with expired/invalid token | Login |
| Refresh on `/` while authenticated | Existing rule: SystemsPage (OK) |
| Slow `getUserByToken` | Wait; do not redirect to Systems for empty permissions |
| `getUserByToken` network error | Existing forceLogout / login behavior |
| Public careers refresh | Stay public |
| Open bookmarked HR URL in new tab | Same as refresh: stay if allowed |

| Error | User Message | System Action |
|-------|--------------|---------------|
| Session expired on refresh | Existing logout messaging (if any) | Clear session → login |
| No permission (confirmed) | None required beyond navigation | Redirect to documented fallback |
| Bootstrap still loading | Optional loading state on shell | Block permission-based redirects until ready |

## 7. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Refresh stay-rate on allowed pages | ≥ 95% of manual spot-checks across modules | QA checklist: HR, dashboard, recruitment, finance |
| False Systems redirects on refresh | 0 on allowed routes | Repeat refresh 3× per sample route |
| Auth bypass regressions | 0 | Attempt forbidden routes with limited user |
| Deep link new-tab parity | Same as refresh | Open URL in new tab |

## 8. Open Questions

- [x] Where do users land today on refresh? → **Systems / Dashboard**
- [x] Who is affected? → **All users**
- [x] Must-haves if only three? → Same route; auth ready before deny; keep real security denials
- [x] Confirm: Is “Dashboard” the SRM/dashboard home or only `SystemsPage`? → Primary false landing is `SystemsPage` (guards); dashboard home only via `access.blockedIfHas`
- [x] Any module that should use a non-Systems deny target exclusively? → Keep existing local fallbacks (e.g. `hr-my-payroll`, `hr-home`)

## 9. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-13 | Initial specification from user answers + defaults |

## Next Steps

1. Review spec with stakeholders
2. Resolve remaining open questions if needed
3. Run `/plan route-persist-on-refresh` (plan included in this folder for task breakdown)

*Specification created with SDD 6.0*
