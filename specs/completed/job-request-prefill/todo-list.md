# Todo List: job-request-prefill

## Phase 1–5 (shipped)
- [x] Prefill Paths A/B + Manpower deptId + verifiers

## Phase 6: Capacity guard (Path C)
- [x] Capacity status model + ensurePlansLoaded once
- [x] Evaluate vacancy on manual Position change
- [x] Banner + links to Manpower Overview / Employees
- [x] Disable Create when blocked / checking / error
- [x] Skip guard on edit + Manpower query path
- [x] Fix debounce race (set checking immediately)
- [x] sdd-verifier pass (after race fix)

## Phase 7: First-selection race (v1.2)
- [x] Set checking on Position select even before mountDone
- [x] After mountDone, flush Path B/C if position_id already set

## Phase 8: Form busy overlay (v1.3)
- [x] Form-wide overlay while prefillBusy or capacity checking
- [x] Do not remount form (preserve user field values)

## Phase 9: Department prefill (v1.4)
- [x] Harden resolvePositionDepartmentId (position + nested requirement.position)
- [x] Re-resolve after requirements; getPosition fallback
- [x] Manpower path: fill dept from position when query empty

## Progress Log

| Date | Item | Status | Notes |
|------|------|--------|-------|
| 2026-09-14 | Paths A/B | Done | Prefill shipped |
| 2026-09-14 | Capacity guard | Done | Path C |
| 2026-09-14 | First-selection UX | Done | mount flush + early checking |
| 2026-09-14 | Form overlay | Done | v1.3 |
| 2026-09-14 | Department prefill | Done | v1.4 |
| 2026-09-14 | Task closed | Done | Moved to specs/completed |
