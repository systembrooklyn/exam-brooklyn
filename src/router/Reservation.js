import Layaout from "../components/finnance-dahboard/layaout.vue";

export default {
  path: "/reservation",
  component: Layaout,
  name: "reservation",

  children: [
    {
      path: "",
      name: "reservation-home",
      component: () => import("@/views/reservation/ReservationHome.vue"),
    },
    {
      path: "form",
      name: "formreservation-form",
      component: () => import("@/views/reservation/FormReservation.vue"),
    },
    {
      path: "waiting-list",
      name: "waiting-list",
      component: () =>
        import("@/views/reservation/WaitingListHandlerLayout.vue"),
    },
    {
      path: "waiting-list-table",
      name: "waiting-list-table",
      component: () =>
        import("@/views/reservation/StudentScholarshipForm.vue"),
    },
    {
      path: "success",
      name: "reservation-success",
      component: () => import("@/views/reservation/ReservationSuccess.vue"),
    },
  ],
};
