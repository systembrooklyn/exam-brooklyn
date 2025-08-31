export function useDateSort() {
  function normalizeDate(date, type) {
    if (!date) return null;

    // لو type = online نستعمل student_start
    const dateOnly = date.split(" ")[0];
    const d = new Date(dateOnly);

    // لو التاريخ invalid أو قبل سنة 2000 → null
    if (isNaN(d.getTime()) || d.getFullYear() < 2000) {
      return null;
    }

    return d;
  }

  function sortByDate(data, field, order = "asc") {
    return [...data].sort((a, b) => {
      // لو فيه type online ناخد student_start بدل start_date
      const valA = a.type === "online" ? a.student_start : a[field];
      const valB = b.type === "online" ? b.student_start : b[field];

      const dA = normalizeDate(valA);
      const dB = normalizeDate(valB);

      if (!dA && dB) return 1;
      if (dA && !dB) return -1;
      if (!dA && !dB) return 0;

      return order === "asc" ? dA - dB : dB - dA;
    });
  }

  return { sortByDate };
}
