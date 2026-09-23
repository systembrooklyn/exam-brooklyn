# Specification: Freelancer Management & Payroll

**Task ID:** freelancer-payroll  
**Created:** 2026-09-23  
**Status:** Completed  
**Completed:** 2026-09-23  
**Version:** 1.0  
**Research:** `specs/completed/freelancer-payroll/research.md`

---

## 1. Problem Statement

- **The Problem:** HR needs to manage freelancers (profiles, contracts, notes) and record monthly net payouts separately from employee payroll, with the same UX and access rules as the rest of the HR module.
- **Current Situation:** A scaffold exists (`FreelancersPayroll.vue`, store, API constants, route under Payroll) but it diverges from HR patterns: incomplete permissions, ungated CRUD, client-only search, unused API filters/endpoints, custom cards/Teleport/`alert` instead of `HrDataTable` / `HrModal` / Soft-delete confirms.
- **Desired Outcome:** One hardened Freelancers Payroll page (two tabs) that matches HR style, uses the freelancers-payroll API fully for important filters, and enforces: Admin and HR role see/do everything; other users need the matching permission slug.

---

## 2. User Personas

### Primary User: HR Admin / HR Role Staff

- **Who:** System admin (`isAdminUser`) or user with HR role/permission (`hasHrRoleOrHrPermission`), same pattern as Payroll admin pages.
- **Goals:** Maintain freelancer roster, record monthly payouts, see month net totals, filter lists quickly.
- **Pain points:** Scaffold UI feels inconsistent; permissions not enforced for non-HR staff.

### Secondary User: Restricted Payroll Operator

- **Who:** Non-admin, non-HR-role user granted specific freelancers-payroll permission slugs.
- **Goals:** Only perform actions they are allowed (e.g. view + create payrolls but not delete freelancers).
- **Pain points:** Today buttons are always visible; risk of unauthorized API calls from UI.

---

## 3. Functional Requirements

### FR-1: Access Control (Admin / HR / Permission)

**Description:** Gate route entry, sidebar visibility, tabs, actions, and month-total widget using the same access model as existing HR Payroll admin features.

**User Story:**
> As an HR or Admin user, I want full access to freelancers and freelancer payrolls without assigning every slug, so that day-to-day HR work is unblocked. As a limited user, I want to see only actions I am permitted to perform.

**Acceptance Criteria:**
- [ ] Given Admin (`authStore.isAdminUser`), when opening Freelancers Payroll, then all tabs, CRUD actions, and month total are available (`authStore.can` treats all slugs as allowed).
- [ ] Given HR role (`authStore.hasHrRoleOrHrPermission`), when using this module, then full access matches Admin for this feature (route, sidebar under Payroll admin block, all CRUD, month total).
- [ ] Given a non-admin, non-HR user without `view-freelancers` and without `view-freelancer-payrolls`, when navigating to the route, then access is denied (redirect consistent with other HR gated pages).
- [ ] Given a limited user with only some slugs, when viewing the page, then create/edit/delete buttons for freelancers and payrolls appear only for matching `create-*` / `update-*` / `delete-*` permissions.
- [ ] Given a limited user without `view-freelancer-payroll-total`, when viewing the page, then the month net-total widget is hidden.
- [ ] Given Freelancers tab requires `view-freelancers` (or Admin/HR), when user lacks it but has `view-freelancer-payrolls`, then only Payroll Records tab is usable (and vice versa if only freelancers view).
- [ ] Permission constants for all module slugs exist in `HR_PERMISSION` and are used (no raw string literals for gating).

**Priority:** Must Have

**Permission slugs:**
| Slug | Purpose |
|------|---------|
| `view-freelancers` | Freelancers tab / list |
| `create-freelancers` | Add freelancer |
| `update-freelancers` | Edit freelancer |
| `delete-freelancers` | Soft-delete freelancer |
| `view-freelancer-payrolls` | Payroll Records tab / list |
| `create-freelancer-payrolls` | Add payroll record |
| `update-freelancer-payrolls` | Edit payroll record |
| `delete-freelancer-payrolls` | Soft-delete payroll record |
| `view-freelancer-payroll-total` | Month net-total widget |

---

### FR-2: Freelancer List & Filters

**Description:** List freelancers via API with server-side filters; present in HR-consistent table style.

**User Story:**
> As an HR user, I want to filter freelancers by first name, last name, and email, so that I can find contractors quickly in a growing roster.

**Acceptance Criteria:**
- [ ] Given the Freelancers tab is visible, when the page loads (or filters change), then `GET freelancers-payroll/freelancers` is called with query params for provided filters only.
- [ ] Filters available: `first_name`, `last_name`, `email`, plus Clear Filters resetting params and refetching.
- [ ] Results render with HR list styling (`HrDataTable` or equivalent peer pattern), not a one-off card island unless kept only as a documented exception — **spec requires alignment with Employee Deductions / Departments style**.
- [ ] Empty and loading states match other HR pages.
- [ ] Client-only search must not replace API filters (optional local refine is Nice to Have only if API already filtered).

