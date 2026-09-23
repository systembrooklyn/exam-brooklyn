# Todo List: freelancer-payroll

**Status:** Completed  
**Completed:** 2026-09-23  
**Based on:** plan.md, spec.md  
**Started:** 2026-09-23

## Phase 1 — Setup
- [x] Add freelancers-payroll slugs to `HR_PERMISSION`
- [x] Update route `beforeEnter` (Admin/HR or any view slug)
- [x] Update sidebar Freelancers Payroll `permissions` any-of

## Phase 2 — Store
- [x] Extend `freelancersStore` (fetchPayroll, fetchPayrollsForFreelancer, strip empty params)

## Phase 3 — UI
- [x] Rewrite `FreelancersPayroll.vue` (HR style, gates, filters, tables, modals)
- [x] Month total gated; `net_amount >= 0`; no alert/confirm
- [x] Freelancer → payrolls shortcut (Should Have)

## Phase 4 — Verify
- [x] sdd-verifier pass (PASS WITH GAPS — non-blocking polish only)

## Phase 5 — Follow-ups (shipped after implement)
- [x] Move Freelancers out of Payroll sidebar (standalone nav item)
- [x] Edit payload sends changed fields only (freelancer + payroll)

## Progress Log

| Date | Item | Status | Notes |
|------|------|--------|-------|
| 2026-09-23 | Implementation started | done | User approved |
| 2026-09-23 | Permissions + route + sidebar | done | |
| 2026-09-23 | Store extend | done | |
| 2026-09-23 | UI rewrite | done | HrDataTable/HrModal/SweetAlert2 |
| 2026-09-23 | Verifier | done | PASS WITH GAPS |
| 2026-09-23 | Standalone sidebar + partial edit payload | done | |
| 2026-09-23 | Task closed | done | Moved to `specs/completed/` |
