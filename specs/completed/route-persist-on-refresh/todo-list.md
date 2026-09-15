# Todo List: route-persist-on-refresh

**Status:** Completed  
**Created:** 2026-09-13  
**Updated:** 2026-09-13  
**Completed:** 2026-09-13 (user confirmed)

## Execution Order

- [x] 1.1 Map all Systems/Dashboard redirect paths
- [x] 1.2 Reproduce refresh on sample deep links (HR + dashboard + one other) — root cause confirmed via code path (guard race); browser QA remaining for user
- [x] 2.1 Add `authReady` / init promise on `authStore`
- [x] 2.2 Fix `main.js` bootstrap vs router first navigation
- [x] 2.3 Update global `beforeEach` to wait then deny
- [x] 3.1 Align HR/`beforeEnter` helpers with auth readiness
- [x] 3.2 Cross-module smoke + security checks — static/path review done; please hard-refresh allowed deep links in browser
- [x] 4.1 Remove debug logs; close open questions

## Progress Log

| Time | Item | Status | Notes |
|------|------|--------|-------|
| 2026-09-13 | 1.1 | Done | Systems redirects: `router/index.js` (access + meta), `hr-dashboard.js` beforeEnter helpers |
| 2026-09-13 | 1.2 | Done | Race: first navigation vs `initAuth`; empty permissions → false deny → SystemsPage |
| 2026-09-13 | 2.1 | Done | `authReady`, shared `initAuthPromise`, `ensureAuthReady()` |
| 2026-09-13 | 2.2 | Done | `initAuth` + `router.isReady()` before mount; guards await same promise |
| 2026-09-13 | 2.3 | Done | Async `beforeEach` awaits `ensureAuthReady` then applies denies |
| 2026-09-13 | 3.1 | Done | HR helpers + beforeEnter await `ensureAuthReady` |
| 2026-09-13 | 3.2 | Done | No other router modules redirect to SystemsPage |
| 2026-09-13 | 4.1 | Done | No debug logs added |

## Blockers

_None._

## Notes

- User-confirmed complete: refresh stays on the same page for all users.
- Fix: auth readiness gate (`ensureAuthReady`) — not `sessionStorage` last-route.
- Specs archived under `specs/completed/route-persist-on-refresh/`.

---

*Todo list for SDD implement*
