import { defineStore } from "pinia";
import { ref, computed } from "vue";
import Cookies from "js-cookie";
import { useRouter } from "vue-router";
import notyf from "@/components/global/notyf";
import apiClient from "../api/axiosInstance";
import {
  FORGOT_PASSWORD,
  LOGIN,
  RESET_PASSWORD,
  USER_BY_TOKEN,
} from "../api/Api";
import { handleError } from "./handleError";
import { HR_PERMISSION } from "@/constants/hrPermissions";
import { clearClientCachesOnLogout } from "@/utils/clearClientCachesOnLogout";

/** Max times we follow `role.role` nesting (e.g. Laravel pivot + nested role). */
const MAX_ADMIN_ROLE_NEST_DEPTH = 2;

function adminLabelMatches(raw) {
  if (raw == null) return false;
  const n = String(raw).toLowerCase().trim();
  if (!n) return false;
  return (
    n === "admin" ||
    n === "administrator" ||
    n.includes("super admin") ||
    n.includes("super-admin") ||
    n === "superadmin"
  );
}

function roleLabelFromShape(role) {
  if (role == null) return "";
  if (typeof role === "string") return role;
  if (typeof role !== "object") return "";
  return role.name ?? role.slug ?? role.role_name ?? role.title ?? "";
}

/**
 * Role object or string from API — tune names if your backend differs.
 * Supports nested `{ role: { name: "admin" } }` (common with user–role pivots).
 */
function roleLooksAdmin(role, depth = 0) {
  if (role == null || depth > MAX_ADMIN_ROLE_NEST_DEPTH) return false;
  const label = roleLabelFromShape(role);
  if (adminLabelMatches(label)) return true;
  if (typeof role === "object" && role.role != null) {
    return roleLooksAdmin(role.role, depth + 1);
  }
  return false;
}

/** Role name/slug "HR" (API may send `{ id, name: "HR" }` on `user.roles`). */
function roleLooksHr(role, depth = 0) {
  if (role == null || depth > MAX_ADMIN_ROLE_NEST_DEPTH) return false;
  const label = roleLabelFromShape(role);
  if (String(label).trim().toLowerCase() === "hr") return true;
  if (typeof role === "object" && role.role != null) {
    return roleLooksHr(role.role, depth + 1);
  }
  return false;
}

/** API may return permission slugs as strings or as `{ name }` objects. */
function permissionSlugFromEntry(entry) {
  if (entry == null) return null;
  if (typeof entry === "string") {
    const s = entry.trim();
    return s || null;
  }
  if (typeof entry === "object") {
    const raw =
      entry.name ?? entry.slug ?? entry.permission ?? entry.permission_name;
    if (raw == null) return null;
    const s = String(raw).trim();
    return s || null;
  }
  return null;
}

function collectPermissionSlugsFromArray(arr) {
  const out = [];
  if (!Array.isArray(arr)) return out;
  for (const entry of arr) {
    const slug = permissionSlugFromEntry(entry);
    if (slug) out.push(slug);
  }
  return out;
}

function collectPermissionSlugsFromRoles(roles) {
  if (!Array.isArray(roles)) return [];
  const set = new Set();
  for (const role of roles) {
    const perms = role?.permissions;
    if (!Array.isArray(perms)) continue;
    for (const slug of collectPermissionSlugsFromArray(perms)) {
      set.add(slug);
    }
  }
  return [...set];
}

/**
 * Normalize `GET user` body: root vs `data`, string vs object permission rows,
 * and merge role-attached permissions when the root list is missing or partial.
 */
function extractUserAndPermissionsFromResponseBody(body) {
  if (!body || typeof body !== "object") {
    return { user: null, permissions: [] };
  }
  const userRecord =
    body.User ?? body.user ?? body.data?.User ?? body.data?.user ?? null;

  const merged = new Set([
    ...collectPermissionSlugsFromArray(body.permissions),
    ...collectPermissionSlugsFromArray(body.data?.permissions),
    ...collectPermissionSlugsFromRoles(userRecord?.roles),
  ]);

  return { user: userRecord, permissions: [...merged] };
}

