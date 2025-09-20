export function useDateSort() {
  function normalizeDate(date, type) {
    if (!date) return null;

    const dateOnly = date.split(" ")[0];
    const d = new Date(dateOnly);


    if (isNaN(d.getTime()) || d.getFullYear() < 2000) {
      return null;
    }

    return d;
  }

  function sortByDate(data, field, order = "asc") {
    return [...data].sort((a, b) => {
      
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
