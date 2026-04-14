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
  Link,
} from "lucide-vue-next";
import { HR_PERMISSION } from "@/constants/hrPermissions";

/**
 * HR sidebar items. Pass `true` for users who may use full Attendance logs (`hr-attendance`).
 * Non-admins still see "My attendance" for self-service reporting; admins use full Attendance only.
 *
 * Optional `permission` (single slug) or `permissions` (any-of) gate sidebar visibility via `filterHrSidebarItems`.
 */
export function buildHrSidebarItems(canManageFullAttendance, isAdminUser = false) {
  const items = [
    {
      name: "Dashboard",
      icon: Home,
      route: "hr-home",
      permission: HR_PERMISSION.VIEW_CONTRACT,
    },
    {
      name: "Departments",
      icon: Building,
      route: "hr-departments",
      permission: HR_PERMISSION.VIEW_DEPARTMENT,
    },
    {
      name: "Job Titles",
      icon: Briefcase,
      route: "hr-job-titles",
      permission: HR_PERMISSION.VIEW_JOB_TITLE,
    },
    {
      name: "Shifts",
      icon: Clock,
      route: "hr-shifts",
      permission: HR_PERMISSION.VIEW_SHIFT,
    },
    {
      name: "Official Holidays",
      icon: Calendar,
      route: "hr-holidays",
      permission: HR_PERMISSION.VIEW_OFFICIAL_HOLIDAYS,
    },
  ];

  if (!isAdminUser) {
    items.push({
      name: "My attendance",
      icon: CalendarClock,
      route: "hr-my-attendance",
    });
  }

  if (canManageFullAttendance) {
    items.push({
      name: "Attendance",
      icon: ClipboardList,
      route: "hr-attendance",
      permission: HR_PERMISSION.VIEW_ATTENDANCE_LOG,
    });
  }

  items.push(
    {
      name: "Requests",
      icon: GitPullRequest,
      route: "hr-requests",
      permissions: [
        HR_PERMISSION.VIEW_EMPLOYEE_REQUEST,
        HR_PERMISSION.VIEW_PENDING_REQUESTS,
      ],
    },
    {
      name: "Employees",
      icon: Users,
      route: "hr-employees",
      permission: HR_PERMISSION.VIEW_EMPLOYEE,
    },
    {
      name: "Contracts",
      icon: FileText,
      route: "hr-contracts",
      permission: HR_PERMISSION.VIEW_CONTRACT,
    },
    // {
    //   name: "Employee Links",
    //   icon: Link,
    //   route: "hr-links",
    //   permissions: [
    //     HR_PERMISSION.ASSIGN_RELATION_EMPLOYEE_JOB_DEPARTMENT,
    //     HR_PERMISSION.UPDATE_RELATION_EMPLOYEE_JOB_DEPARTMENT,
    //   ],
    // },
    {
      name: "Vacations",
      icon: Palmtree,
      children: [
        {
          name: "Vacations Details",
          route: "hr-vacation-balances",
          permission: HR_PERMISSION.VIEW_VACATION_BALANCE,
        },
        {
          name: "Vacation Balances",
          route: "hr-my-vacations",
          permission: HR_PERMISSION.VIEW_VACATION_BALANCE,
        },
      ],
    },
    {
      name: "Payrolls",
      icon: Banknote,
      route: "hr-payrolls",
      permission: HR_PERMISSION.VIEW_PAYROLL,
    },
  );

  return items;
}

/**
 * @param {ReturnType<typeof buildHrSidebarItems>} items
 * @param {(slug: string) => boolean} can - e.g. (slug) => authStore.can(slug)
 */
export function filterHrSidebarItems(items, can) {
  return items
    .map((item) => {
      if (item.children?.length) {
        const children = item.children.filter((child) => {
          if (child.permissions?.length) {
            return child.permissions.some((p) => can(p));
          }
          if (child.permission) return can(child.permission);
          return true;
        });
        if (children.length === 0) return null;
        return { ...item, children };
      }
      if (item.permissions?.length) {
        if (!item.permissions.some((p) => can(p))) return null;
      } else if (item.permission && !can(item.permission)) {
        return null;
      }
      return item;
    })
    .filter(Boolean);
}
