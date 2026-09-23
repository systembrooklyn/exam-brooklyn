# Research: Freelancer Management & Payroll

**Task ID:** freelancer-payroll  
**Date:** 2026-09-23  
**Status:** Completed  
**Research mode:** Standard  
**API source:** User-provided freelancers-payroll contract (DigitalOcean base `https://shark-app-s8ndy.ondigitalocean.app/api`)

---

## Executive Summary

The HR dashboard already has a **working scaffold** for Freelancer Management and Freelancer Payroll: API path constants, a Pinia store with most CRUD methods, a dual-tab page (`Freelancers` | `Payroll Records`), route `/hr/freelancers-payroll`, and a sidebar item under **Payroll**. The frontend talks to the same path family the API doc describes (`freelancers-payroll/freelancers`, `.../payrolls`, `.../total-by-month`).

Gaps vs the **full API + permission contract** you provided:

1. **Permissions incomplete** — only `view-freelancers` exists in `HR_PERMISSION` and gates the route/sidebar. Create/update/delete freelancers, all freelancer-payrolls slugs, and `view-freelancer-payroll-total` are missing; UI action buttons are always visible.
2. **Filters not fully used** — backend supports `first_name` / `last_name` / `email` on freelancers and `from` / `to` on payrolls; the UI uses client-side search and only passes `freelancer_id` + `payroll_month`.
3. **Two endpoints unused** — `GET freelancers/{id}/payrolls` (constant exists, store unused) and `GET payrolls/{id}` (not implemented).
4. **UI pattern drift** — page uses custom cards/Teleport modals/`alert`/`confirm` instead of `HrDataTable` + `HrModal` + `SweetAlert2Modal` + `authStore.can`, which peer payroll pages (e.g. Employee Deductions) follow.

**Primary recommendation:** Treat the existing scaffold as the baseline. Complete permission constants and UI gating from your permission list, wire remaining filters/endpoints where UX needs them, and align the page with established HR CRUD patterns. No new third-party library is required.

---

## Codebase Analysis

### Existing Patterns

#### Pattern: Freelancer Payroll scaffold (already present)

**Location:** `src/views/hr/FreelancersPayroll.vue`, `src/stores/hr/freelancersStore.js`, `src/api/Api.js`

**How it works:**  
Dual-tab page loads freelancers + payrolls on mount. Freelancer tab: card grid, client-side search, create/edit/delete via Teleport modal. Payroll tab: filters + HTML table + modal. Header shows month net total via `total-by-month` with a local sum fallback.

**Code example (API constants):**

```210:216:src/api/Api.js
// ── Freelancer Payroll APIs ────────────────────────────────────────────────
export const FREELANCERS_BASE                  = 'freelancers-payroll/freelancers';
export const FREELANCER_BY_ID                  = (id) => `freelancers-payroll/freelancers/${id}`;
export const FREELANCER_PAYROLLS               = 'freelancers-payroll/payrolls';
export const FREELANCER_PAYROLLS_FOR_MEMBER    = (id) => `freelancers-payroll/freelancers/${id}/payrolls`;
export const FREELANCER_PAYROLL_BY_ID          = (id) => `freelancers-payroll/payrolls/${id}`;
export const FREELANCER_TOTAL_BY_MONTH          = 'freelancers-payroll/total-by-month';
```

**Reusability:** Keep paths and store shape; extend store for missing GET-by-id payroll and member payrolls; harden the view.

#### Pattern: Permission-gated HR CRUD (reference)

**Location:** `src/views/hr/EmployeeDeductions.vue`, `src/constants/hrPermissions.js`

**How it works:**  
`authStore.can(HR_PERMISSION.*)` drives create button, edit/delete actions, and `HrDataTable` `:has-actions`. Forms use `HrModal`; deletes use `SweetAlert2Modal`. Filters map to API query params.

**Code example:**

```182:187:src/views/hr/EmployeeDeductions.vue
const canCreate = computed(() => authStore.can(HR_PERMISSION.CREATE_EMPLOYEE_DEDUCTION));
const canEdit = computed(() => authStore.can(HR_PERMISSION.UPDATE_EMPLOYEE_DEDUCTION));
const canDelete = computed(() => authStore.can(HR_PERMISSION.DELETE_EMPLOYEE_DEDUCTION));
const canMutate = computed(() => canEdit.value || canDelete.value);
```

**Reusability:** Mirror this for freelancers and freelancer payrolls using the 9 missing permission slugs.

#### Pattern: Nav + route under Payroll

**Location:** `src/router/hr-dashboard.js`, `src/components/hr-dashboard/sideItem.js`

