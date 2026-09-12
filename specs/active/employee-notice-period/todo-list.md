# Todo List: Employee Notice Period Flag

**Task ID:** employee-notice-period  
**Status:** Complete (pending live API QA)  
**Started:** 2026-09-12  
**Finished:** 2026-09-12

## Todos

- [x] 1.1 Add `MANPOWER_EMPLOYEE_NOTICE` in `Api.js`
- [x] 1.2 Add `setEmployeeNotice` in `employees.js` store
- [x] 2.1 Add notice checkbox + conditional date in `Employees.vue`
- [x] 3.1 Seed notice fields in `openEditModal`
- [x] 3.2 Wire notice dirty-check + API call in `handleSubmit`
- [x] 4.1 Static verification against acceptance criteria (live API QA remains for user)

## Progress Log

| Date | Item | Status | Notes |
|------|------|--------|-------|
| 2026-09-12 | 1.1 | Done | `MANPOWER_EMPLOYEE_NOTICE` |
| 2026-09-12 | 1.2 | Done | `setEmployeeNotice` — no list refresh in store |
| 2026-09-12 | 2.1 | Done | Checkbox + date in Employment Details (edit only) |
| 2026-09-12 | 3.1 | Done | `readEmployeeNoticeFields` on openEditModal |
| 2026-09-12 | 3.2 | Done | Dirty notice → POST; notice-only save fixed |
| 2026-09-12 | 4.1 | Done | sdd-verifier: PASS WITH NOTES |

## Verifier notes

- Confirm employee list payload includes `is_on_notice` / `notice_period_ends_at`
- Manual: Save → Manpower headcount drops → job request possible
- Date “after today” enforced by API 422

---
*SDD 6.0*
