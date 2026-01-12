// Prefer environment variable when available; fallback to production API
export const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "https://shark-app-s8ndy.ondigitalocean.app/api/";

export const STUDENT_ID = "student/courses";
export const INSTRUCTORS = "course/instructors";
export const START_EXAM = "startExam";
export const SUBMIT_EXAM_ANSWERS = "submitAnswers";
export const FINISH_EXAM_API = "finishExam";
export const LOGIN = "login";
export const REGISTER = "register";
export const USERS = "users";
export const USER_BY_TOKEN = "user";
export const ROLES = "roles";
export const PERMISSIONS = "permissions";
export const SEND_OTP_API = "sendOTP";
export const ALL_INSTRUCTORS = "instructors";
export const ALL_COURSES = "courses";
export const ALL_EXAMS = "exams";
export const ADD_EXAM = "addExam";
export const QUESTIONS = "questions";
export const ALL_SCHOLARSHIPS = "scholarships";
export const FORGOT_PASSWORD = "forgotPassword";
export const RESET_PASSWORD = "resetPassword";
export const IMPORT_EXAMS = "importExams";
export const RESERVATIONS = "reservations";
export const STUDENT = "studentData";
export const GET_ST_BY_EMAIL = "getStByEmail";
export const PLACEMENT_TESTS = "ptests";
export const ADD_PLACEMENT_QUESTIONS = "questions";
export const ADD_PLACEMENT_TEST = "ptestWithQuestions";
export const GET_PLACEMENT_QUESTIONS = "ptestQuestions";
export const START_PLACEMENT = "ptestStart";
export const FINISH_PLACEMENT = "ptest";
export const PLACEMENT_TESTS_SURVEY = "saveSurveyAnswers";
export const REQUESTS = "studentRequestEmp";
export const DEADLINES = "deadlines";
export const STUDENT_SEARCH = "students/search";
export const GROUP_BY_CODE = "groupByCode";
export const SEND_STUDEND_MAIL = "sendStudentMail";
export const SEND_STUDEND_SMS = "studentSrmSmsMessage";

// Payroll System APIs
export const PAYROLL_EMPLOYEES = "payroll-system/employees";
export const PAYROLL_DEPARTMENTS = "payroll-system/departments";
export const PAYROLL_JOB_TITLES = "payroll-system/job-titles";
export const PAYROLL_SHIFTS = "payroll-system/shifts";
export const PAYROLL_LINKING = "payroll-system/employee-job-departments";
export const PAYROLL_CONTRACTS = "payroll-system/contracts";
export const PAYROLL_VACATION_BALANCES = "payroll-system/vacation-balances";