**How it works:**  
Route `hr-freelancers-payroll` with `meta.requiresPermission: "view-freelancers"`. Sidebar child under Payroll: “Freelancers Payroll”.

**Reusability:** Keep placement under Payroll (matches “management and payroll”). Prefer `HR_PERMISSION.VIEW_FREELANCERS` instead of a raw string for consistency.

#### Pattern: Payroll reports freelancer summary (adjacent)

**Location:** `src/views/hr/PayrollReports.vue`, `src/stores/hr/payrollReportsStore.js`

**How it works:**  
Separate reporting API `payroll-reports/freelancers` — not the same as `freelancers-payroll/total-by-month`. Has a hard-coded fallback total on error.

**Reusability:** Out of scope for core freelancers-payroll CRUD unless reporting should also gate on `view-freelancer-payroll-total`. Document as adjacent, not the primary total source for the Freelancers Payroll page.

### Reusable Components

| Asset | How to leverage |
|-------|-----------------|
| `useFreelancersStore` | Extend; already uses `apiClient`, `handleError`, `notyf`, `res.data?.data ?? res.data` |
| `FREELANCERS_*` / `FREELANCER_*` Api constants | Already match contract paths |
| `HrDataTable` | List freelancers and/or payrolls like deductions |
| `HrModal` | Create/edit forms |
| `SweetAlert2Modal` | Soft-delete confirmations |
| `SearchableSelect` | Freelancer filter on payroll tab |
| `authStore.can` + `HR_PERMISSION` | Gate all actions + optional total widget |
| Route + sidebar entry | Already registered; refine permissions |

### Conventions to Follow

- Path constants in `Api.js` without leading `/api` (axios `BASE_URL` adds it)
- Stores: `defineStore`, `handleError`, `notyf.success` on mutations
- Response unwrap: `res.data?.data ?? res.data`
- Views: `HR_PERMISSION.*` + `authStore.can`; avoid ungated destructive actions
- Prefer server query filters when the API documents them
- Soft delete: confirm copy should state soft-delete; UI removes from list after successful DELETE

---

## API Contract (authoritative — from user)

Base: `https://shark-app-s8ndy.ondigitalocean.app/api`  
Auth: Bearer token (same as rest of app via `apiClient`)

### 1. Freelancer Management

| Action | Method | Path | Notes |
|--------|--------|------|-------|
| List | GET | `/freelancers-payroll/freelancers` | Filters: `first_name`, `last_name`, `email` |
| Create | POST | `/freelancers-payroll/freelancers` | `first_name` required; optional `last_name`, `email` (unique), `phone` max 20, `contract_link` url max 500, `notes` |
| Show | GET | `/freelancers-payroll/freelancers/{id}` | |
| Update | PUT | `/freelancers-payroll/freelancers/{id}` | All fields optional |
| Delete | DELETE | `/freelancers-payroll/freelancers/{id}` | Soft delete |

### 2. Freelancer Payroll Management

| Action | Method | Path | Notes |
|--------|--------|------|-------|
| List all | GET | `/freelancers-payroll/payrolls` | Filters: `freelancer_id`, `payroll_month`, `from`, `to` |
| List by freelancer | GET | `/freelancers-payroll/freelancers/{id}/payrolls` | |
| Create | POST | `/freelancers-payroll/payrolls` | Required: `freelancer_id`, `payroll_month` (`Y-m`), `net_amount` (numeric, min 0); optional `payment_date`, `notes` |
| Show | GET | `/freelancers-payroll/payrolls/{id}` | |
| Update | PUT | `/freelancers-payroll/payrolls/{id}` | All fields optional |
| Delete | DELETE | `/freelancers-payroll/payrolls/{id}` | Soft delete |
| Month total | GET | `/freelancers-payroll/total-by-month?month=Y-m` | Net amount for month |

### 2.1 Permissions (module)

| Area | Slugs |
|------|-------|
| Freelancer Management | `view-freelancers`, `create-freelancers`, `update-freelancers`, `delete-freelancers` |
| Freelancer Payroll | `view-freelancer-payrolls`, `create-freelancer-payrolls`, `update-freelancer-payrolls`, `delete-freelancer-payrolls` |
| Reporting | `view-freelancer-payroll-total` |

---

## External Solutions / Implementation Options

### Option 1: Harden existing FreelancersPayroll page (recommended)

**Overview:** Keep current route/store/API constants. Add missing permissions, gate UI, pass API filters, wire unused endpoints as needed, optionally migrate to `HrDataTable`/`HrModal`.