**Priority:** Must Have

---

### FR-3: Freelancer Create / Update / Soft Delete

**Description:** CRUD against freelancers API with validation matching the contract.

**User Story:**
> As an HR user, I want to add, edit, and soft-delete freelancers with contract link and notes, so that contractor records stay accurate.

**Acceptance Criteria:**
- [ ] Create requires `first_name`; optional: `last_name`, `email`, `phone` (max 20), `contract_link` (URL), `notes`.
- [ ] Forms use `HrModal` (or same modal pattern as peer HR pages); success/error via existing `notyf` / `handleError` patterns (no `alert()`).
- [ ] Soft delete uses confirm modal pattern (`SweetAlert2Modal` or HR equivalent); copy indicates soft delete.
- [ ] Create/Update/Delete only available when permission (or Admin/HR) allows.
- [ ] After successful mutation, list refreshes.

**Priority:** Must Have

---

### FR-4: Freelancer Payroll List & Filters

**Description:** List payroll records with the important filters for payroll ops.

**User Story:**
> As an HR user, I want to filter payouts by freelancer, payroll month, and date range, so that I can reconcile a period quickly.

**Acceptance Criteria:**
- [ ] Given Payroll Records tab, when filters change, then `GET freelancers-payroll/payrolls` is called with: `freelancer_id`, `payroll_month` (`Y-m`), `from`, `to` (as supported by API), omitting empty params.
- [ ] Clear Filters resets and refetches.
- [ ] Table shows at least: freelancer name, payroll month, net amount, payment date, notes, actions.
- [ ] Freelancer picker uses searchable select pattern where peers do (e.g. Employee Deductions).

**Priority:** Must Have

---

### FR-5: Freelancer Payroll Create / Update / Soft Delete

**Description:** CRUD for payroll records per API contract.

**User Story:**
> As an HR user, I want to record a monthly net amount for a freelancer (with optional payment date and notes), so that freelancer payouts are tracked like other payroll data.

**Acceptance Criteria:**
- [ ] Create requires `freelancer_id`, `payroll_month` (`Y-m`), `net_amount` numeric **≥ 0** (API min 0; UI must allow 0).
- [ ] Optional: `payment_date`, `notes`.
- [ ] Edit/update via PUT; soft delete via DELETE with confirm.
- [ ] Actions gated by `create/update/delete-freelancer-payrolls` (or Admin/HR).
- [ ] After mutation, list refreshes; if month total is visible, total refreshes for the selected summary month.

**Priority:** Must Have

---

### FR-6: Month Net Total

**Description:** Show total net amount for a selected month via `total-by-month`.

**User Story:**
> As an HR user with reporting access, I want to see the total freelancer net payout for a month, so that I can sanity-check monthly spend.

**Acceptance Criteria:**
- [ ] Given `view-freelancer-payroll-total` (or Admin/HR), when month changes, then `GET freelancers-payroll/total-by-month?month=Y-m` loads and displays the total (EGP formatting consistent with page).
- [ ] Given user lacks that permission (and is not Admin/HR), then the widget is not shown.
- [ ] On API failure, show error via standard handling; optional local fallback sum may remain only if labeled or matching existing scaffold behavior without inventing fake totals.

**Priority:** Must Have

---

### FR-7: HR Visual & Interaction Consistency

**Description:** Page look-and-feel and interaction patterns match the rest of the HR section.

**User Story:**
> As an HR user, I want Freelancers Payroll to feel like Employee Deductions / Deduction Types, so that I do not need to learn a different UI.

**Acceptance Criteria:**
- [ ] Header, filters row, primary buttons, table/modal spacing, and typography follow existing HR dashboard conventions.
- [ ] Use shared HR components (`HrDataTable`, `HrModal`, confirm modal) rather than one-off Teleport/`alert`/`confirm` where peers already standardized.
- [ ] Sidebar label remains under Payroll; permission constant used for nav gating (`view-freelancers` and/or any-of with `view-freelancer-payrolls` as planned in `/plan`).
- [ ] Stay under existing route `/hr/freelancers-payroll` (single page, two tabs) unless planning documents a necessary split.

**Priority:** Must Have

---

### FR-8: Optional Detail Endpoints (Should Have)

**Description:** Use show/member payroll endpoints when they improve UX without blocking v1 lists.

**User Story:**
> As an HR user, I want to open a freelancer’s payroll history or load a single payroll for edit when needed, so that deep links and accuracy are possible.

