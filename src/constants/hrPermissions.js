/** Payroll / HR permission slugs from `GET user` `permissions` (and role tooling). */

// Employees
export const HR_PERMISSION = {
  VIEW_EMPLOYEE: "view-employee",
  CREATE_EMPLOYEE: "create-employee",
  UPDATE_EMPLOYEE: "update-employee",
  DELETE_EMPLOYEE: "delete-employee",
  ASSIGN_MANAGER: "assign-manager",

  // Contracts
  VIEW_CONTRACT: "view-contract",
  CREATE_CONTRACT: "create-contract",
  UPDATE_CONTRACT: "update-contract",

  // Attendance
  VIEW_ATTENDANCE_LOG: "view-attendance-log",
  CREATE_ATTENDANCE_LOG: "create-attendance-log",
  UPDATE_ATTENDANCE_LOG: "update-attendance-log",
  DELETE_ATTENDANCE_LOG: "delete-attendance-log",
  BULK_UPLOAD_ATTENDANCE: "bulk-upload-attendance",

  // Requests
  CREATE_EMPLOYEE_REQUEST: "create-employee-request",
  APPROVE_EMPLOYEE_REQUEST: "approve-employee-request",
  REJECT_EMPLOYEE_REQUEST: "reject-employee-request",
  VIEW_PENDING_REQUESTS: "view-pending-requests",
  VIEW_EMPLOYEE_REQUEST: "view-employee-request",

  // Payroll
  CALCULATE_PAYROLL: "calculate-payroll",
  VIEW_PAYROLL: "view-payroll",
  UPDATE_PAYROLL_STATUS: "update-payroll-status",

  // Vacation Balances
  VIEW_VACATION_BALANCE: "view-vacation-balance",
  CREATE_VACATION_BALANCE: "create-vacation-balance",
  UPDATE_VACATION_BALANCE: "update-vacation-balance",
  DELETE_VACATION_BALANCE: "delete-vacation-balance",
  ASSIGN_VACATION_BALANCE: "assign-vacation-balance",

  // Departments
  VIEW_DEPARTMENT: "view-department",
  CREATE_DEPARTMENT: "create-department",
  UPDATE_DEPARTMENT: "update-department",
  DELETE_DEPARTMENT: "delete-department",

  // Job Titles
  VIEW_JOB_TITLE: "view-job-title",
  CREATE_JOB_TITLE: "create-job-title",
  UPDATE_JOB_TITLE: "update-job-title",
  DELETE_JOB_TITLE: "delete-job-title",

  // Shifts
  VIEW_SHIFT: "view-shift",
  CREATE_SHIFT: "create-shift",
  UPDATE_SHIFT: "update-shift",
  DELETE_SHIFT: "delete-shift",

  // Employee-Job-Department
  ASSIGN_RELATION_EMPLOYEE_JOB_DEPARTMENT: "assign-relation-employee-job-department",
  UPDATE_RELATION_EMPLOYEE_JOB_DEPARTMENT: "update-relation-employee-job-department",

  // Official Holidays
  VIEW_OFFICIAL_HOLIDAYS: "view-official-holidays",
  CREATE_OFFICIAL_HOLIDAYS: "create-official-holidays",
  UPDATE_OFFICIAL_HOLIDAYS: "update-official-holidays",
  DELETE_OFFICIAL_HOLIDAYS: "delete-official-holidays",
  LINK_CONTRACT_TO_HOLIDAY: "link-contract-to-holiday",
};
