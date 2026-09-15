# Feature Brief: Job Request Prefill + Manpower Capacity Guard

**Task ID:** job-request-prefill
**Created:** 2026-09-14
**Updated:** 2026-09-14
**Status:** Completed  
**Version:** 1.4

---

## Problem Statement

When HR creates a Job Request from Manpower Overview or manually, position/requirements should prefill quickly. Separately, manual Job Requests must not bypass company manpower targets: if a position has no open vacancy (or no manpower plan at all), HR must not create a Job Request until they increase planned headcount or process a departure that frees a seat.

## Target Users

HR staff with `create-job-requests` — from Manpower Overview or from Job Requests list create.

## Core Requirements

### Must Have (shipped through v1.3)
- [x] Prefill Paths A/B, capacity guard Path C, first-selection flush, form busy overlay

### Must Have (v1.4 — Department prefill)
- [x] Always prefill **Department** when Position is known, from Position (`department_id` / nested `department`) and/or nested `requirement.position.department*` when present
- [x] Fallback to `getPosition(id)` if list lookup misses department
- [x] Note: requirements schema itself has no top-level department field — source of truth is Position (and nested position on requirement payloads when API includes it)

## Technical Approach

**v1.4:** Harden `resolvePositionDepartmentId(positionId, requirement?)`; re-resolve after requirements fetch; optional single-position fetch; Manpower path fills department from position when query `department_id` empty.

## Success Criteria

- [x] Selecting a Position on manual create fills Department when the position has a department
- [x] Overlay / capacity / requirements behavior unchanged

## Changelog

| Version | Date | Description | Reason |
|---------|------|-------------|--------|
| 1.0 | 2026-09-14 | Prefill from Manpower + manual Position requirements | Initial feature |
| 1.1 | 2026-09-14 | Block manual job request when position manpower is full or missing a plan | Protect manpower targets |
| 1.2 | 2026-09-14 | Flush Path B/C after mount if Position already selected | First selection before mountDone ignored |
| 1.3 | 2026-09-14 | Form-wide busy overlay while position requirements + capacity resolve | Visible process without wiping user input |
| 1.4 | 2026-09-14 | Harden Department prefill from Position (+ nested requirement.position) | Department stayed empty on first select |

---

*Brief created with SDD 6.0*