**Acceptance Criteria:**
- [ ] Should Have: `GET freelancers-payroll/freelancers/{id}/payrolls` available from store when viewing a freelancer’s payroll history (e.g. from list action or filter shortcut).
- [ ] Should Have: `GET freelancers-payroll/payrolls/{id}` for fetch-before-edit if list payload is incomplete.
- [ ] Nice to Have: `GET freelancers/{id}` for detail drawer — not required if list row is sufficient for edit forms.

**Priority:** Should Have

---

## 4. Non-Functional Requirements

- **Performance:** Initial dual fetch (freelancers + payrolls when both tabs permitted) should complete under normal API latency; filter changes debounce or change-on-blur/change event like peer pages (no excessive refetch loops).
- **Security:** UI gates must match permission model; Admin/HR full access; never rely on hidden buttons alone for security (API still enforces) but UI must not expose actions the user cannot use.
- **Accessibility:** Form labels, required field indicators, keyboard-usable modals consistent with HR peers.
- **Scalability:** Prefer server-side filters over loading entire datasets client-side for search.
- **Consistency:** Currency display, month inputs (`type="month"` → `Y-m`), and soft-delete UX match HR payroll screens.
- **i18n:** English UI copy consistent with current HR module (no new language requirement).

---

## 5. Out of Scope

- ❌ Freelancer self-service portal / login — separate product
- ❌ Bank details, tax invoices, payment gateway integration — not in API
- ❌ Converting freelancer → employee — not in API
- ❌ Changes to `payroll-reports/freelancers` (Payroll Reports tab) permission story — adjacent feature; leave as-is unless a follow-up task
- ❌ Hard-coded fake totals (e.g. `75000` fallback in reports) — do not replicate here
- ❌ New third-party libraries for tables/modals — reuse HR stack

---

## 6. Edge Cases & Error Handling

| Scenario | Expected Behavior |
|----------|-------------------|
| User is Admin | Full module access; no missing-permission empty states for actions |
| User is HR role | Full module access (same as Admin for this feature) |
| User has only view freelancers | Sees Freelancers tab; no create/edit/delete; no payroll tab / or payroll tab blocked |
| User has only view payrolls | Sees Payroll Records; freelancer mutations hidden |
| Empty filter result | Empty state message; no error toast |
| Duplicate email on create/update | Surface API validation via `handleError` / notyf |
| Soft-deleted freelancer | Removed from active list after successful DELETE; do not invent restore UI |
| `net_amount` = 0 | Allowed; reject only negative values |
| Invalid / empty required fields | Inline or notyf validation before POST; no silent fail |
| `total-by-month` 403 | Hide or show permission-aware message; do not show fabricated number |
| API network error | `handleError`; list/total unchanged until retry |

| Error | User Message | System Action |
|-------|--------------|---------------|
| 401/403 | Existing global/auth handling | Deny action; no partial success UI |
| 422 validation | API message via handleError/notyf | Keep modal open with submitted values |
| 404 on update/delete | Not found message | Close modal if open; refresh list |
| 500 | Generic error via handleError | No fake data |

---

## 7. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Permission coverage | All 9 module slugs in `HR_PERMISSION` + UI gates | Code review / QA matrix |
| Filter coverage | Freelancer 3 filters + payroll 4 filters wired to API | Manual QA against API |
| UI consistency | Uses shared HR table/modal/confirm patterns | Side-by-side with Employee Deductions |
| Admin/HR access | Admin and HR role can complete full CRUD + total without extra slugs | Manual login as Admin, HR, limited user |
| No `alert`/`confirm` | Zero native dialogs on this page | Grep / QA |
| Soft delete | Delete confirms and list updates | Manual QA |

---

## 8. Open Questions

- [x] Style like rest of HR — **Yes**
- [x] Admin sees all — **Yes** (`isAdminUser` / `can`)
- [x] HR role sees all for this module — **Yes** (`hasHrRoleOrHrPermission`, same as Payroll admin pages)
- [x] Important filters — **Agreed:** freelancers `first_name`, `last_name`, `email`; payrolls `freelancer_id`, `payroll_month`, `from`, `to`; total `month`
- [x] `net_amount` ≥ 0 — **Yes**
- [x] Single page two tabs — **Yes**
- [x] Payroll Reports freelancer tab — **Out of scope**
- [ ] Confirm backend: does HR role receive all permission slugs in `GET user`, or must frontend special-case HR like `nextIfCanManagePayrollAdmin`? *(Planning should mirror existing Payroll admin pattern explicitly.)*
- [ ] Confirm whether route entry should be any-of (`view-freelancers` OR `view-freelancer-payrolls` OR Admin/HR)

---

## 9. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-23 | Initial specification from research + stakeholder approval |

## Next Steps

1. Review spec with stakeholders  
2. Resolve remaining open questions during `/plan`  
3. Run `/plan freelancer-payroll` to create the technical implementation plan  

*Specification created with SDD 6.0*
