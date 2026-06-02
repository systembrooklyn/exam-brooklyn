import XLSX from "xlsx-js-style";
import { getPayrollDates } from "@/utils/payrollPeriod";

const EXPORT_HEADERS = [
  "Employee Name",
  "Fingerprint",
  "Payroll Month",
  "Period From",
  "Period To",
  "Fixed Salary",
  "Net Salary",
  "Status",
];

const PAYROLL_STATUS_LABELS = {
  pending: "Pending",
  "hr-approved": "HR Approved",
  "hr-manager-approved": "HR Manager Approved",
  "gm-approved": "GM Approved",
  "gm-approved-suspended": "GM Approved (Suspended)",
  suspend: "Suspended",
  suspended: "Suspended",
  rejected: "Rejected",
  paid: "Paid",
  received: "Received",
  no_payroll_calculated: "Missing Calculation",
};

const THIN_BORDER = {
  top: { style: "thin", color: { rgb: "D1D5DB" } },
  bottom: { style: "thin", color: { rgb: "D1D5DB" } },
  left: { style: "thin", color: { rgb: "D1D5DB" } },
  right: { style: "thin", color: { rgb: "D1D5DB" } },
};

const TITLE_STYLE = {
  font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
  fill: { patternType: "solid", fgColor: { rgb: "312E81" } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: THIN_BORDER,
};

const SUBTITLE_STYLE = {
  font: { sz: 10, color: { rgb: "3730A3" } },
  fill: { patternType: "solid", fgColor: { rgb: "EEF2FF" } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: THIN_BORDER,
};

const HEADER_STYLE = {
  font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
  fill: { patternType: "solid", fgColor: { rgb: "4F46E5" } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: THIN_BORDER,
};

const TOTAL_ROW_LABEL_STYLE = {
  font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
  fill: { patternType: "solid", fgColor: { rgb: "4338CA" } },
  alignment: { horizontal: "right", vertical: "center" },
  border: THIN_BORDER,
};

const TOTAL_ROW_VALUE_STYLE = {
  font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
  fill: { patternType: "solid", fgColor: { rgb: "4338CA" } },
  alignment: { horizontal: "right", vertical: "center" },
  border: THIN_BORDER,
};

function boundsFromPayrollMonthYm(ym) {
  if (!ym || !/^\d{4}-\d{2}$/.test(String(ym))) return { from: "", to: "" };
  const [year, mon] = String(ym).split("-").map(Number);
  const fromYear = mon === 1 ? year - 1 : year;
  const fromMon = mon === 1 ? 12 : mon - 1;
  const from = `${fromYear}-${String(fromMon).padStart(2, "0")}-21`;
  const to = `${year}-${String(mon).padStart(2, "0")}-20`;
  return { from, to };
}

function effectivePeriodBounds(item, filterPeriodFrom, filterPeriodTo) {
  let from = item.period_from || item.period?.from || item.period?.period_from;
  let to = item.period_to || item.period?.to || item.period?.period_to;
  const ym = item.period?.payroll_month;
  if ((!from || !to) && ym && /^\d{4}-\d{2}$/.test(String(ym))) {
    const b = boundsFromPayrollMonthYm(ym);
    from = from || b.from;
    to = to || b.to;
  }
  if ((!from || !to) && ym && /^\d{4}-\d{2}-\d{2}$/.test(String(ym))) {
    const { from_date, to_date } = getPayrollDates(String(ym).slice(0, 7));
    from = from || from_date;
    to = to || to_date;
  }
  if ((!from || !to) && filterPeriodFrom && filterPeriodTo) {
    from = from || filterPeriodFrom;
    to = to || filterPeriodTo;
  }
  return { from: from || "", to: to || "" };
}

function payrollMonthLabel(item, filterPeriodFrom, filterPeriodTo) {
  const { from, to } = effectivePeriodBounds(
    item,
    filterPeriodFrom,
    filterPeriodTo,
  );
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(String(to))) {
    const [y, m, d] = String(to).split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(String(from))) {
    const [y, m] = String(from).split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
  return "-";
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function rowEmployeeId(item) {
  const id = Number(item?.employee_id ?? item?.employee?.id);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function computePayrollRowNetSalary(item, manualAdjustmentNetByEmployee = {}) {
  const base = toNumber(item?.financials?.net_salary_due);
  const employeeId = rowEmployeeId(item);
  if (!employeeId) return base;
  const manual = toNumber(manualAdjustmentNetByEmployee?.[employeeId]);
  return base + manual;
}

function employeeDisplayName(item) {
  const emp = item?.employee;
  if (emp?.name) return emp.name;
  const pi = emp?.personal_info;
  if (pi) {
    const name = `${pi.first_name || ""} ${pi.last_name || ""}`.trim();
    if (name) return name;
  }
  const id = item?.employee_id ?? emp?.id;
  return id ? `Employee #${id}` : "-";
}

function statusLabel(status) {
  const key = String(status || "").toLowerCase();
  return PAYROLL_STATUS_LABELS[key] || status || "-";
}

export function buildPayrollExportRows(
  items,
  { manualAdjustmentNetByEmployee = {}, filterPeriodFrom = "", filterPeriodTo = "" } = {},
) {
  return (items || []).map((item) => {
    const { from, to } = effectivePeriodBounds(
      item,
      filterPeriodFrom,
      filterPeriodTo,
    );
    const fixed = item?.financials?.fixed_salary_paid;
    const net = computePayrollRowNetSalary(item, manualAdjustmentNetByEmployee);

    return {
      "Employee Name": employeeDisplayName(item),
      Fingerprint: item?.employee?.fingerprint ?? "",
      "Payroll Month": payrollMonthLabel(item, filterPeriodFrom, filterPeriodTo),
      "Period From": from,
      "Period To": to,
      "Fixed Salary": fixed === null || fixed === undefined || fixed === "" ? "" : toNumber(fixed),
      "Net Salary": Number.isFinite(net) ? Number(net.toFixed(2)) : "",
      Status: statusLabel(item.current_status || item.status),
    };
  });
}

function styleDataCell(cell, rowIndex, colIndex) {
  const isAlt = rowIndex % 2 === 1;
  const style = {
    font: { sz: 10, color: { rgb: "111827" } },
    fill: {
      patternType: "solid",
      fgColor: { rgb: isAlt ? "F9FAFB" : "FFFFFF" },
    },
    alignment: { vertical: "center", wrapText: true },
    border: THIN_BORDER,
  };

  if (colIndex === 5 || colIndex === 6) {
    style.alignment.horizontal = "right";
    if (typeof cell.v === "number") {
      cell.t = "n";
      cell.z = "#,##0.00";
    }
  } else if (colIndex === 0) {
    style.font.bold = true;
  } else {
    style.alignment.horizontal = "left";
  }

  cell.s = style;
}

function applySheetStyles(ws, { hasSubtitle, headerRow, dataStartRow, totalRowIndex = -1 }) {
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  const colCount = EXPORT_HEADERS.length;
  const lastCol = colCount - 1;

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
  ];
  if (hasSubtitle) {
    ws["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } });
  }
  if (totalRowIndex >= 0) {
    ws["!merges"].push({
      s: { r: totalRowIndex, c: 0 },
      e: { r: totalRowIndex, c: 4 },
    });
  }

  for (let R = range.s.r; R <= range.e.r; R += 1) {
    for (let C = 0; C < colCount; C += 1) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { t: "s", v: "" };

      if (R === 0) {
        ws[addr].s = TITLE_STYLE;
      } else if (hasSubtitle && R === 1) {
        ws[addr].s = SUBTITLE_STYLE;
      } else if (R === headerRow) {
        ws[addr].s = HEADER_STYLE;
      } else if (R === totalRowIndex) {
        if (C === 5) ws[addr].s = TOTAL_ROW_LABEL_STYLE;
        else if (C === 6) {
          if (typeof ws[addr].v === "number") {
            ws[addr].t = "n";
            ws[addr].z = "#,##0.00";
          }
          ws[addr].s = TOTAL_ROW_VALUE_STYLE;
        } else if (C <= 4) {
          ws[addr].s = TOTAL_ROW_LABEL_STYLE;
        } else {
          ws[addr].s = TOTAL_ROW_LABEL_STYLE;
        }
      } else if (R >= dataStartRow && R !== totalRowIndex) {
        const dataRowIndex =
          R - dataStartRow - (totalRowIndex > R && totalRowIndex >= 0 ? 0 : 0);
        const spacerBeforeTotal =
          totalRowIndex >= 0 && R > totalRowIndex ? true : false;
        if (spacerBeforeTotal) continue;
        const adjustedIndex =
          totalRowIndex >= 0 && R > totalRowIndex
            ? R - dataStartRow - 1
            : totalRowIndex >= 0 && R > dataStartRow && R < totalRowIndex
              ? R - dataStartRow
              : R - dataStartRow;
        if (totalRowIndex >= 0 && R === totalRowIndex - 1) {
          continue;
        }
        styleDataCell(ws[addr], adjustedIndex, C);
      }
    }
  }

  ws["!cols"] = [
    { wch: 30 },
    { wch: 14 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 },
  ];

  ws["!rows"] = [];
  for (let R = 0; R <= range.e.r; R += 1) {
    if (R === 0) ws["!rows"][R] = { hpt: 34 };
    else if (hasSubtitle && R === 1) ws["!rows"][R] = { hpt: 40 };
    else if (R === headerRow) ws["!rows"][R] = { hpt: 24 };
    else ws["!rows"][R] = { hpt: 20 };
  }

  const freezeRow = dataStartRow;
  ws["!views"] = [
    {
      state: "frozen",
      ySplit: freezeRow,
      topLeftCell: XLSX.utils.encode_cell({ r: freezeRow, c: 0 }),
      activeCell: XLSX.utils.encode_cell({ r: freezeRow, c: 0 }),
    },
  ];
}

export function exportPayrollsExcel(items, options = {}) {
  const dataRows = buildPayrollExportRows(items, options);
  if (!dataRows.length) return false;

  const reportTitle = options.reportTitle || "Payroll Management Report";
  const reportSubtitle = String(options.reportSubtitle || "").trim();
  const hasSubtitle = Boolean(reportSubtitle);
  const headerRow = hasSubtitle ? 2 : 1;
  const dataStartRow = headerRow + 1;

  const sheetRows = [[reportTitle]];
  if (hasSubtitle) sheetRows.push([reportSubtitle]);
  sheetRows.push([...EXPORT_HEADERS]);
  for (const row of dataRows) {
    sheetRows.push(EXPORT_HEADERS.map((key) => row[key] ?? ""));
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetRows);
  applySheetStyles(ws, { hasSubtitle, headerRow, dataStartRow });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Payrolls");
  XLSX.writeFile(wb, options.fileName || "payrolls.xlsx");
  return true;
}
