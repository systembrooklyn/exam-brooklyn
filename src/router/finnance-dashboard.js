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
        component: () => import("@/views/finnance-dash/FinnanceHome.vue"),
      },
      
    ],
  };