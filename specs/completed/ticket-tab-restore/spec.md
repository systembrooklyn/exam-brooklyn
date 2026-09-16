# Specification: Ticket List Tab & Filter Restore

**Task ID:** ticket-tab-restore  
**Created:** 2026-09-16  
**Status:** Completed  
**Completed:** 2026-09-16  
**Version:** 1.0

## 1. Problem Statement

- **The Problem:** When a user opens a ticket from the Tickets list and returns to the list, the UI resets to the **Open** tab with default (empty) filters. Work done filtering Closed / Tasks / Insights is lost on every detail visit.
- **Current Situation:** `activeTab` and filter objects live only in local component state on `TicketsList.vue`. Detail back links hardcode `/tickets`. The list remounts on return (no keep-alive), so state always re-initializes to Open.
- **Desired Outcome:** Returning from ticket detail (breadcrumb, explicit back link, or browser Back when URL is preserved) restores the same tab and the same filters the user had before opening the ticket.

## 2. User Personas

### Primary User: Ticket Handler

- **Who:** Staff who triage and resolve support tickets (Open / Closed), and optionally Tasks / Insights when permitted.
- **Goals:** Move through many tickets quickly without re-selecting tab and filters each time.
- **Pain points:** After reviewing one ticket, they land on Open again and must re-apply Closed + type/date/unread filters.

### Secondary User: Insights / Tasks Viewer

- **Who:** Users with `view-others-tickets` and/or `view-task-tickets`.
- **Goals:** Stay in Insights or Tasks while drilling into individual tickets.
- **Pain points:** Same reset; Insights date/type filters are especially painful to re-enter.

## 3. Functional Requirements

### FR-1: Restore Active Tab on Return

**Description:** The Tickets list remembers which tab was active (Open, Closed, Tasks, Insights) when the user navigates to a ticket and restores that tab when they return to the list.

**User Story:**
> As a ticket handler, I want to return to the same Tickets tab I was on after viewing a ticket so that I can continue working without re-selecting Open/Closed/Tasks/Insights.

**Acceptance Criteria:**
- [ ] Given I am on the Closed tab, when I open a ticket and navigate back to the list, then Closed is active and closed tickets are shown.
- [ ] Given I am on Open / Tasks / Insights (and permitted), when I open a ticket and return, then that same tab is active.
- [ ] Given I return via the detail breadcrumb or “Back to all tickets” link, then the restored tab matches the tab I left from.
- [ ] Given I use browser Back and the list URL still carries the prior tab state, then the correct tab is shown.

**Priority:** Must Have

### FR-2: Restore Filters on Return

**Description:** List and Insights filter values are restored together with the tab when returning from ticket detail.

**User Story:**
> As a ticket handler, I want my filters (type, category, date range, unread-only) restored when I come back from a ticket so that I do not re-apply the same filters repeatedly.

**Acceptance Criteria:**
- [ ] Given Open/Closed/Tasks filters are set (`type`, `category`, `start_date`, `end_date`, `unread_only`), when I open a ticket and return, then those filter values are restored and the visible list matches them.
- [ ] Given Insights filters are set (`type`, `category`, `start_date`, `end_date`), when I open a ticket from Insights and return, then Insights remains active and those filters are restored (insights data refetch uses restored values).
- [ ] Given no filters were set, when I return, then filters remain at defaults (empty / unread off) and the correct tab is still restored.
- [ ] Filter UI controls reflect the restored values (dropdowns, date inputs, unread toggle).

**Priority:** Must Have

### FR-3: Persist Tab & Filters in the List URL

**Description:** Tab and filter state for the list route are represented in a durable, remount-safe way (URL query on `/tickets`), so refresh and remount do not lose state, and detail navigation can carry or return to that state.

**User Story:**
> As a ticket handler, I want the list URL to reflect my tab and filters so that refresh and returning from detail keep my view stable.

**Acceptance Criteria:**
- [ ] Changing tab updates the list route query (e.g. `tab=closed`) without a full page reload (`replace` preferred to avoid polluting history on every tab click).
- [ ] Changing relevant filters updates the list route query accordingly.
- [ ] Loading `/tickets` with valid query params initializes `activeTab` and filters from those params before/as data is fetched.
- [ ] Opening a ticket preserves enough context that returning to `/tickets` can restore tab + filters (either by keeping list query in history, passing query into detail and back, or both).
- [ ] Default Open with empty filters may omit redundant query keys (clean URL) or use explicit defaults; behavior must be consistent and documented in the plan.

