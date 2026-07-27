/**
 * Payroll month or date:
 * - If `YYYY-MM-DD` (e.g. `2026-07-09`):
 *     `to_date` = `2026-07-09`
 *     `from_date` = 1 month before + 1 day = `2026-06-10`
 * - If `YYYY-MM` (e.g. `2026-07`):
 *     `to_date` = `2026-07-20`
 *     `from_date` = `2026-06-21`
 */
export function getPayrollDates(monthOrDate) {
  if (!monthOrDate) return { from_date: "", to_date: "" };

  const str = String(monthOrDate).trim();

  // Full date YYYY-MM-DD (e.g., "2026-07-09")
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split("-").map(Number);
    const toDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const prevYear = m === 1 ? y - 1 : y;
    const prevMon = m === 1 ? 12 : m - 1;

    const dt = new Date(prevYear, prevMon - 1, d + 1);
    const fy = dt.getFullYear();
    const fm = dt.getMonth() + 1;
    const fd = dt.getDate();
    const fromDate = `${fy}-${String(fm).padStart(2, "0")}-${String(fd).padStart(2, "0")}`;

    return { from_date: fromDate, to_date: toDate };
  }

  // Month YYYY-MM (e.g., "2026-07")
  if (/^\d{4}-\d{2}$/.test(str)) {
    const [year, mon] = str.split("-").map(Number);
    const fromYear = mon === 1 ? year - 1 : year;
    const fromMon = mon === 1 ? 12 : mon - 1;

    const fromDate = `${fromYear}-${String(fromMon).padStart(2, "0")}-21`;
    const toDate = `${year}-${String(mon).padStart(2, "0")}-20`;

    return { from_date: fromDate, to_date: toDate };
  }

  return { from_date: "", to_date: "" };
}

/** Default anchor: same as Payrolls / Attendance (21st previous calendar month → 20th current). */
export function defaultPayrollMonthRange() {
  const now = new Date();
  const defaultMonthAnchor = new Date(now.getFullYear(), now.getMonth(), 21);
  const payrollMonth = `${defaultMonthAnchor.getFullYear()}-${String(defaultMonthAnchor.getMonth() + 1).padStart(2, "0")}`;
  return {
    payrollMonth,
    ...getPayrollDates(payrollMonth),
  };
}

