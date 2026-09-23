# Technical Plan: Freelancer Management & Payroll

**Task ID:** freelancer-payroll  
**Status:** Completed  
**Completed:** 2026-09-23  
**Based on:** `spec.md`, `research.md`  
**Date:** 2026-09-23  

---

## 1. System Architecture

### Overview

Harden the existing Freelancers Payroll feature in place. Keep the single route `/hr/freelancers-payroll` and Pinia store; align UI with HR Payroll peers; complete permission constants and Admin/HR/slug gating; wire documented API filters.

```mermaid
flowchart TB
  subgraph UI["FreelancersPayroll.vue"]
    Tabs[Tabs: Freelancers | Payroll Records]
    FiltersF[Freelancer filters]
    FiltersP[Payroll filters]
    Total[Month net total widget]
    TableF[HrDataTable freelancers]
    TableP[HrDataTable payrolls]
    ModalF[HrModal freelancer]
    ModalP[HrModal payroll]
    Confirm[SweetAlert2Modal]
  end

  subgraph Auth["Access layer"]
    Admin[isAdminUser]
    HR[hasHrRoleOrHrPermission]
    Can[authStore.can slug]
    Helper["canModule(slug) = Admin || HR || can(slug)"]
  end

  subgraph Store["useFreelancersStore"]
    FF[fetchFreelancers params]
    FP[fetchPayrolls params]
    FT[fetchTotalByMonth]
    CRUD[create/update/delete]
    Extra[fetchPayroll / fetchPayrollsForFreelancer]
  end

  subgraph API["apiClient → freelancers-payroll/*"]
    E1[freelancers]
    E2[payrolls]
    E3[total-by-month]
  end

  Tabs --> Helper
  Total --> Helper
  TableF --> Helper
  TableP --> Helper
  FiltersF --> FF
  FiltersP --> FP
  Total --> FT
  ModalF --> CRUD
  ModalP --> CRUD
  Confirm --> CRUD
  FF --> E1
  FP --> E2
  Extra --> E2
  FT --> E3
  CRUD --> E1
  CRUD --> E2
```

### Architecture decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Harden existing scaffold | Research: ~70–80% already wired; lowest risk |
| Page shape | Single page, two tabs | Spec FR-7; avoids route split |
| UI stack | `HrDataTable` + `HrModal` + `SweetAlert2Modal` | Match Employee Deductions / Deduction Types |
| Access helper | `Admin \|\| HR role \|\| can(slug)` | Spec FR-1; `can()` alone only bypasses Admin |
| Route entry | Any-of view freelancers / view payrolls + Admin/HR | Spec open question resolved |
| Sidebar | Under Payroll admin block; `permissions` any-of | Same parent as Payrolls; HR already sees block via `canManagePayrollAdminPages` |
| Filters | Server-side only for listed params | Spec FR-2 / FR-4 |
| Fake totals | Never | Spec out of scope / FR-6 |
| New libs | None | Spec NFR |

---

## 2. Technology Stack

| Layer | Technology | Notes | Rationale |
|-------|------------|-------|-----------|
| UI | Vue 3 SFC `<script setup>` | Existing HR views | Consistency |
| State | Pinia `freelancersStore` | Already present | Extend, don’t replace |
| HTTP | `apiClient` (`axiosInstance`) | Bearer auth | Existing |
| Paths | `src/api/Api.js` constants | Already match contract | Keep |
| Permissions | `HR_PERMISSION` + `authStore` | Extend constants | Spec FR-1 |
| Shared UI | `HrDataTable`, `HrModal`, `SearchableSelect`, `SweetAlert2Modal`, `notyf` | Peer pages | Spec FR-7 |
| Errors | `handleError` in store | Existing | Spec §6 |

**Dependencies:** None new. Reuse current package.json stack.

---

## 3. Component Design

### 3.1 `src/constants/hrPermissions.js`

- **Purpose:** Canonical freelancers-payroll permission slugs.
- **Responsibilities:** Add:
  - `CREATE_FREELANCERS`, `UPDATE_FREELANCERS`, `DELETE_FREELANCERS`
  - `VIEW_FREELANCER_PAYROLLS`, `CREATE_FREELANCER_PAYROLLS`, `UPDATE_FREELANCER_PAYROLLS`, `DELETE_FREELANCER_PAYROLLS`
  - `VIEW_FREELANCER_PAYROLL_TOTAL`
  - Keep existing `VIEW_FREELANCERS`
- **Dependencies:** None.

