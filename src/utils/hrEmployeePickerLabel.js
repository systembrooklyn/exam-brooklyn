/**
 * Display name for payroll/HR employee rows (same rules as Requests.vue `employeePickerLabel`).
 */
export function hrEmployeeDisplayName(emp) {
  if (!emp) return "";
  const pi = emp.personal_info || {};
  return (
    [pi.first_name, pi.last_name].filter(Boolean).join(" ").trim() ||
    (emp.name ? String(emp.name).trim() : "") ||
    `Employee #${emp.id}`
  );
}
