import {
  Home,
  Users,
  Building,
  Briefcase,
  Clock,
  FileText,
  Calendar,
  Link,
  ClipboardList,
  GitPullRequest,
} from "lucide-vue-next";

export const itemHr = [
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
    name: "Attendance",
    icon: ClipboardList,
    route: "hr-attendance",
  },
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
    name: "Vacation Balances",
    icon: Calendar,
    route: "hr-vacation-balances",
  },
  // {
  //   name: "Job Assignments",
  //   icon: Link,
  //   route: "hr-links",
  // },
];
