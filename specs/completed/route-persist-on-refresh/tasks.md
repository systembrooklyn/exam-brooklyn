# Implementation Tasks: Persist Current Page on Refresh

**Task ID:** route-persist-on-refresh  
**Created:** 2026-09-13  
**Status:** Completed (2026-09-13)

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 8 |
| Estimated Effort | ~18–22 hours (~3 days) |
| Phases | 4 |

## Phase 1: Diagnose & map redirects

**Goal:** Confirm why refresh lands on Systems/Dashboard and list every redirect call site.

### Task 1.1: Map all Systems/Dashboard redirect paths

**Description:** Inventory every navigation that sends users to `SystemsPage` / systems hub / dashboard home from router guards (`index.js`, `access-control.js`, `hr-dashboard.js`, other route modules). Note which run on refresh.

**Acceptance Criteria:**
- [ ] List of file + guard + condition that redirects to Systems (or equivalent)
- [ ] Short note on suspected false-deny path (permissions empty / auth not ready / race)

**Effort:** 2 hours  
**Priority:** High  
**Dependencies:** None

---

### Task 1.2: Reproduce refresh behavior on sample deep links

**Description:** Manually (or with brief console logging) reproduce refresh on at least one allowed HR route, one dashboard route, and one other module route. Record pre/post URL.

**Acceptance Criteria:**
- [ ] Reproduction notes attached (or checklist filled) for ≥3 modules
- [ ] Confirmed landing is Systems/Dashboard for the failing cases

**Effort:** 2 hours  
**Priority:** High  
**Dependencies:** None

---

## Phase 2: Auth readiness & bootstrap

**Goal:** Session is fully restored before permission-based redirects can fire.

### Task 2.1: Add auth bootstrap readiness on `authStore`

**Description:** Expose a clear ready signal (e.g. `authReady` ref + shared `initAuth` promise) so guards can await bootstrap. Ensure `initAuth` sets ready even when there is no token (anonymous/public). Avoid double `getUserByToken` on startup.

**Acceptance Criteria:**
- [ ] After `initAuth()` resolves, guards can detect bootstrap complete
- [ ] No token → still marked ready (so public routes work)
- [ ] Valid token → user/permissions loaded (or logout path) before ready

**Effort:** 3 hours  
**Priority:** High  
**Dependencies:** Task 1.1

---

### Task 2.2: Fix app bootstrap / router install order in `main.js`

**Description:** Ensure the first guarded navigation cannot run before `initAuth` completes. Adjust order (`initAuth` before `app.use(router)` and/or `await router.isReady()` after auth) as required by current Vue Router behavior.

**Acceptance Criteria:**
- [ ] On hard refresh of a deep link, first permission check sees loaded session when cookie is valid
- [ ] App still mounts successfully for login/public pages
- [ ] No regression: login flow and version watcher still start correctly

**Effort:** 3 hours  
**Priority:** High  
**Dependencies:** Task 2.1

---

### Task 2.3: Update global `beforeEach` deny policy

**Description:** In `src/router/index.js`, await auth readiness before `access-control` / `meta.requiresPermission` redirects to `SystemsPage`. Only deny when ready and permission check fails. Keep login redirect for unauthenticated protected routes after ready.

**Acceptance Criteria:**
- [ ] No Systems redirect solely because `permissions` were still empty mid-bootstrap
- [ ] Unauthenticated protected → login (unchanged intent)
- [ ] Authenticated without permission → Systems (or existing) after ready
- [ ] `/` + authenticated → SystemsPage still works

**Effort:** 3 hours  
**Priority:** High  
**Dependencies:** Task 2.1, Task 2.2

---

## Phase 3: Module guards integration

**Goal:** Local `beforeEnter` helpers cannot false-deny on refresh.

### Task 3.1: Align HR (and shared) `beforeEnter` helpers with auth readiness

**Description:** Update `nextIfCanAny` / similar helpers in `hr-dashboard.js` (and any other route files with the same Systems fallback pattern) to wait for auth ready before denying.

**Acceptance Criteria:**
- [ ] HR deep links allowed for the user survive refresh
- [ ] HR forbidden routes still deny to existing fallback
- [ ] Helper behavior is consistent with global guard policy

**Effort:** 3 hours  
**Priority:** High  
**Dependencies:** Task 2.3

---

### Task 3.2: Cross-module smoke verification

**Description:** Smoke-test refresh and new-tab open on allowed routes across HR, main dashboard, recruitment, and at least one more mounted module. Verify limited-permission user still denied.

**Acceptance Criteria:**
- [ ] Checklist: refresh ×3 on ≥1 allowed route per sampled module — stays put
- [ ] Forbidden route still redirects appropriately
- [ ] Expired/missing token → login

**Effort:** 3 hours  
**Priority:** High  
**Dependencies:** Task 3.1

---

## Phase 4: Polish

**Goal:** Clean delivery and documented behavior.

### Task 4.1: Remove debug instrumentation & finalize notes

**Description:** Remove temporary guard logging. Update open questions in spec if deny destinations differ. Mark todo-list complete items.

**Acceptance Criteria:**
- [ ] No leftover debug `console.log` in router/auth for this work
- [ ] Spec/plan open questions updated if anything changed during impl
- [ ] Ready for `/implement` verification / audit

**Effort:** 2 hours  
**Priority:** Medium  
**Dependencies:** Task 3.2

---

## Quick Reference Checklist

- [ ] Task 1.1: Map all Systems/Dashboard redirect paths
- [ ] Task 1.2: Reproduce refresh behavior on sample deep links
- [ ] Task 2.1: Add auth bootstrap readiness on `authStore`
- [ ] Task 2.2: Fix app bootstrap / router install order in `main.js`
- [ ] Task 2.3: Update global `beforeEach` deny policy
- [ ] Task 3.1: Align HR (and shared) `beforeEnter` helpers with auth readiness
- [ ] Task 3.2: Cross-module smoke verification
- [ ] Task 4.1: Remove debug instrumentation & finalize notes

## Next Steps

1. Review task breakdown
2. Run `/implement route-persist-on-refresh` to start execution

---

*Tasks created with SDD 6.0*
