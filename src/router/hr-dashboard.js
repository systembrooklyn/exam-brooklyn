import Layout from "../components/hr-dashboard/Layout.vue";
import { useAuthStore } from "@/stores/auth";

export default {
  path: "/hr",
  component: Layout,
  name: "hr-dashboard",
  meta: { requiresPermission: "" }, // Adjust permissions as needed
  children: [
    {
      path: "",
      name: "hr-home",
      beforeEnter: (_to, _from, next) => {
        const auth = useAuthStore();
        if (!auth.canManageFullAttendance) {
          return next({ name: "hr-my-attendance", replace: true });
        }
        next();
      },
      component: () => import("@/views/hr/HrHome.vue"),
    },
    {
      path: "departments",
      name: "hr-departments",
      component: () => import("@/views/hr/Departments.vue"),
    },
    {
      path: "job-titles",
      name: "hr-job-titles",
      component: () => import("@/views/hr/JobTitles.vue"),
    },
    {
      path: "shifts",
      name: "hr-shifts",
      component: () => import("@/views/hr/Shifts.vue"),
    },
    {
      path: "holidays",
      name: "hr-holidays",
      component: () => import("@/views/hr/Holidays.vue"),
    },
    {
      path: "my-attendance",
      name: "hr-my-attendance",
      component: () => import("@/views/hr/MyAttendanceReport.vue"),
    },
    {
      path: "attendance",
      name: "hr-attendance",
      beforeEnter: (_to, _from, next) => {
        const auth = useAuthStore();
        if (!auth.canManageFullAttendance) {
          return next({ name: "hr-my-attendance", replace: true });
        }
        next();
      },
      component: () => import("@/views/hr/Attendance.vue"),
    },
    {
      path: "requests",
      name: "hr-requests",
      component: () => import("@/views/hr/Requests.vue"),
    },
    {
      path: "employees",
      name: "hr-employees",
      component: () => import("@/views/hr/Employees.vue"),
    },
    {
      path: "contracts",
      name: "hr-contracts",
      component: () => import("@/views/hr/Contracts.vue"),
    },
    {
      path: "vacation-balances",
      name: "hr-vacation-balances",
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
      component: () => import("@/views/hr/EmployeeLinks.vue"),
    },
    {
      path: "payrolls",
      name: "hr-payrolls",
      component: () => import("@/views/hr/Payrolls.vue"),
    },
  ],
};
