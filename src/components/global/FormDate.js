export default function formatDate(dateStr) {
  if (!dateStr) return "-";

  const dateOnly = dateStr.split(" ")[0];
  const d = new Date(dateOnly);

  if (isNaN(d.getTime()) || d.getFullYear() < 2000) {
    return "-";
  }

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}
