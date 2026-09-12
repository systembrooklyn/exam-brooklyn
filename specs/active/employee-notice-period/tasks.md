# Implementation Tasks: Employee Notice Period Flag

**Task ID:** employee-notice-period  
**Created:** 2026-09-12  
**Status:** Ready for Implementation  
**Based on:** plan.md, spec.md

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 6 |
| Estimated Effort | ~10–14 hours |
| Phases | 4 |

## Phase 1: API + Store Wiring

**Goal:** Frontend can call the notice endpoint through the existing Pinia/API patterns.

### Task 1.1: Add manpower notice API constant

**Description:** In `src/api/Api.js`, add `MANPOWER_EMPLOYEE_NOTICE = (id) => \`manpower/employees/${id}/notice\`` next to existing `MANPOWER_*` constants.

**Acceptance Criteria:**
- [ ] Constant exported and follows existing naming style
- [ ] Path matches backend: `manpower/employees/{id}/notice`

**Effort:** 1 hour  
**Priority:** High  
**Dependencies:** None

---

### Task 1.2: Add `setEmployeeNotice` store action

**Description:** In `src/stores/hr/employees.js`, add `setEmployeeNotice(id, payload)` that POSTs via `apiClient`, shows success toast, uses `handleError` on failure, and rethrows. Export from store return object. Mirror `terminateEmployee` / `assignManager` style. Do **not** auto-refresh list inside the action if the caller (`handleSubmit`) already refreshes—or document one clear refresh ownership (prefer: action does not refresh; caller refreshes once at end).

**Acceptance Criteria:**
- [ ] POST body supports `{ is_on_notice, notice_period_ends_at? }`
- [ ] Success toast uses API message when present
- [ ] Errors go through `handleError` and propagate
- [ ] Action exported for use in `Employees.vue`

**Effort:** 2 hours  
**Priority:** High  
**Dependencies:** Task 1.1

---

## Phase 2: Edit Modal UI

**Goal:** HR can see and edit notice fields in Employment Details when editing.

### Task 2.1: Add notice checkbox + conditional end-date fields

**Description:** In `src/views/hr/Employees.vue` Employment Details section (after Hiring Date / Fingerprint), add:
- Checkbox “On notice period” (or equivalent label)
- Date input `notice_period_ends_at` visible only when checkbox is checked
- Controls wrapped in `v-if="isEditing"`
- Disabled (or hidden) when editing a terminated employee
- Extend `form` / `openAddModal` / `openEditModal` / `originalForm` with `is_on_notice: false` and `notice_period_ends_at: null`

**Acceptance Criteria:**
- [ ] Checkbox visible only in Edit Employee, not New Employee
- [ ] Date field appears only when checkbox is true
- [ ] Unchecking hides date field
- [ ] Terminated employees cannot enable notice from UI
- [ ] Styling matches existing Employment Details inputs

**Effort:** 3 hours  
**Priority:** High  
**Dependencies:** None (can parallel with Phase 1)

---

## Phase 3: Load + Save Integration

**Goal:** Notice state loads on edit and persists on Save with dirty detection.

### Task 3.1: Seed notice fields when opening Edit modal

**Description:** In `openEditModal`, map `is_on_notice` and `notice_period_ends_at` from the employee row (with safe defaults). Ensure `originalForm` snapshots these for dirty checks.

**Acceptance Criteria:**
- [ ] On-notice employees open with checkbox checked and date shown when available
- [ ] Off-notice employees open unchecked with date hidden
- [ ] Missing API fields default to false/null without crashing

**Effort:** 2 hours  
**Priority:** High  
**Dependencies:** Task 2.1

---

### Task 3.2: Call notice API from `handleSubmit` on dirty notice

**Description:** In edit branch of `handleSubmit`:
1. Detect dirty notice vs `originalForm`
2. After existing payroll/assignment updates (or when those have no changes), if notice dirty call `store.setEmployeeNotice`
3. Fix the “No changes made.” path so notice-only edits still save
4. On notice failure: keep modal open (existing catch); do not treat as full success
5. Ensure list refresh so UI stays consistent after success

**Acceptance Criteria:**
- [ ] Notice-only change triggers POST and succeeds without false “No changes made”
- [ ] Combined payroll + notice save works
- [ ] Clearing notice sends `is_on_notice: false`
- [ ] When checked, payload includes end date when set
- [ ] API 422/404 surfaces via existing error handling; modal stays open

**Effort:** 3–4 hours  
**Priority:** High  
**Dependencies:** Task 1.2, Task 3.1

---

## Phase 4: Verification

**Goal:** Confirm acceptance criteria and manpower effect.

### Task 4.1: Manual QA checklist

**Description:** Verify against spec FR-1–FR-4 and edge cases. Confirm Manpower Overview / position count drops after notice (backend recalc). Confirm job request can be opened for the freed slot. Regression: normal employee edit without touching notice still works.

**Acceptance Criteria:**
- [ ] Checkbox + date UX matches spec
- [ ] Save persists and headcount reflects exclusion
- [ ] Terminated / invalid date errors handled
- [ ] No regression on create/edit without notice
- [ ] Document any missing list fields (open question) if discovered

**Effort:** 2 hours  
**Priority:** High  
**Dependencies:** Task 3.2

---

## Deferred (Not in this breakdown)

| Item | Reason |
|------|--------|
| Directory badge/column (FR-5) | Nice to Have; stakeholder undecided |
| Manpower Overview UI changes | Out of scope |
| Auto job-request creation | Out of scope |

## Quick Reference Checklist

- [x] Task 1.1: Add manpower notice API constant
- [x] Task 1.2: Add `setEmployeeNotice` store action
- [x] Task 2.1: Add notice checkbox + conditional end-date fields
- [x] Task 3.1: Seed notice fields when opening Edit modal
- [x] Task 3.2: Call notice API from `handleSubmit` on dirty notice
- [x] Task 4.1: Manual QA checklist (static verification done; live API QA for user)

## Suggested Execution Order

```
1.1 → 1.2 ─┐
2.1 → 3.1 ─┴→ 3.2 → 4.1
```

Tasks 1.x and 2.1 can run in parallel.

## Next Steps

1. Review task breakdown
2. Run `/implement employee-notice-period` to start execution

---

*Tasks created with SDD 6.0*
