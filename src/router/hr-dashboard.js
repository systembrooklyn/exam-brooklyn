import Layout from "../components/hr-dashboard/Layout.vue";

export default {
  path: "/hr",
  component: Layout,
  name: "hr-dashboard",
  meta: { requiresPermission: "" }, // Adjust permissions as needed
  children: [
    {
      path: "",
      name: "hr-home",
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
      path: "employees",
      name: "hr-employees",
      component: () => import("@/views/hr/Employees.vue"),
    },
    {
      path: "contracts",
      name: "hr-contracts",
      component: () => import("@/views/hr/Contracts.vue"),
    },
  ],
};
