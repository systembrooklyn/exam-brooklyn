import { CalendarSearch ,BadgeDollarSign, CalendarCheck2, Clock } from 'lucide-vue-next'

export const itemfinnance = [
  {
    name: "Student Deadline",
    icon: BadgeDollarSign,
    children: [
      { name: "By Date", route: "by-date" },
      { name: "After 2 Days", route: "after-2-days" },
      { name: "After 1 week", route: "after-1-week" },
      { name: "Unpaid", route: "unpaid" },
    ],
  },
  {
    name: "Fresh Deadline",
    icon: CalendarCheck2,
    children: [
      { name: "Acceptance Data", route: "acceptance-date" },
      { name: "Unpaid", route: "acceptance-unpaid" },
    ],
  },
  {
    name: "Today",
    icon: Clock,
    route: "today",
  },
];
