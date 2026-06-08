/**
 * Canonical slugs for employee request `request_type` sent to / returned from payroll API.
 */

import {
  contractTypeSlugFromEmployeeRequestRow,
  parsedDurationMinutesFromRequestRow,
} from "@/utils/hrEmployeeRequestDuration";

/**
 * Normalize type string from forms or API (trim, strip BOM).
 */
export function normalizeRequestTypeSlug(raw) {
  if (raw == null) return "";
  return String(raw)
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

export function isShiftOvertimeRequestTypeSlug(raw) {
  const t = normalizeRequestTypeSlug(raw);
  return t === "overtime_before" || t === "overtime_after";
}

/** Total + segment overtime: API expects only `day` (server derives minutes). */
export function isDayOnlyOvertimeRequestTypeSlug(raw) {
  const t = normalizeRequestTypeSlug(raw);
  return t === "overtime" || t === "overtime_before" || t === "overtime_after";
}

const KNOWN_REQUEST_TYPE_SLUGS = new Set([
  "lateness",
  "leave",
  "overtime",
  "overtime_before",
  "overtime_after",
  "vacation",
  "day_off_swap",
  "work_from_home",
  "double_paid",
  "shift_move",
  "absence",
]);

/** Prefer the first candidate that is a known API slug (avoids using Laravel morph `type` strings). */
function coalesceRequestTypeSlug(...candidates) {
  for (const raw of candidates) {
    const s = normalizeRequestTypeSlug(raw);
    if (s && KNOWN_REQUEST_TYPE_SLUGS.has(s)) return s;
  }
  for (const raw of candidates) {
    const s = normalizeRequestTypeSlug(raw);
    if (s) return s;
  }
  return "";
}

/**
 * Map list/detail row so `request_type` is always set when API uses `type` or camelCase.
 * When both `type` and `request_type` exist, the known slug wins (fixes wrong duplicate fields).
 */
export function mapEmployeeRequestRowFromApi(item) {
  const row = item?.data ? { ...item.data } : { ...(item || {}) };
  const n = coalesceRequestTypeSlug(
    row.type,
    row.request_type,
    row.requestType,
    row.request_type_slug,
  );
  if (n) row.request_type = n;
  const ct = contractTypeSlugFromEmployeeRequestRow(row);
  if (ct) row.contract_type = ct;
  const dm = parsedDurationMinutesFromRequestRow(row);
  if (dm != null) row.duration_minutes = dm;
  return row;
}

/**
 * Build POST/PUT body so overtime requests never carry extra keys (avoids backend mis-reading).
 */
export function buildEmployeeRequestApiPayload(payload) {
  if (!payload || typeof payload !== "object") return payload;
  const rt = normalizeRequestTypeSlug(payload.request_type);
  if (isDayOnlyOvertimeRequestTypeSlug(rt)) {
    const body = { request_type: rt };
    if (payload.day !== undefined) {
      body.day = payload.day;
    }
    if (payload.from_time !== undefined) {
      body.from_time = payload.from_time;
    }
    if (payload.to_time !== undefined) {
      body.to_time = payload.to_time;
    }
    const eid = payload.employee_id;
    if (eid != null && eid !== "") {
      const n = Number(eid);
      if (Number.isFinite(n)) body.employee_id = n;
    }
    if (payload.status != null && String(payload.status).trim() !== "") {
      body.status = String(payload.status).trim().toLowerCase();
    }
    return body;
  }
  if (rt === "absence" || rt === "work_from_home" || rt === "double_paid") {
    const body = { request_type: rt };
    if (payload.day !== undefined) {
      body.day = payload.day;
    }
    const eid = payload.employee_id;
    if (eid != null && eid !== "") {
      const n = Number(eid);
      if (Number.isFinite(n)) body.employee_id = n;
    }
    if (payload.status != null && String(payload.status).trim() !== "") {
      body.status = String(payload.status).trim().toLowerCase();
    }
    return body;
  }
  return { ...payload };
}
