import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/pages/Home.vue";
import Exam from "../views/pages/Exam.vue";
import LogIn from "../views/pages/LogIn.vue";
import dashboard from "../components/dashboard/Dashboard.vue";
import { useAuthStore } from "../stores/auth";
import accessControl from "./access-control";

const routes = [
  { path: "/", name: "login", component: LogIn },
  { path: "/home", name: "home", component: Home },
  { path: "/examPage", name: "examPage", component: Exam },
  {
    path: "/reservation",
    name: "reservation",
    component: () => import("../views/pages/Reservation.vue"),
  },
  {
    path: "/srm",
    name: "srm",
    component: () => import("../views/pages/SrmSystem.vue"),
  },
  {
    path: "/placement-test",
    name: "placement-test",
    component: () => import("../views/pages/PlacementTest.vue"),
  },
  {
    path: "/reservationSuccess",
    name: "reservation-success",
    component: () => import("../views/pages/ReservationSuccess.vue"),
  },

  {
    path: "/result",
    name: "ResultPage",
    component: () => import("../views/pages/ResultPage.vue"),
  },
  {
    path: "/systems",
    name: "SystemsPage",
    component: () => import("../views/dashboard/SystemsPage.vue"),
  },
  {
    path: "/password-reset",
    name: "password-reset",
    component: () => import("../views/pages/password-reset.vue"),
  },
  {
    path: "/placement-essay",
    name: "placement-essay",
    component: () => import("../views/pages/PlacementEssay.vue"),
  },
  {
    path: "/placement-exam",
    name: "placement-exam",
    component: () => import("../views/pages/PlacementTestExam.vue"),
  },
   {
    path: '/exam-success',
    name: 'exam-success',
    component: () => import("../views/pages/PlacementSuccess.vue"),
  },
    {
    path: '/exam-start',
    name: 'exam-start',
    component: () => import("../views/pages/PlacementStart.vue"),
  },
  

  {
    path: "/:catchAll(.*)",
    name: "error",
    component: () => import("@/views/pages/Error404.vue"),
  },
  // dashboard
  {
    path: "/dashboard",
    component: dashboard,
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
        path: "examExel",
        name: "examExel",
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
        // meta: { requiresPermission: "view-reservations" },
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
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.token;
  const userPermissions = authStore.permissions || [];
  const access = accessControl[to.name];

  if (to.path === "/" && isAuthenticated) {
    return next({ name: "SystemsPage" });
  }

  const publicPages = ["login", "password-reset", "error"];
  const authRequired = !publicPages.includes(to.name);

  if (authRequired && !isAuthenticated) {
    return next({ name: "login" });
  }

  if (access) {
    if (access.blockedIfHas?.some((p) => userPermissions.includes(p))) {
      return next({ name: "dashboard" });
    }
    if (access.requires?.some((p) => !userPermissions.includes(p))) {
      return next({ name: "SystemsPage" });
    }
  }

  next();
});

export default router;
