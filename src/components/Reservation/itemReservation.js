import { Calendar, ListTodo, GraduationCap, Calculator } from "lucide-vue-next";

export const itemReservation = [
  {
    name: "Reservations",
    icon: Calendar,
    route: "formreservation-form",
    permission: "create-reservation",
  },
  {
    name: "waiting list",
    icon: ListTodo,
    route: "waiting-list",
    permission: "view-reservation",
  },
  {
    name: "Scholarship",
    icon: GraduationCap,
    route: "waiting-list-table",
    permission: "view-reservation",
  },
  {
    name: "Scholarship Calculator",
    icon: Calculator,
    route: "scholarship-calculator",
  },
];
