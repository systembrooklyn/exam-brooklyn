/**
 * Laravel `date_format:H:i:s` expects times like "09:05:00".
 * `<input type="time">` without `step` often returns "09:05". Use `step="1"` for seconds.
 */

export function normalizeApiTime(t) {
  if (t == null) return null;
  let s = String(t).trim();
  if (!s) return null;

  // Drop fractional seconds: "12:30:00.000"
  if (s.includes(".")) {
    s = s.split(".")[0].trim();
  }

  // ISO fragment: 2026-03-22T11:30 or ...T11:30:00
  const tIdx = s.indexOf("T");
  if (tIdx !== -1) {
    s = s.slice(tIdx + 1);
  }

  const m24 = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (m24) {
    const h = Number(m24[1]);
    const min = Number(m24[2]);
    const sec = Number(m24[3] ?? 0);
    if (h >= 0 && h <= 23 && min >= 0 && min <= 59 && sec >= 0 && sec <= 59) {
      return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }
  }

  const m12 = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])$/);
  if (m12) {
    let h = Number(m12[1]);
    const min = Number(m12[2]);
    const sec = Number(m12[3] ?? 0);
    const period = m12[4].toLowerCase();
    if (h >= 1 && h <= 12 && min >= 0 && min <= 59 && sec >= 0 && sec <= 59) {
      if (period === "pm" && h !== 12) h += 12;
      if (period === "am" && h === 12) h = 0;
      return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }
  }

  return null;
}

/**
 * Ensures `from_time` / `to_time` on create-request payloads use H:i:s for the API.
 */
export function applyEmployeeRequestTimeFields(payload) {
  if (!payload || typeof payload !== "object") return payload;
  const out = { ...payload };
  if (Object.prototype.hasOwnProperty.call(out, "from_time")) {
    const raw = out.from_time;
    out.from_time =
      raw == null || String(raw).trim() === "" ? null : normalizeApiTime(raw);
  }
  if (Object.prototype.hasOwnProperty.call(out, "to_time")) {
    const raw = out.to_time;
    out.to_time =
      raw == null || String(raw).trim() === "" ? null : normalizeApiTime(raw);
  }
  return out;
}
