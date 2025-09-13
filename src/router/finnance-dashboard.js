import Layaout from "../components/finnance-dahboard/layaout.vue";

export default  {
    path: "/finnance",
    component: Layaout,
    name: "finnance-dashboard",
    meta: { requiresPermission: "" },
    children: [
      {
        path: "",
        name: "finnance-home",
        component: () => import("@/views/finnance/FinnanceHome.vue"),
      },
      {
        path: "by-date",
        name: "by-date",
        component: () => import("@/views/finnance/FinnanceByDate.vue"),
      },
      {
        path: "unpaid",
        name: "unpaid",
        component: () => import("@/views/finnance/FinnanceUnpaid.vue"),
      },
      {
        path: "after-2-days",
        name: "after-2-days",
        component: () => import("@/views/finnance/FinnanceAfter2Days.vue"),
      },
      {
        path: "after-1-week",
        name: "after-1-week",
        component: () => import("@/views/finnance/FinnanceAfter1Week.vue"),
      }
      ,{
        path: "acceptance-date",
        name: "acceptance-date",
        component: () => import("@/views/finnance/AcceptanceDate.vue"),
      },
      {
        path: "acceptance-unpaid",
        name: "acceptance-unpaid",
        component: () => import("@/views/finnance/AcceptanceUnpaid.vue"),
      }
    ],
  };