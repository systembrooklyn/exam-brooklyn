/**
 * Active payroll contract `type` for an employee (`new`, `old`, …).
 * If multiple active rows exist, the last one in the list wins (same as payroll UI).
 */
export function activeContractTypeForEmployee(contracts, employeeId) {
  const id = Number(employeeId);
  if (!Number.isFinite(id) || id <= 0) return "";
  let type = "";
  for (const c of contracts || []) {
    const active = c.is_active === 1 || c.is_active === true;
    if (!active) continue;
    const eid = Number(c.employee?.id ?? c.employee_id);
    if (eid !== id) continue;
    if (c.type != null && String(c.type).trim() !== "") {
      type = String(c.type).trim().toLowerCase();
    }
  }
  return type;
}

/** Old payroll contracts: skip new-contract lateness UI rules (grace, warning hour, adjusted-hours messaging). */
export function contractExemptsNewLatenessAttendanceRules(contractType) {
  return (
    String(contractType || "")
      .trim()
      .toLowerCase() === "old"
  );
}

/**
 * Fingerprint on `User`, nested `employee`, or request row embeds (`fingerPrint` from Laravel user JSON).
 */
export function payrollEmployeeFingerprintSlug(person) {
  if (!person || typeof person !== "object") return "";
  const fp =
    person.fingerprint ??
    person.fingerPrint ??
    person.Fingerprint ??
    person.FINGERPRINT ??
    person.personal_info?.fingerprint ??
    person.fingerprint_no ??
    person.fingerprint_number;
  const s = String(fp ?? "").trim();
  return s;
}

/** Fingerprints from `GET /api/user` (root + nested employee + payroll_employee). */
export function fingerprintSlugsFromLoggedInPayrollAuthUser(authUser) {
  if (!authUser || typeof authUser !== "object") return [];
  const set = new Set();
  for (const o of [
    authUser,
    authUser.employee ?? authUser.Employee,
    authUser.payroll_employee,
  ]) {
    const s = payrollEmployeeFingerprintSlug(o);
    if (s) set.add(s);
  }
  return [...set];
}

function payrollContractTypeNorm(raw) {
  return String(raw ?? "").trim().toLowerCase();
}

/**
 * `employee.contracts[]` from `/api/user` — rows often omit `is_active`; treat as eligible unless explicitly off.
 */
export function contractSlugFromPayrollEmbeddedContractsList(list) {
  if (!Array.isArray(list) || list.length === 0) return "";
  let eligibleLast = "";
  for (const c of list) {
    if (!c || typeof c !== "object") continue;
    const explicitOff =
      c.is_active === 0 ||
      c.is_active === false ||
      String(c.is_active ?? "").trim() === "0";
    if (explicitOff) continue;
    const t = payrollContractTypeNorm(
      c.type ?? c.contract_type ?? c.contractType,
    );
    if (t) eligibleLast = t;
  }
  if (eligibleLast) return eligibleLast;
  let fallback = "";
  for (const c of list) {
    if (!c || typeof c !== "object") continue;
    const t = payrollContractTypeNorm(
      c.type ?? c.contract_type ?? c.contractType,
    );
    if (t) fallback = t;
  }
  return fallback;
}

/**
 * Contract slug from an `employee` object (`GET /api/user` → `User.employee`).
 */
export function contractTypeSlugFromAuthEmployee(employee) {
  if (!employee || typeof employee !== "object") return "";
  const direct = payrollContractTypeNorm(
    employee.contract_type ?? employee.contractType,
  );
  if (direct) return direct;
  const list = employee.contracts ?? employee.Contracts;
  return contractSlugFromPayrollEmbeddedContractsList(
    Array.isArray(list) ? list : [],
  );
}

/**
 * Full `GET /api/user` resolution (no `view-contract` list required).
 */
export function contractTypeSlugFromLoggedInPayrollAuthUser(authUser) {
  if (!authUser || typeof authUser !== "object") return "";
  const fromEmp = contractTypeSlugFromAuthEmployee(
    authUser.employee ?? authUser.Employee,
  );
  if (fromEmp) return fromEmp;
  const fromPay = contractTypeSlugFromAuthEmployee(authUser.payroll_employee);
  if (fromPay) return fromPay;
  const top = authUser.contracts ?? authUser.Contracts;
  return contractSlugFromPayrollEmbeddedContractsList(
    Array.isArray(top) ? top : [],
  );
}

/**
 * Contract from an employee-request row (`/me`, pending). Then fall back to auth / contracts store in the view.
 */
export function contractTypeSlugFromEmployeeRequestRow(row) {
  if (!row || typeof row !== "object") return "";
  const top = payrollContractTypeNorm(
    row.contract_type ?? row.contractType,
  );
  if (top) return top;
  const emp = row.employee ?? row.Employee;
  if (emp && typeof emp === "object") {
    const fromEmp = contractTypeSlugFromAuthEmployee(emp);
    if (fromEmp) return fromEmp;
  }
  return "";
}

/**
 * Payroll create/update: `old` → `{ duration_minutes }`; else `{ duration_hours }` (ceil min/60).
 */
export function latenessLeaveDurationApiFieldsFromMinutes(minsRaw, contractType) {
  const mins = Math.round(Number(minsRaw));
  if (!Number.isFinite(mins) || mins <= 0) return null;
  if (contractExemptsNewLatenessAttendanceRules(contractType)) {
    return { duration_minutes: mins };
  }
  const h = apiDurationHoursForLatenessLeaveFromMinutes(minsRaw, contractType);
  if (h == null) return null;
  return { duration_hours: h };
}

/**
 * Lateness/leave: `old` contracts send the exact minute count in `duration_hours`.
 * All other contract types use whole hours via ceil(min/60).
 */
export function apiDurationHoursForLatenessLeaveFromMinutes(
  minsRaw,
  contractType,
) {
  const t = String(contractType || "")
    .trim()
    .toLowerCase();
  if (t === "old") {
    const mins = Math.round(Number(minsRaw));
    if (!Number.isFinite(mins) || mins <= 0) return null;
    return mins;
  }
  return apiDurationHoursFromMinutes(minsRaw);
}

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

/**
 * Minutes returned by API on employee-request rows (lateness/leave).
 */
export function parsedDurationMinutesFromRequestRow(row) {
  if (!row || typeof row !== "object") return null;
  const chain = [
    row.duration_minutes,
    row.durationMinutes,
    row.duration_minute,
    row.duration_mins,
    row.duration_in_minutes,
    row.durationInMinutes,
  ];
  const rt = String(row.request_type ?? "").trim().toLowerCase();
  if (rt === "lateness") {
    chain.push(row.lateness_minutes, row.latenessMinutes);
  }
  if (rt === "leave") {
    chain.push(row.leave_minutes, row.leaveMinutes);
  }
  for (const raw of chain) {
    if (raw == null || raw === "") continue;
    const n = Math.round(Number(raw));
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}
