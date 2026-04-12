/**
 * Payroll month `YYYY-MM` → period from previous month 21st to selected month 20th.
 */
export function getPayrollDates(month) {
  if (!month) return { from_date: "", to_date: "" };

  const [year, mon] = month.split("-").map(Number);

  const fromYear = mon === 1 ? year - 1 : year;
  const fromMon = mon === 1 ? 12 : mon - 1;

  const fromDate = `${fromYear}-${String(fromMon).padStart(2, "0")}-21`;
  const toDate = `${year}-${String(mon).padStart(2, "0")}-20`;

  return { from_date: fromDate, to_date: toDate };
}

/** Default anchor: same as Payrolls / Attendance (21st previous calendar month → 20th current). */
export function defaultPayrollMonthRange() {
  const now = new Date();
  const defaultMonthAnchor = new Date(now.getFullYear(), now.getMonth() - 1, 21);
  const payrollMonth = `${defaultMonthAnchor.getFullYear()}-${String(defaultMonthAnchor.getMonth() + 1).padStart(2, "0")}`;
  return {
    payrollMonth,
    ...getPayrollDates(payrollMonth),
  };
}
