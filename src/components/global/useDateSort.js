export function useDateSort() {
  function normalizeDate(date) {
    if (!date) return null;
    const invalidDates = ["1970-01-01", "1970", "01/01/1970"];
    if (invalidDates.includes(date.split(" ")[0])) {
      return null;
    }
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }

  function sortByDate(data, field, order = "asc") {
    return [...data].sort((a, b) => {
      const dA = normalizeDate(a[field]);
      const dB = normalizeDate(b[field]);

      if (!dA && dB) return 1;
      if (dA && !dB) return -1;
      if (!dA && !dB) return 0;

      return order === "asc" ? dA - dB : dB - dA;
    });
  }

  return { sortByDate };
}
