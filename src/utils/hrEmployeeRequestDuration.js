/**
 * API expects `duration_hours` as a whole number. Minutes are converted by
 * rounding up any partial hour (e.g. 68 → 2, 61 → 2, 60 → 1).
 */
export function apiDurationHoursFromMinutes(minsRaw) {
  const mins = Math.round(Number(minsRaw));
  if (!Number.isFinite(mins) || mins <= 0) return null;
  return Math.ceil(mins / 60);
}

/** Whole hours from the "Duration (Hours)" field (matches Requests.vue). */
export function apiDurationHoursFromHoursInput(hoursRaw) {
  const n = parseInt(String(hoursRaw).trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
