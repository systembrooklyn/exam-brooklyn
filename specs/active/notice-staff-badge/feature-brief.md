# Feature Brief: Notice Badge on Current Staff Modal

**Task ID:** notice-staff-badge  
**Created:** 2026-09-12  
**Status:** Ready for Development

---

## Problem Statement

The manpower position employees API already returns `is_on_notice` and `notice_period_ends_at`, but the Current Staff modal shows no visual difference for employees on notice. HR cannot tell who is leaving without opening Network or Edit Employee.

## Target Users

HR users reviewing Current Staff for a position in Manpower Overview.

## Core Requirements

### Must Have
- [x] Show an "On notice" badge when `emp.is_on_notice` is true in Current Staff modal
- [x] Hide badge when `is_on_notice` is false/missing
- [x] Match existing pill/badge styling in the modal

### Nice to Have
- [x] Show notice end date near the badge when `notice_period_ends_at` is present

## Technical Approach

UI-only change in `ManpowerOverview.vue` Current Staff modal row. Read boolean from API payload already loaded into `selectedEmployees`. No new endpoints or store changes.

**Patterns to Follow:**
- Existing branch pill (`rounded-full bg-gray-100 …`)
- Amber/warning tone to distinguish from branch indigo accent

**Key Decisions:**
- Badge label "On notice": Clear, short, matches Edit Employee wording
- Placement next to employee name: Visible without competing with branch pill

## Next Actions

1. [x] Add notice badge (+ optional end date) in employee row template
2. [x] Helper to format `notice_period_ends_at` for display
3. [ ] Verify with known on-notice employee (e.g. Amr Hatem)

## Success Criteria

- [x] On-notice employees show badge in Current Staff list
- [x] Off-notice employees unchanged
- [x] No API/store changes required

## Open Questions

- None — stakeholder approved badge style A

---

*Brief created with SDD 6.0 - Ready to code!*
