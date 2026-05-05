/** Normalize API / UI study_type to `online` | `class` */
export function normalizeStudyType(v) {
  if (v == null || v === "") return "online";
  const s = String(v).toLowerCase();
  if (s === "online" || s === "class") return s;
  return "online";
}

/** Backend validation: "Online" | "Class" (same strings as list API) */
export function studyTypeForApi(v) {
  return normalizeStudyType(v) === "class" ? "Class" : "Online";
}

/** API "YYYY-MM-DD HH:mm:ss" ↔ `<input type="datetime-local">` */
export function toDatetimeLocal(apiStr) {
  if (apiStr == null || apiStr === "") return "";
  const s = String(apiStr).trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})[\sT](\d{2}:\d{2})(?::\d{2})?/);
  if (m) return `${m[1]}T${m[2]}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T00:00`;
  return s;
}

export function fromDatetimeLocal(localStr) {
  if (localStr == null || localStr === "") return null;
  const s = String(localStr);
  if (s.includes("T")) {
    const [d, t] = s.split("T");
    const time = (t || "00:00").slice(0, 5);
    return `${d} ${time}:00`;
  }
  return s;
}

function toApiCodeValue(v) {
  const raw = String(v ?? "").trim();
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : raw;
}

/**
 * Supports nested plan shape (group_*) and flat GET /courses/{id}/groups rows (code, name, type, …).
 */
function mapIncomingGroup(g) {
  const code = g.group_code ?? g.code ?? "";
  const name = g.group_name ?? g.name ?? "";
  const rawType = String(g.group_type ?? g.type ?? "online").toLowerCase();
  const group_type =
    rawType === "online" || rawType === "class" ? rawType : "online";
  const startRaw = g.group_start_date ?? g.start_date ?? "";
  const lec = g.group_total_lec ?? g.total_lec ?? 0;

  let group_is_active = true;
  if (g.group_is_active !== undefined) {
    group_is_active =
      g.group_is_active === 1 || g.group_is_active === true;
  } else if (g.is_active !== undefined) {
    group_is_active = g.is_active === 1 || g.is_active === true;
  }

  return {
    id: g.id ?? g.group_id,
    group_code: code,
    group_name: name,
    group_type,
    group_start_date: toDatetimeLocal(startRaw),
    group_total_lec: lec,
    group_is_active,
  };
}

/** Map one API group row → form row (used when loading /courses/{id}/groups) */
export function mapApiGroupToForm(g) {
  return mapIncomingGroup(g);
}

function mapIncomingCourse(c) {
  const groups = Array.isArray(c.groups) ? c.groups.map(mapIncomingGroup) : [];
  return {
    id: c.id ?? c.course_id,
    course_code: c.course_code ?? c.code ?? "",
    course_name: c.course_name ?? c.name ?? "",
    course_type: (c.course_type ?? "module").toLowerCase(),
    course_start_date: normalizeDateOnlyField(c.course_start_date ?? c.start_date),
    course_is_active:
      c.course_is_active !== false && c.course_is_active !== 0,
    groups,
  };
}

function normalizeDateOnlyField(v) {
  if (v == null || v === "") return "";
  const s = String(v);
  return s.split(" ")[0] ?? "";
}

/** Map GET plan API → form model */
export function mapPlanDetailToForm(detail) {
  const raw = detail.course_groups ?? detail.courses ?? [];
  const course_groups = Array.isArray(raw)
    ? raw.map(mapIncomingCourse)
    : [];
  return {
    id: detail.id,
    name: detail.name ?? "",
    study_type: normalizeStudyType(detail.study_type),
    course_groups,
  };
}

/** Shape course_groups for POST/PUT (full object, no id on root for create) */
export function buildScholarshipPlanPayload(form) {
  return {
    name: (form.name ?? "").trim(),
    study_type: studyTypeForApi(form.study_type),
    course_groups: (form.course_groups ?? []).map((c) => {
      const visibleGroups = (c.groups ?? []).filter((g) => !g?._deleted);
      const deletedGroupIds = (c.groups ?? [])
        .filter((g) => g?._deleted && g?.id != null)
        .map((g) => Number(g.id));

      return {
        id: c.id != null ? Number(c.id) : undefined,
        course_code: toApiCodeValue(c.course_code),
        course_name:
          (c.course_name ?? "").trim() ||
          (Number(c.course_code) ? `Course ${c.course_code}` : "Course"),
        course_type: (c.course_type ?? "module").toLowerCase(),
        course_start_date: c.course_start_date || null,
        course_is_active:
          c.course_is_active === undefined || c.course_is_active === null
            ? true
            : !!c.course_is_active,
        deleted_group_ids: deletedGroupIds,
        groups: visibleGroups.map((g) => ({
          id: g.id != null ? Number(g.id) : undefined,
          group_code: toApiCodeValue(g.group_code),
          group_name: (g.group_name ?? "").trim(),
          group_type: (g.group_type ?? "class").toLowerCase(),
          group_start_date: fromDatetimeLocal(g.group_start_date),
          group_total_lec: Number(g.group_total_lec) || 0,
          group_is_active:
            g.group_is_active !== false && g.group_is_active !== 0,
        })),
      };
    }),
  };
}

/** For DataTable: use API `courses` as-is; map `course_groups` → pseudo-courses when needed */
export function attachDisplayCourses(row) {
  if (Array.isArray(row.courses)) {
    return row;
  }
  const cg = row.course_groups;
  if (!Array.isArray(cg)) return { ...row, courses: [] };
  return {
    ...row,
    courses: cg.map((c) => ({
      name: c.course_name ?? c.name ?? "",
    })),
  };
}