### 3.2 Access helper (in view or tiny util)

- **Purpose:** Single predicate for module gates.
- **Interface:**
  ```js
  function canFreelancerModule(slug) {
    return authStore.isAdminUser
      || authStore.hasHrRoleOrHrPermission
      || authStore.can(slug);
  }
  ```
- **Usage:** All tab visibility, CRUD buttons, month-total widget, and route `beforeEnter` (route may call the same logic inline).
- **Note:** Prefer local computeds in the view for clarity (`canViewFreelancers`, `canCreateFreelancers`, …) wrapping this helper — same style as Employee Deductions.

### 3.3 `src/stores/hr/freelancersStore.js`

- **Purpose:** API boundary for freelancers + payrolls + month total.
- **Keep:** Existing CRUD, `fetchTotalByMonth`, unwrap `res.data?.data ?? res.data`, `notyf` + `handleError`.
- **Add:**
  - `fetchPayroll(id)` → `GET FREELANCER_PAYROLL_BY_ID(id)` (sets `currentPayroll`)
  - `fetchPayrollsForFreelancer(id, params?)` → `GET FREELANCER_PAYROLLS_FOR_MEMBER(id)`
- **Improve:** Optional `buildQuery(params)` that drops empty/`null`/`''` keys before GET.
- **Loading:** Prefer separate `loading` / `submitting` (already present); avoid blocking both tabs unnecessarily if easy — optional polish.
- **Dependencies:** `Api.js` constants (already exports `FREELANCER_PAYROLLS_FOR_MEMBER`).

### 3.4 `src/views/hr/FreelancersPayroll.vue`

- **Purpose:** Sole UI for the feature.
- **Layout (peer HR style):**
  1. Page header + optional month-total card (`v-if="canViewTotal"`)
  2. Tabs (only show a tab if corresponding view permission / Admin/HR)
  3. Filter row → `HrDataTable` → `HrModal` → `SweetAlert2Modal`
- **Freelancers tab filters:** `first_name`, `last_name`, `email` + Clear → `fetchFreelancers(params)`
- **Payrolls tab filters:** `freelancer_id` (`SearchableSelect`), `payroll_month` (`type="month"`), `from`, `to` (`type="date"`) + Clear → `fetchPayrolls(params)`
- **Validation:** `first_name` required; payroll: `freelancer_id`, `payroll_month`, `net_amount >= 0` (allow 0); `notyf.error` — no `alert`/`confirm`
- **Default tab:** First permitted tab (`freelancers` preferred if both)
- **On mount:** Fetch freelancers if can view freelancers; fetch payrolls if can view payrolls; fetch total if can view total
- **Dependencies:** store, auth, HR components, `HR_PERMISSION`

### 3.5 `src/router/hr-dashboard.js`

- **Purpose:** Route guard for `hr-freelancers-payroll`.
- **Change:** Replace single `meta.requiresPermission: "view-freelancers"` with `beforeEnter`:
  - `ensureAuthReady`
  - Allow if `isAdminUser || hasHrRoleOrHrPermission || can(VIEW_FREELANCERS) || can(VIEW_FREELANCER_PAYROLLS)`
  - Else redirect `SystemsPage` (or same as other HR denies)
- Also keep `nextIfCanManagePayrollAdmin` if product wants Freelancers Payroll only inside Payroll admin audience — **Decision:** Require **both** (1) Admin/HR **or** any view slug, **and** (2) Admin/HR for “payroll admin” audience **OR** allow limited users with only freelancers-payroll slugs without HR role.
  - **Final choice:** Allow limited users with freelancers-payroll view slugs **without** forcing `nextIfCanManagePayrollAdmin`, so permission-only operators work per spec FR-1 secondary persona. Sidebar Freelancers item still lives under Payroll block which is Admin/HR-only today — see sidebar decision below.

### 3.6 `src/components/hr-dashboard/sideItem.js`

- **Purpose:** Nav visibility.
- **Change:** Freelancers Payroll child:
  ```js
  permissions: [
    HR_PERMISSION.VIEW_FREELANCERS,
    HR_PERMISSION.VIEW_FREELANCER_PAYROLLS,
  ],
  ```
  (`filterHrSidebarItems` already supports any-of via `permissions`)
