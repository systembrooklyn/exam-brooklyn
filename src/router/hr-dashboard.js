import Layout from "../components/hr-dashboard/Layout.vue";
import { useAuthStore } from "@/stores/auth";
import { HR_PERMISSION } from "@/constants/hrPermissions";

/** Any of these allows `/hr/requests` (view queue, create for self, or create for others). */
const HR_REQUESTS_ROUTE_ACCESS = [
  HR_PERMISSION.VIEW_EMPLOYEE_REQUEST,
  HR_PERMISSION.VIEW_PENDING_REQUESTS,
  HR_PERMISSION.CREATE_EMPLOYEE_REQUEST,
  HR_PERMISSION.CREATE_REQUEST_FOR_OTHERS,
];

function nextIfCanAny(permissions, next) {
  const auth = useAuthStore();
  if (permissions.some((p) => auth.can(p))) return next();
  return next({ name: "SystemsPage" });
}

export default {
  path: "/hr",
  component: Layout,
  name: "hr-dashboard",
  meta: { requiresPermission: "" },
  children: [
    {
      path: "",
      name: "hr-home",
      component: () => import("@/views/hr/HrHome.vue"),
    },
    {
      path: "departments",
      name: "hr-departments",
      meta: { requiresPermission: HR_PERMISSION.VIEW_DEPARTMENT },
      component: () => import("@/views/hr/Departments.vue"),
    },
    {
      path: "job-titles",
      name: "hr-job-titles",
      meta: { requiresPermission: HR_PERMISSION.VIEW_JOB_TITLE },
      component: () => import("@/views/hr/JobTitles.vue"),
    },
    {
      path: "shifts",
      name: "hr-shifts",
      meta: { requiresPermission: HR_PERMISSION.VIEW_SHIFT },
      component: () => import("@/views/hr/Shifts.vue"),
    },
    {
      path: "holidays",
      name: "hr-holidays",
      meta: { requiresPermission: HR_PERMISSION.VIEW_OFFICIAL_HOLIDAYS },
      component: () => import("@/views/hr/Holidays.vue"),
    },
    {
      path: "my-attendance",
      name: "hr-my-attendance",
      beforeEnter: (_to, _from, next) => {
        const auth = useAuthStore();
        if (auth.isAdminUser) {
          return next({ name: "hr-home", replace: true });
        }
        next();
      },
      component: () => import("@/views/hr/MyAttendanceReport.vue"),
    },
    {
      path: "attendance",
      name: "hr-attendance",
      meta: { requiresPermission: HR_PERMISSION.VIEW_ATTENDANCE_LOG },
      component: () => import("@/views/hr/Attendance.vue"),
    },
    {
      path: "requests",
      name: "hr-requests",
      beforeEnter: (_to, _from, next) => {
        nextIfCanAny(HR_REQUESTS_ROUTE_ACCESS, next);
      },
      component: () => import("@/views/hr/Requests.vue"),
    },
    {
      path: "employees",
      name: "hr-employees",
      meta: { requiresPermission: HR_PERMISSION.VIEW_EMPLOYEE },
      component: () => import("@/views/hr/Employees.vue"),
    },
    {
      path: "contracts",
      name: "hr-contracts",
      meta: { requiresPermission: HR_PERMISSION.VIEW_CONTRACT },
      component: () => import("@/views/hr/Contracts.vue"),
    },
    {
      path: "vacation-balances",
      name: "hr-vacation-balances",
      meta: { requiresPermission: HR_PERMISSION.VIEW_VACATION_BALANCE },
      component: () => import("@/views/hr/VacationBalances.vue"),
    },
    {
      path: "my-vacations",
      name: "hr-my-vacations",
      component: () => import("@/views/hr/MyVacationBalances.vue"),
    },
    {
      path: "links",
      name: "hr-links",
      beforeEnter: (_to, _from, next) => {
        nextIfCanAny(
          [
            HR_PERMISSION.ASSIGN_RELATION_EMPLOYEE_JOB_DEPARTMENT,
            HR_PERMISSION.UPDATE_RELATION_EMPLOYEE_JOB_DEPARTMENT,
          ],
          next,
        );
      },
      component: () => import("@/views/hr/EmployeeLinks.vue"),
    },
    {
      path: "payrolls",
      name: "hr-payrolls",
      meta: { requiresPermission: HR_PERMISSION.VIEW_PAYROLL },
      component: () => import("@/views/hr/Payrolls.vue"),
    },
  ],
};