**Priority:** Must Have

### FR-4: Unauthorized or Invalid Tab Fallback

**Description:** Deep links or restored state that request Tasks or Insights without permission, or an unknown tab value, fall back to Open safely.

**User Story:**
> As a user without Tasks/Insights permission, I want an invalid or forbidden tab request to open the Open tab so that I am not stuck on an empty or broken view.

**Acceptance Criteria:**
- [ ] Given `tab=tasks` and the user lacks `view-task-tickets`, when the list loads, then the active tab is Open and the URL is corrected to a valid state.
- [ ] Given `tab=insights` and the user lacks `view-others-tickets`, when the list loads, then the active tab is Open and the URL is corrected.
- [ ] Given an unknown `tab` value, when the list loads, then the active tab is Open.
- [ ] Invalid filter query values are ignored or coerced to defaults without crashing the page.

**Priority:** Must Have

## 4. Non-Functional Requirements

- **Performance:** Restoring state must not add more than one extra list/insights fetch beyond what a normal tab visit already does; prefer applying filters then fetching once.
- **Security:** Tab gating remains permission-based (`view-task-tickets`, `view-others-tickets`); query params must not bypass authorization UI or data access.
- **Accessibility:** Tab and filter controls remain keyboard-accessible; restored state is reflected in visible selected tab styles and control values.
- **UX:** Tab switches and filter updates should use `router.replace` (or equivalent) so users are not forced through a long chain of intermediate tab states when pressing browser Back from detail.
- **Compatibility:** Works with existing Pinia ticket caches; no requirement to change backend APIs.

## 5. Out of Scope

- ❌ Persisting scroll position or which ticket row was focused — not requested; can be a later enhancement.
- ❌ Server-side / cross-device UI preferences — overkill for this session/navigation problem.
- ❌ Changing ticket create/edit APIs or ticket payload schemas.
- ❌ Restoring filters on return from **New Ticket** success unless it already navigates with the same list query (nice-to-have only; not required for v1).
- ❌ Global redesign of the Filters UI.

## 6. Edge Cases & Error Handling

| Scenario | Expected Behavior |
|----------|-------------------|
| Browser Back from detail to `/tickets?tab=...` | List remounts with tab + filters from query |
| Breadcrumb / “Back to all tickets” from detail | Navigates to `/tickets` with restored tab + filters (not bare `/tickets` unless defaults) |
| User lacks permission for Tasks/Insights in query | Fall back to Open; normalize URL |
| Unknown `tab` or malformed dates in query | Fall back to Open / ignore bad filter keys; page loads |
| Switch tab after filters were set | New tab becomes active; filters for that context apply per current product rules; URL updates |
| Refresh on `/tickets` with query | Same tab + filters after reload |
| Direct visit to `/tickets` with no query | Open tab, default filters (current default behavior) |
| Open ticket then use in-app link to bare `/tickets` | Lands on defaults (Open); intentional navigation wins |

| Error | User Message | System Action |
|-------|--------------|---------------|
| Forbidden tab in query | None required (silent fallback) | Switch to Open; replace URL to valid state |
| Malformed filter param | None required | Ignore param; keep other valid params |

## 7. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Tab restore after detail | 100% for Open/Closed/Tasks/Insights when permitted | Manual QA checklist |
| Filter restore after detail | 100% for type, category, dates, unread_only (and insights equivalents) | Manual QA checklist |
| Permission-safe deep links | Forbidden tabs never stay selected | Manual QA with restricted user |
| No extra API churn | ≤1 fetch on restore path vs normal tab open | Network tab during QA |

## 8. Open Questions

- [x] Restore filters as well as tab? → **Yes**
- [x] Unauthorized tab deep-link behavior? → **Fall back to Open**
- [ ] Exact query key names (`tab`, `type`, `start_date`, etc.) — to be fixed in `/plan` (prefer matching existing filter field names).
- [ ] Whether detail route should carry `fromTab`/filter query or rely only on browser history + list URL — decide in `/plan`.

## 9. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-16 | Initial specification |

## Next Steps

1. ~~Review spec with stakeholders~~
2. ~~Run `/plan ticket-tab-restore`~~
3. ~~Implement and verify~~
4. Task archived under `specs/completed/ticket-tab-restore/`

*Specification completed with SDD 6.0*