- **Sidebar parent:** Payroll group still gated by `canManagePayrollAdminPages` (Admin/HR).  
  - **Implication:** Limited non-HR users with only freelancers slugs can deep-link via route if granted, but may not see sidebar unless we also surface the item outside that block.
  - **Plan choice (Must Have):** Keep item under Payroll admin block (Admin/HR see it). Limited users: route works with slug; optional follow-up to expose nav for non-HR operators.
  - **Should Have polish:** If product needs limited users in sidebar, duplicate a top-level or always-visible child when `can(VIEW_*)` — document as follow-up if not in v1.

### 3.7 Unchanged / out of scope

- `PayrollReports.vue` freelancer summary — out of scope
- `Api.js` path constants — already correct; no path changes

---

## 4. Data Model

### Freelancer

```ts
interface Freelancer {
  id: number;
  first_name: string;          // required on create
  last_name?: string | null;
  email?: string | null;       // unique when set
  phone?: string | null;       // max 20
  contract_link?: string | null;
  notes?: string | null;
  // soft-deleted rows not returned by list API
}
```

### FreelancerPayroll

```ts
interface FreelancerPayroll {
  id: number;
  freelancer_id: number;
  payroll_month: string;       // Y-m
  net_amount: number;          // min 0
  payment_date?: string | null; // Y-m-d
  notes?: string | null;
  freelancer?: Pick<Freelancer, 'id' | 'first_name' | 'last_name' | 'email'>;
}
```

### Filter DTOs

```ts
interface FreelancerListFilters {
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface PayrollListFilters {
  freelancer_id?: number | string;
  payroll_month?: string; // Y-m
  from?: string;          // date
  to?: string;            // date
}
```

### Relationships

- Freelancer 1 — * FreelancerPayroll  
- Soft delete on either resource; no restore UI in v1

---

## 5. API Contracts

Base: app `apiClient` `BASE_URL` → same as `.../api/freelancers-payroll/...`

| Method | Path | Description |
|--------|------|-------------|
| GET | `freelancers-payroll/freelancers` | List; query: `first_name`, `last_name`, `email` |
| POST | `freelancers-payroll/freelancers` | Create |
| GET | `freelancers-payroll/freelancers/{id}` | Show (optional Nice to Have in UI) |
| PUT | `freelancers-payroll/freelancers/{id}` | Update |
| DELETE | `freelancers-payroll/freelancers/{id}` | Soft delete |
| GET | `freelancers-payroll/payrolls` | List; query: `freelancer_id`, `payroll_month`, `from`, `to` |
| GET | `freelancers-payroll/freelancers/{id}/payrolls` | Payrolls for one freelancer (Should Have) |
| POST | `freelancers-payroll/payrolls` | Create |
| GET | `freelancers-payroll/payrolls/{id}` | Show (Should Have) |
| PUT | `freelancers-payroll/payrolls/{id}` | Update |
| DELETE | `freelancers-payroll/payrolls/{id}` | Soft delete |
| GET | `freelancers-payroll/total-by-month?month=Y-m` | Month net total |

### Request examples