**Pros:**
- Lowest effort — feature already ~70–80% present
- Matches existing nav mental model (Payroll → Freelancers Payroll)
- Uses provided API/permissions as the completion checklist

**Cons:**
- Custom UI remains until migrated (or migration work in same pass)
- Single page mixes two permission domains (freelancers vs payrolls)

**Implementation complexity:** Low–Medium  
**Team familiarity:** High  

### Option 2: Split into two pages (Management vs Payroll)

**Overview:** Separate routes — e.g. Freelancers list vs Freelancer Payrolls — each gated by its own `view-*` permission.

**Pros:**
- Cleaner permission model (`view-freelancers` vs `view-freelancer-payrolls`)
- Smaller pages; clearer IA for “team management” vs “payroll”

**Cons:**
- More routing/sidebar work; duplicate layout chrome
- Overkill if most users have both permission sets

**Implementation complexity:** Medium  
**Team familiarity:** High  

### Option 3: Rebuild from scratch with only HrDataTable patterns

**Overview:** Discard custom card/Teleport UI; rewrite both lists as EmployeeDeductions-style pages.

**Pros:**
- Maximum consistency with HR module
- Easier long-term maintenance

**Cons:**
- Higher churn for a working page
- Risk of regression on total widget and dual-tab UX

**Implementation complexity:** Medium–High  
**Team familiarity:** High  

---

## Comparison Matrix

| Criteria | Option 1: Harden existing | Option 2: Split pages | Option 3: Full rewrite |
|----------|---------------------------|------------------------|-------------------------|
| Fit to provided API | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Permission fidelity | ⭐⭐⭐ (with dual gates on one page) | ⭐⭐⭐ | ⭐⭐⭐ |
| Effort / time | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Consistency with HR UI | ⭐⭐ (improve incrementally) | ⭐⭐⭐ | ⭐⭐⭐ |
| Reuse of current code | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Risk of regression | ⭐⭐⭐ | ⭐⭐ | ⭐ |

---

## Gap Matrix (current app vs your contract)

| Contract item | Current status |
|---------------|----------------|
| Freelancer list + CRUD API | Wired in store + UI |
| List filters `first_name`, `last_name`, `email` | Store accepts params; **UI client-side only** |
| `GET freelancers/{id}` | Store method exists; **view unused** (edit from list row) |
| Payroll list + CRUD API | Wired in store + UI |
| Filters `from`, `to` | **Not used in UI** |
| `GET freelancers/{id}/payrolls` | Api constant only |
| `GET payrolls/{id}` | **Not implemented** |
| `total-by-month` | Wired + header; **not permission-gated** |
| `view-freelancers` | Route + sidebar |
| Other 8 permission slugs | **Missing** from `hrPermissions.js` and UI |
| `net_amount` min 0 | UI currently requires **> 0** (stricter than API) |

---

## Recommendations

### Primary Recommendation

**Option 1 — Harden the existing Freelancers Payroll feature** against the API and permission list you provided:

1. Add all 9 missing slugs to `HR_PERMISSION` and gate actions (and optionally tabs/widgets).
2. Pass documented query filters to the API from the UI.
3. Add `fetchPayroll(id)` and optionally `fetchPayrollsForFreelancer(id)` when needed for detail/history UX.
4. Align validation (`net_amount >= 0`), delete confirms, and preferably `HrModal` / `HrDataTable` / `SweetAlert2Modal`.
5. Gate month total with `view-freelancer-payroll-total`.

### Alternative Approach

**Option 2** if product wants freelancers under “team/employees” navigation separately from payroll payouts — split routes and sidebar entries by `view-freelancers` vs `view-freelancer-payrolls`.

---

## Open Questions

- Should users with only `view-freelancer-payrolls` (no `view-freelancers`) still open the page, or must they always have `view-freelancers` for route entry?
- Should the Freelancers tab hide entirely without `view-freelancers`, and Payroll Records without `view-freelancer-payrolls`?
- Is `net_amount: 0` allowed in the UI (API says min 0)?
- Are `from` / `to` date-range filters required for v1, or month + freelancer enough?
- Should soft-deleted freelancers remain selectable for historical payrolls? (API behavior unknown — confirm if needed)
- Is `payroll-reports/freelancers` in Payroll Reports in or out of this feature’s permission story?

---

## Next Steps

1. Review this research (especially gap matrix + open questions)
2. Run `/specify freelancer-payroll` to lock requirements and acceptance criteria
3. Run `/plan freelancer-payroll` for implementation tasks (permissions, filters, UI alignment)

---

*Research completed with SDD 6.0*
