import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/pages/Home.vue";
import Exam from "../views/pages/Exam.vue";
import LogIn from "../views/pages/LogIn.vue";
import { useAuthStore } from "../stores/auth";
import accessControl from "./access-control";

// dashboard
import dashboardRoutes from "./dashboard";
import finnanceDashboard from "./finnance-dashboard";

const routes = [
  { path: "/", name: "login", component: LogIn },
  { 
    path: "/home", 
    name: "home", 
    component: Home, 
    meta: { requiresPermission: "start-exam" } 
  },
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
    path: "/groups",
    name: "groups",
    component: () => import("../views/GroupsPage.vue"),
    meta: { requiresPermission: "" }
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
    path: "/exam-success",
    name: "exam-success",
    component: () => import("../views/pages/PlacementSuccess.vue"),
  },
  {
    path: "/exam-start",
    name: "exam-start",
    component: () => import("../views/pages/PlacementStart.vue"),
  },
  {
    path: "/:catchAll(.*)",
    name: "error",
    component: () => import("@/views/pages/Error404.vue"),
  },
  // dashboard
  dashboardRoutes,
  // finance-dashboard
  finnanceDashboard,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.token;

  if (to.path === "/" && isAuthenticated) {
    return next({ name: "SystemsPage" });
  }

  const publicPages = ["login", "password-reset", "error"];
  const authRequired = !publicPages.includes(to.name);

  if (authRequired && !isAuthenticated) {
    return next({ name: "login" });
  }

  // ✅ Access control via access-control.js
  const access = accessControl[to.name];
  if (access) {
    if (access.blockedIfHas?.some((p) => authStore.hasPermission(p))) {
      return next({ name: "dashboard" });
    }
    if (access.requires?.some((p) => !authStore.hasPermission(p))) {
      return next({ name: "SystemsPage" });
    }
  }

  // ✅ Meta-based permission check
  const required = to.meta?.requiresPermission;
  if (required && !authStore.hasPermission(required)) {
    return next({ name: "SystemsPage" });
  }

  next();
});

export default router;