**Create freelancer**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+201234567890",
  "contract_link": "https://example.com/contract.pdf",
  "notes": "Freelance developer"
}
```

**Create payroll**
```json
{
  "freelancer_id": 1,
  "payroll_month": "2026-07",
  "net_amount": 500.0,
  "payment_date": "2026-07-15",
  "notes": "July 2026 payment"
}
```

### Response handling

- Unwrap: `res.data?.data ?? res.data` (and for total: `data.total_net_amount` / `total_net_amount` as store already does)
- Errors: `handleError(err)`; rethrow so view can keep modal open on 422

---

## 6. Security Considerations

### Authentication
- Existing Bearer via `apiClient`; no change.

### Authorization
| Layer | Rule |
|-------|------|
| Route | Admin/HR **or** `view-freelancers` **or** `view-freelancer-payrolls` |
| Tab Freelancers | Admin/HR **or** `view-freelancers` |
| Tab Payrolls | Admin/HR **or** `view-freelancer-payrolls` |
| Freelancer C/U/D | Admin/HR **or** matching create/update/delete-freelancers |
| Payroll C/U/D | Admin/HR **or** matching create/update/delete-freelancer-payrolls |
| Month total | Admin/HR **or** `view-freelancer-payroll-total` |
| Sidebar | Payroll block: Admin/HR (`canManagePayrollAdminPages`); item any-of view freelancers/payrolls |

### Data protection
- Soft delete only; no permanent hard-delete UI
- Do not log tokens or PII beyond existing patterns

### Security checklist
- [ ] No ungated create/edit/delete buttons
- [ ] No raw permission string literals in new/changed gates
- [ ] No fabricated totals on 403/error
- [ ] Confirm dialogs before soft delete
- [ ] Admin and HR role verified manually

---

## 7. Performance Strategy

| Target | Approach |
|--------|----------|
| Initial load | Fetch only resources the user can view (skip forbidden list/total) |
| Filters | Refetch on change/Clear like Employee Deductions (no live keystroke spam unless already peer pattern) |
| Dual loading | Shared `loading` OK for v1; optional split later |
| Caching | None required; refetch after mutations |
| Scaling | Server-side filters; do not download all freelancers for client search |

---

## 8. Implementation Phases

### Phase 1 — Setup (permissions & nav constants)
- [ ] Add all freelancers-payroll slugs to `HR_PERMISSION`
- [ ] Update `sideItem.js` Freelancers Payroll child to use `HR_PERMISSION` + `permissions` any-of
- [ ] Update route `beforeEnter` for any-of + Admin/HR

### Phase 2 — Store
- [ ] Import `FREELANCER_PAYROLLS_FOR_MEMBER`
- [ ] Add `fetchPayroll`, `fetchPayrollsForFreelancer`
- [ ] Ensure list methods pass through filter params; strip empties
- [ ] Confirm `net_amount` / total unwrap unchanged and correct

### Phase 3 — Core UI rewrite
- [ ] Rebuild `FreelancersPayroll.vue` to HR layout (header, tabs, filters, `HrDataTable`, `HrModal`, `SweetAlert2Modal`)
- [ ] Wire `canFreelancerModule` / computeds for all gates
- [ ] Freelancer filters + CRUD
- [ ] Payroll filters (`freelancer_id`, `payroll_month`, `from`, `to`) + CRUD
- [ ] Month total widget gated; allow `net_amount === 0`
- [ ] Remove `alert` / `confirm` / Teleport custom modals / card grid

### Phase 4 — Integration & Should-Have
- [ ] “View payrolls” shortcut: set payroll filter `freelancer_id` and switch tab (uses list API; optionally `fetchPayrollsForFreelancer`)
- [ ] Optional `fetchPayroll(id)` before edit if list row incomplete
- [ ] Manual QA: Admin, HR role, limited user matrices

### Phase 5 — Polish
- [ ] Empty/loading copy parity with peers
- [ ] Grep for `alert`/`confirm` on the page = 0
- [ ] Update research/spec open questions as resolved in a short note if needed (no code)

---

## 9. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| HR role users lack slugs in API payload | High — UI gated incorrectly if only using `can()` | Medium | Explicit `hasHrRoleOrHrPermission` in module helper |
| Limited users can’t see sidebar (Payroll block Admin/HR only) | Medium — deep-link only | Medium | Document; optional nav follow-up |
| `from`/`to` semantics unclear (payment_date vs created) | Low | Medium | Pass as API docs; verify with one QA month |
| List response nested pagination shape | Medium | Low | Normalize array like other stores (`data` / `data.data`) |
| Dual `loading` flickers both tabs | Low | Medium | Accept v1; split flags in polish if needed |
| Regression on existing scaffold users | Medium | Low | Keep route name/path; feature-flag not required |

---

## 10. Testing Strategy

| Level | What |
|-------|------|
| Manual QA | Admin: full CRUD + total; HR role: same; limited: each slug matrix |
| Manual QA | Filters hit network with correct query params |
| Manual QA | Soft delete confirm + list refresh |
| Manual QA | `net_amount` 0 allowed; negative rejected client-side |
| Smoke | Route deny → SystemsPage when no access |
| Regression | Payroll Reports page untouched |
| Static | Grep: no `alert(` / `confirm(` in `FreelancersPayroll.vue` |

---

## 11. Open Questions

- [x] Route any-of view freelancers/payrolls + Admin/HR — **Yes**
- [x] HR special-case in frontend — **Yes** (`hasHrRoleOrHrPermission`)
- [x] Keep under Payroll sidebar block — **Yes** (limited-user sidebar = follow-up)
- [ ] Confirm with backend: exact meaning of payroll `from` / `to` (payment_date range vs payroll_month bounds)
- [ ] Confirm whether Soft-deleted freelancers still appear in historical payroll joins (display-only)

---

## Next Steps

1. Review this plan  
2. Run `/tasks freelancer-payroll` to generate the implementation task list  
3. Run `/implement freelancer-payroll` (or `/execute-task`) to build  

*Technical plan created with SDD 6.0*
