# Specification: Employee Notice Period Flag

**Task ID:** employee-notice-period  
**Created:** 2026-09-12  
**Status:** Ready for Planning  
**Version:** 1.0

## 1. Problem Statement

- **The Problem:** When an employee enters their notice period, they still count toward manpower `current_count`. HR cannot open a job request for a replacement until headcount shows a vacancy.
- **Current Situation:** Backend supports `POST /api/manpower/employees/{id}/notice` (`is_on_notice`, optional `notice_period_ends_at`). The Employees Edit modal and HR employees store have no UI or client for this endpoint.
- **Desired Outcome:** HR can mark an employee on notice (with end date) from Edit Employee → Basic Info → Employment Details. On Save, the flag is persisted via the notice API, the employee is excluded from headcount, and HR can open a job request for a replacement.

## 2. User Personas

### Primary User: HR Administrator

- **Who:** HR staff who manage the Employees Directory and manpower staffing.
- **Goals:** Free a headcount slot while the leaving employee is still employed; hire a replacement before notice ends.
- **Pain points:** No way in the UI to mark notice; must wait until termination or use workarounds.

## 3. Functional Requirements

### FR-1: Notice checkbox in Edit Employee modal

**Description:** In Edit Employee → Basic Info → Employment Details, show a checkbox labeled to indicate the employee is in their notice period. Visible only when editing an existing employee (not on New Employee).

**User Story:**
> As an HR admin, I want to mark an employee as on notice in the Edit Employee form so that they stop counting toward manpower headcount.

**Acceptance Criteria:**
- [ ] Given an open Edit Employee modal on Basic Info, when I view Employment Details, then I see an "On notice period" (or equivalent) checkbox.
- [ ] Given New Employee modal, when I view Employment Details, then the notice controls are not shown.
- [ ] Given a terminated employee, when I open Edit Employee, then the checkbox is disabled or hidden and cannot set notice (API returns 422).

**Priority:** Must Have

### FR-2: Conditional notice end-date field

**Description:** When the checkbox is checked, show a date input for `notice_period_ends_at`. When unchecked, hide the date field and clear/ignore the date on submit.

**User Story:**
> As an HR admin, I want to set when notice ends so that we know how long the replacement window lasts.

**Acceptance Criteria:**
- [ ] Given checkbox is unchecked, when the form renders, then the end-date field is hidden.
- [ ] Given checkbox becomes checked, when UI updates, then the end-date field appears.
- [ ] Given checkbox is checked and Save is pressed without a valid end date after today (per API rules), then show the API validation error and keep the modal open.
- [ ] Date field is optional at UI level only if API allows; otherwise require a date when checked (align with backend: date after today when provided).

**Priority:** Must Have

### FR-3: Persist notice on Save (with other employee changes)

**Description:** On Save while editing, if notice fields changed vs original, call `POST /api/manpower/employees/{id}/notice` with `{ is_on_notice, notice_period_ends_at? }` in addition to existing `updateEmployee` / assignment flows. Do not fold notice into the payroll employee PUT payload.

**User Story:**
> As an HR admin, I want notice changes to save with the same Save button so that I do not manage a separate action.

**Acceptance Criteria:**
- [ ] Given notice toggled or end date changed, when I click Save, then the notice endpoint is called with the current checkbox/date values.
- [ ] Given only notice changed (no payroll field changes), when I click Save, then notice API still runs (no "No changes made" false negative that skips notice).
- [ ] Given notice API fails, when Save runs, then user sees error, modal stays open, and payroll update behavior follows existing error handling (prefer not committing a half-success without clear UX; document in plan).
- [ ] Given successful save, when modal closes, then employee list refresh reflects updated notice fields if returned by list API.

**Priority:** Must Have

### FR-4: Load existing notice state into the form

**Description:** When opening Edit Employee, populate checkbox and end date from employee payload fields (`is_on_notice`, `notice_period_ends_at`) if present on the list/detail object.

**User Story:**
> As an HR admin, I want to see the current notice status when editing so that I do not overwrite it blindly.

**Acceptance Criteria:**
- [ ] Given employee has `is_on_notice: true`, when Edit opens, then checkbox is checked and end date is shown if available.
- [ ] Given employee is not on notice, when Edit opens, then checkbox is unchecked and date field hidden.

**Priority:** Must Have

### FR-5: Directory badge / column (optional)

**Description:** Optional visual indicator in the Employees Directory table for on-notice employees.

**User Story:**
> As an HR admin, I want to spot who is on notice in the directory without opening each row.

**Acceptance Criteria:**
- [ ] TBD pending stakeholder decision (see Open Questions).

**Priority:** Nice to Have (deferred unless approved)

## 4. Non-Functional Requirements

- **Performance:** Notice call is one extra authenticated POST on Save when notice dirty; no polling.
- **Security:** Use existing Sanctum-authenticated `apiClient`; respect existing UPDATE_EMPLOYEE permission for edit modal.
- **Accessibility:** Checkbox and date have associated labels; date input is keyboard-usable.
- **Consistency:** Match existing Employees.vue form styling (indigo focus rings, gray-50 sections).
- **Scalability:** N/A beyond single-employee update.

## 5. Out of Scope

- ❌ Changing Manpower Overview UI layout — backend recalculates `current_count`; no overview redesign in this task.
- ❌ Auto-creating job requests when notice is set — HR still creates job requests manually.
- ❌ Candidate `notice_period` fields in recruitment — different concept (candidate availability).
- ❌ Backend changes — endpoint already exists.
- ❌ Immediate toggle without Save — explicitly rejected (save-with-form).
- ❌ Notice controls on New Employee — no employee id until create completes.

## 6. Edge Cases & Error Handling

| Scenario | Expected Behavior |
|----------|-------------------|
| Terminated employee marked on notice | API 422; show message (e.g. cannot mark terminated); modal stays open |
| `notice_period_ends_at` not after today | API 422; show validation message; modal stays open |
| Uncheck notice (was true) | POST with `is_on_notice: false`; flag removed; headcount recalculated |
| Uncheck while date still filled | Send `is_on_notice: false`; do not require date |
| Employee 404 | Show not-found error; modal stays open |
| Unauthenticated 401 | Existing auth/error handling |
| List payload missing notice fields | Default checkbox false; after first successful notice save, refresh list |

| Error | User Message | System Action |
|-------|--------------|---------------|
| 422 terminated | API message or "Cannot mark a terminated employee as on notice." | Keep modal open |
| 422 date | API validation message | Keep modal open |
| 404 | Employee not found | Keep modal open |
| Network/5xx | Existing `handleError` toast | Keep modal open |

## 7. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| HR can mark notice from Edit Employee | Works in staging | Manual QA checklist |
| On-notice employee excluded from manpower count | `current_count` decreases after save | Manpower Overview / position employees after notice |
| Replacement job request possible | Vacancy allows job req | Manual flow: notice → open job request |
| No regression on existing employee Save | Payroll + assignments still save | Regression on edit without touching notice |

## 8. Open Questions

- [ ] **Directory badge/column:** Include in this MVP or defer? (User left undecided.)
- [ ] Confirm whether employee list/GET already returns `is_on_notice` and `notice_period_ends_at` (if not, may need backend include or separate GET).
- [ ] Confirm whether `notice_period_ends_at` is required by backend when `is_on_notice` is true.

## 9. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-12 | Initial specification from stakeholder answers (checkbox+date, save-with-form, Edit modal only) |

## Next Steps

1. Resolve open questions (especially directory badge).
2. Run `/plan employee-notice-period` to create technical plan.
3. Then `/tasks` → `/implement`.

*Specification created with SDD 6.0*
