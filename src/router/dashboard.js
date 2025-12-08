import Dashboard from "../components/dashboard/Dashboard.vue";

export default {
  path: "/dashboard",
  component: Dashboard,
  name: "dashboard",
  meta: { requiresPermission: "view-dashboard" },
  children: [
    {
      path: "",
      name: "dashboard-home",
      component: () => import("@/views/dashboard/DashboardHome.vue"),
    },
    {
      path: "users",
      name: "users",
      meta: { requiresPermission: "view-user" },
      component: () => import("@/views/dashboard/EmployeeList.vue"),
    },
    {
      path: "create-exam",
      name: "create-exam",
      meta: { requiresPermission: "create-exams" },
      component: () => import("@/views/dashboard/CreateExams.vue"),
    },
    {
      path: "examExcel",
      name: "examExcel",
      meta: { requiresPermission: "create-exams" },
      component: () => import("@/views/dashboard/ImportExamExcel.vue"),
    },
    {
      path: "exams",
      name: "exams",
      meta: { requiresPermission: "view-exams" },
      component: () => import("@/views/dashboard/AllExams.vue"),
    },
    {
      path: "instructors",
      name: "instructors",
      meta: { requiresPermission: "view-instructors" },
      component: () => import("@/views/dashboard/InstructorList.vue"),
    },
    {
      path: "courses",
      name: "courses",
      meta: { requiresPermission: "view-courses" },
      component: () => import("@/views/dashboard/CourseList.vue"),
    },
    {
      path: "scholarships",
      name: "scholarships",
      meta: { requiresPermission: "view-scholarship" },
      component: () => import("@/views/dashboard/ScholarshipList.vue"),
    },
    {
      path: "exams/:id/edit",
      name: "edit-exam",
      meta: { requiresPermission: "edit-exams" },
      component: () => import("@/views/dashboard/EditExam.vue"),
    },
    {
      path: "placement/:id/edit",
      name: "edit-placement",
      meta: { requiresPermission: "edit-placement" },
      component: () => import("@/views/dashboard/EditPlacementTest.vue"),
    },
    {
      path: "roles",
      name: "roles",
      meta: { requiresPermission: "view-role" },
      component: () => import("@/views/dashboard/RoleList.vue"),
    },
    {
      path: "reservations",
      name: "reservations",
      meta: { requiresPermission: "view-dashboard" },
      component: () => import("@/views/dashboard/ReservationsList.vue"),
    },
    {
      path: "placement",
      name: "placement",
      // meta: { requiresPermission: "view-reservations" },
      component: () => import("@/views/dashboard/PlacementTestList.vue"),
    },
    {
      path: "create-placement",
      name: "create-placement",
      // meta: { requiresPermission: "view-reservations" },
      component: () => import("@/views/dashboard/CreatePlacement.vue"),
    },
  ],
};