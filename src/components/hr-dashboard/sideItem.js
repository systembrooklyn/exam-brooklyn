import {
  Home,
  Users,
  Building,
  Briefcase,
  Clock,
  FileText,
  Calendar,
  ClipboardList,
  GitPullRequest,
  Banknote,
  Palmtree,
  CalendarClock,
} from "lucide-vue-next";

/**
 * HR sidebar items. Pass `true` for users who may use full Attendance logs (`hr-attendance`).
 * Everyone else still sees "My attendance" for self-service reporting.
 */
export function buildHrSidebarItems(canManageFullAttendance) {
  const items = [
    {
      name: "Dashboard",
      icon: Home,
      route: "hr-home",
    },
    {
      name: "Departments",
      icon: Building,
      route: "hr-departments",
    },
    {
      name: "Job Titles",
      icon: Briefcase,
      route: "hr-job-titles",
    },
    {
      name: "Shifts",
      icon: Clock,
      route: "hr-shifts",
    },
    {
      name: "Official Holidays",
      icon: Calendar,
      route: "hr-holidays",
    },
    {
      name: "My attendance",
      icon: CalendarClock,
      route: "hr-my-attendance",
    },
  ];

  if (canManageFullAttendance) {
    items.push({
      name: "Attendance",
      icon: ClipboardList,
      route: "hr-attendance",
    });
  }

  items.push(
    {
      name: "Requests",
      icon: GitPullRequest,
      route: "hr-requests",
    },
    {
      name: "Employees",
      icon: Users,
      route: "hr-employees",
    },
    {
      name: "Contracts",
      icon: FileText,
      route: "hr-contracts",
    },
    {
      name: "Vacations",
      icon: Palmtree,
      children: [
        { name: "Vacations Details", route: "hr-vacation-balances" },
        { name: "Vacation Balances", route: "hr-my-vacations" },
      ],
    },
    {
      name: "Payrolls",
      icon: Banknote,
      route: "hr-payrolls",
    },
  );

  return items;
}