export const useAuthStore = defineStore("authStore", () => {
  const token = ref(null);
  const user = ref(null);
  const permissions = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const forgotSuccess = ref("");
  const router = useRouter();

  const restoreTokenFromCookies = () => {
    const savedToken = Cookies.get("token");
    if (savedToken) {
      token.value = savedToken;
    }
  };

  const clearSession = () => {
    token.value = null;
    user.value = null;
    permissions.value = [];
    Cookies.remove("token");
  };

  const forceLogout = ({
    message = "Session expired. Please log in again.",
  } = {}) => {
    clearSession();

    if (message) {
      notyf.error(message);
    }

    router.push({ name: "login" });
  };

  const getUserByToken = async () => {
    if (!token.value) return;
    try {
      const response = await apiClient.get(USER_BY_TOKEN, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      const { user: u, permissions: perms } =
        extractUserAndPermissionsFromResponseBody(response.data);
      user.value = u;
      permissions.value = perms;
    } catch (err) {
      forceLogout({ message: null });
    }
  };

  const login = async (email, password) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.post(LOGIN, { email, password });
      token.value = response.data.token;

      Cookies.set("token", token.value, { expires: 7, path: "/" });

      await getUserByToken();

      notyf.success("Logged in successfully");
      router.push("/systems");
    } catch (err) {
      handleError(err);
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    try {
      await apiClient.post("logout");
      notyf.success("Logged out successfully");
    } catch (err) {
      handleError(err);
    } finally {
      loading.value = false;
      clearSession();
      clearClientCachesOnLogout();

      // Full navigation resets in-memory Pinia state so no stale HR/SRM/etc. data remains.
      window.location.assign(router.resolve({ name: "login" }).href);
    }
  };

  // ✅ Forgot password
  const forgotPassword = async (email) => {
    forgotSuccess.value = null;
    loading.value = true;
    try {
      const response = await apiClient.post(FORGOT_PASSWORD, { email });
      notyf.success(response.data.message);
      forgotSuccess.value = response.data.message;
    } catch (err) {
      handleError(err);
      forgotSuccess.value = null;
    } finally {
      loading.value = false;
    }
  };

  // ✅ Reset password
  const resetPassword = async (form) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.post(RESET_PASSWORD, form, {
        headers: { "Content-Type": "application/json" },
      });

      notyf.success("Password reset successfully");
      router.push({ name: "login" });
    } catch (err) {
      handleError(err);
    } finally {
      loading.value = false;
    }
  };

  const hasPermission = (permissionName) => {
    return permissions.value.includes(permissionName);
  };

  /**
   * True when the logged-in user is treated as admin (no extra permission string required).
   * Uses: is_admin / isAdmin, roles[], or role from `GET user` payload.
   */
  const isAdminUser = computed(() => {
    const u = user.value;
    if (!u) return false;
    if (u.is_admin === true || u.is_admin === 1 || u.isAdmin === true)
      return true;
    if (u.is_superuser === true || u.is_superuser === 1) return true;
    if (u.super_admin === true || u.super_admin === 1) return true;
    const userType = String(u.user_type ?? u.type ?? "")
      .toLowerCase()
      .trim();
    if (userType === "admin" || userType === "administrator") return true;
    if (Array.isArray(u.roles) && u.roles.some(roleLooksAdmin)) return true;
    if (roleLooksAdmin(u.role)) return true;
    if (Array.isArray(u.role) && u.role.some(roleLooksAdmin)) return true;
    // Legacy accounts: API omits role flags but name/username matches admin pattern
    if (roleLooksAdmin(u.name) || roleLooksAdmin(u.username)) return true;
    return false;
  });

  /** Admin or explicit permission slug (same idea as `hasPermission`, with admin bypass). */
  const can = (permissionName) => {
    if (isAdminUser.value) return true;
    return hasPermission(permissionName);
  };

  /**
   * Payroll API may require explicit `employee_id` for users with an HR role/permission,
   * even when filing for themselves (token alone is not enough on some backends).
   */
  const hasHrRoleOrHrPermission = computed(() => {
    for (const p of permissions.value) {
      const slug = permissionSlugFromEntry(p);
      if (slug != null && String(slug).trim().toLowerCase() === "hr") {
        return true;
      }
      if (typeof p === "string" && String(p).trim().toLowerCase() === "hr") {
        return true;
      }
    }
    const u = user.value;
    if (!u) return false;
    if (Array.isArray(u.roles) && u.roles.some((r) => roleLooksHr(r))) {
      return true;
    }
    if (roleLooksHr(u.role)) return true;
    if (Array.isArray(u.role) && u.role.some((r) => roleLooksHr(r))) {
      return true;
    }
    return false;
  });

  /**
   * Permission slug for HR users who may use full Attendance logs + admin report flows.
   * Set `VITE_HR_ATTENDANCE_MANAGE_PERMISSION` in `.env` to match your API `permissions` array.
   */
  const hrAttendanceManagePermission = String(
    (typeof import.meta !== "undefined" &&
      import.meta.env?.VITE_HR_ATTENDANCE_MANAGE_PERMISSION) ||
      "",
  ).trim();

  /**
   * Full `hr-attendance` route + sidebar "Attendance": admin, legacy env slug, or
   * `view-attendance-log` only (employees without it use My attendance).
   */
  const canManageFullAttendance = computed(() => {
    if (isAdminUser.value) return true;
    if (
      hrAttendanceManagePermission &&
      permissions.value.includes(hrAttendanceManagePermission)
    ) {
      return true;
    }
    return hasPermission(HR_PERMISSION.VIEW_ATTENDANCE_LOG);
  });

  /** Payroll / HR `employee_id` for the logged-in user (string for query params). */
  const payrollEmployeeId = computed(() => {
    const u = user.value;
    if (!u) return "";
    const candidates = [
      u.employee_id,
      u.payroll_employee_id,
      u.hr_employee_id,
      u.payroll_employee?.id,
      u.employee?.id,
      u.employee?.employee_id,
      u.linked_employee_id,
      u.staff_id,
      u.payroll?.employee_id,
      u.payroll?.id,
      u.profile?.employee_id,
      u.meta?.employee_id,
      u.user_employee?.employee_id,
      u.user_employee?.id,
    ];
    for (const raw of candidates) {
      if (raw === undefined || raw === null) continue;
      const s = String(raw).trim();
      if (s) return s;
    }
    return "";
  });

  const initAuth = async () => {
    restoreTokenFromCookies();
    if (token.value) {
      await getUserByToken();
    }
  };

  return {
    token,
    user,
    permissions,
    loading,
    error,
    forgotSuccess,
    login,
    logout,
    clearSession,
    forceLogout,
    forgotPassword,
    resetPassword,
    getUserByToken,
    hasPermission,
    can,
    isAdminUser,
    canManageFullAttendance,
    payrollEmployeeId,
    hasHrRoleOrHrPermission,
    initAuth,
  };
});
