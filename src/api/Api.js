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
export const COURSE_GROUPS = (courseId) => `courses/${courseId}/groups`;
export const ALL_EXAMS = "exams";
export const ADD_EXAM = "addExam";
export const QUESTIONS = "questions";
export const ALL_SCHOLARSHIPS = "scholarships";
export const SCHOLARSHIPS_PLANS = "scholarshipsPlans";
export const FORGOT_PASSWORD = "forgotPassword";
export const RESET_PASSWORD = "resetPassword";
export const IMPORT_EXAMS = "importExams";
export const RESERVATIONS = "reservations";
export const BRANCHES = "branches";
export const STUDENT = "studentData";
export const GET_ST_BY_EMAIL = "getStByEmail";
export const PLACEMENT_TESTS = "ptests";
export const ADD_PLACEMENT_QUESTIONS = "questions";
export const ADD_PLACEMENT_TEST = "ptestWithQuestions";
export const GET_PLACEMENT_QUESTIONS = "ptestQuestions";
export const START_PLACEMENT = "ptestStart";
export const FINISH_PLACEMENT = "ptest";
export const PLACEMENT_TESTS_SURVEY = "saveSurveyAnswers";
export const PT_ATTEMPTS = "ptAttempts";
export const REQUESTS = "studentRequestEmp";
/** POST body: optional filters; omit keys when unused (backend rejects null). */
export const GET_STUDENT_REQUEST_EMP = "getStudentRequestEmp";
export const FINAL_ACCEPTANCE = "finalAcceptance";
export const DEADLINES = "deadlines";
export const STUDENT_SEARCH = "students/search";
export const UPDATE_STUDENT_BASIC_INFO = (id) => `students/${id}/basicInfo`;
export const UPDATE_PAYMENT = (id) => `students/${id}/payment`;
export const UPDATE_GROUP_START_TIME = (id) => `students/${id}/groupStartTime`;
export const GROUP_BY_CODE = "groupByCode";
export const SEND_STUDEND_MAIL = "sendStudentMail";
export const SEND_STUDEND_SMS = "studentSrmSmsMessage";

export const BOOKINGS = "bookings";
export const PAPERS_ALL = "papers/all";
export const PAPER_STATUS = (id) => `papers/${id}/status`;

// Payroll System APIs
export const PAYROLL_EMPLOYEES = "payroll-system/employees";
export const PAYROLL_DEPARTMENTS = "payroll-system/departments";
export const PAYROLL_JOB_TITLES = "payroll-system/job-titles";
export const PAYROLL_SHIFTS = "payroll-system/shifts";
export const PAYROLL_LINKING = "payroll-system/employee-job-departments";
export const PAYROLL_CONTRACTS = "payroll-system/contracts";
export const PAYROLL_VACATION_BALANCES = "payroll-system/vacation-balances";
export const PAYROLL_VACATION_BALANCES_SIMPLE =
  "payroll-system/vacation-balances/simple";
export const PAYROLL_VACATION_BALANCES_ASSIGN_CONTRACTS =
  "payroll-system/vacation-balances/assign-contracts";
export const PAYROLL_VACATION_BALANCE_CONTRACT = (
  vacationBalanceId,
  contractId,
) =>
  `payroll-system/vacation-balances/${vacationBalanceId}/contracts/${contractId}`;
export const PAYROLL_MANAGERS = "payroll-system/employees/managers";
export const PAYROLL_ASSIGN_MANAGER = (id) =>
  `payroll-system/employees/${id}/assign-manager`;
export const PAYROLL_TERMINATE_EMPLOYEE = (id) =>
  `payroll-system/employees/${id}/terminate`;

// New Modules
export const PAYROLL_HOLIDAYS = "payroll-system/official-holidays";
export const PAYROLL_LINK_HOLIDAY = (id) =>
  `payroll-system/official-holidays/${id}/link-to-contract`;
export const PAYROLL_UNLINK_HOLIDAY = (id) =>
  `payroll-system/official-holidays/${id}/unlink-from-contract`;
export const PAYROLL_CONTRACT_HOLIDAYS = (id) =>
  `payroll-system/contracts/${id}/holidays`;

export const PAYROLL_ATTENDANCE = "payroll-system/attendance-logs";
export const PAYROLL_ATTENDANCE_BULK =
  "payroll-system/attendance-logs/bulk-upload";
export const PAYROLL_ATTENDANCE_REPORT = "payroll-system/attendance-monthly";

export const PAYROLL_REQUESTS = "payroll-system/employee-requests";
export const PAYROLL_UPDATE_REQUEST = (id) =>
  `payroll-system/employee-requests.update/${id}`;
export const PAYROLL_REQUESTS_ME = "payroll-system/employee-requests/me";
export const PAYROLL_REQUESTS_PENDING =
  "payroll-system/employee-requests/pending";
export const PAYROLL_REQUESTS_EMPLOYEES_WITH_REQUESTS =
  "payroll-system/employee-requests/employees-with-requests";
export const PAYROLL_APPROVE_REQUEST = (id) =>
  `payroll-system/employee-requests/${id}/approve`;
export const PAYROLL_REJECT_REQUEST = (id) =>
  `payroll-system/employee-requests/${id}/reject`;
export const PAYROLL_BULK_APPROVE_REQUESTS =
  "payroll-system/employee-requests/bulk-approve";
export const PAYROLL_BULK_REJECT_REQUESTS =
  "payroll-system/employee-requests/bulk-reject";
export const PAYROLL_APPROVED_VACATIONS =
  "payroll-system/employee-requests/approved-vacations";

export const PAYROLL_CALC = "payroll-system/payroll-details";
export const PAYROLL_STATUS_UPDATE = "payroll-system/payroll-status/update";
export const PAYROLL_DETAILS = "payroll-system/payroll-details";
export const PAYROLL_ACTIONABLE = "payroll-system/payroll-actionable";
export const PAYROLL_EMPLOYEE_ADJUSTMENTS =
  "payroll-system/employee-adjustments";
export const PAYROLL_EMPLOYEE_ADJUSTMENT_BY_ID = (id) =>
  `payroll-system/employee-adjustments/${id}`;

export const PAYROLL_DEDUCTION_TYPES = "payroll-system/deduction-types";
export const PAYROLL_DEDUCTION_TYPE_BY_ID = (id) =>
  `payroll-system/deduction-types/${id}`;

export const PAYROLL_EMPLOYEE_DEDUCTIONS = "payroll-system/employee-deductions";
export const PAYROLL_EMPLOYEE_DEDUCTION_BY_ID = (id) =>
  `payroll-system/employee-deductions/${id}`;

// Manpower System APIs
export const MANPOWER_POSITIONS = "manpower/positions";
export const MANPOWER_POSITION_BY_ID = (id) => `manpower/positions/${id}`;
export const MANPOWER_POSITION_EMPLOYEES = (id) => `manpower/positions/${id}/employees`;
export const MANPOWER_POSITION_REQUIREMENTS = "manpower/position-requirements";
export const MANPOWER_POSITION_REQUIREMENTS_BY_ID = (id) => `manpower/position-requirements/${id}`;
export const MANPOWER_PLANS = "manpower/manpower-plans";
export const MANPOWER_PLAN_BY_ID = (id) => `manpower/manpower-plans/${id}`;

// Price Settings
export const PRICE_SETTINGS = "price-settings";
export const PRICE_SETTINGS_BY_ID = (id) => `price-settings/${id}`;

// Reservation Actions
export const RESERVATION_SUBMIT = (id) => `reservations/${id}/submit`;

// Tickets System APIs
export const TICKETS_BASE = "tickets";
export const TICKETS_META = "tickets/meta";
export const TICKET_BY_SERIAL = (serial) => `tickets/${serial}`;
export const TICKET_COMMENTS = (serial) => `tickets/${serial}/comments`;
export const TICKET_STATUS = (serial) => `tickets/${serial}/status`;
export const TICKET_EVALUATE = (serial) => `tickets/${serial}/evaluate`;

// ── Recruitment System APIs ────────────────────────────────────────────────
export const RECRUITMENT_JOB_REQUESTS       = 'recruitment/job-requests';
export const RECRUITMENT_JOB_REQUEST_BY_ID  = (id) => `recruitment/job-requests/${id}`;
export const RECRUITMENT_JOB_REQUEST_SUBMIT = (id) => `recruitment/job-requests/${id}/submit`;
export const RECRUITMENT_JOB_REQUEST_APPROVE= (id) => `recruitment/job-requests/${id}/approve`;
export const RECRUITMENT_JOB_REQUEST_REJECT = (id) => `recruitment/job-requests/${id}/reject`;
export const RECRUITMENT_JOB_REQUEST_REOPEN = (id) => `recruitment/job-requests/${id}/reopen`;

export const RECRUITMENT_JOB_POSTS          = 'recruitment/job-posts';
export const RECRUITMENT_JOB_POST_BY_ID     = (id) => `recruitment/job-posts/${id}`;
export const RECRUITMENT_JOB_POST_PUBLISH   = (id) => `recruitment/job-posts/${id}/publish`;
export const RECRUITMENT_JOB_POST_CLOSE     = (id) => `recruitment/job-posts/${id}/close`;
export const RECRUITMENT_JOB_POST_ARCHIVE   = (id) => `recruitment/job-posts/${id}/archive`;

export const RECRUITMENT_CANDIDATES         = 'recruitment/candidates';
export const RECRUITMENT_CANDIDATE_BY_ID    = (id) => `recruitment/candidates/${id}`;

export const RECRUITMENT_APPLICATIONS               = 'recruitment/applications';
export const RECRUITMENT_APPLICATION_BY_ID          = (id) => `recruitment/applications/${id}`;
export const RECRUITMENT_APPLICATION_ASSIGN_RECRUITER = (id) => `recruitment/applications/${id}/assign-recruiter`;
export const RECRUITMENT_APPLICATION_MOVE_STAGE     = (id) => `recruitment/applications/${id}/move-stage`;
export const RECRUITMENT_APPLICATION_REJECT         = (id) => `recruitment/applications/${id}/reject`;
export const RECRUITMENT_APPLICATION_WITHDRAW       = (id) => `recruitment/applications/${id}/withdraw`;
export const RECRUITMENT_APPLICATION_HIRE           = (id) => `recruitment/applications/${id}/hire`;
export const RECRUITMENT_APPLICATION_ACTIVITY       = (id) => `recruitment/applications/${id}/activity-log`;
export const RECRUITMENT_APPLICATION_INTERVIEWS     = (id) => `recruitment/applications/${id}/interviews`;
export const RECRUITMENT_APPLICATION_OFFER          = (id) => `recruitment/applications/${id}/offer`;

export const RECRUITMENT_INTERVIEWS             = 'recruitment/interviews';
export const RECRUITMENT_INTERVIEW_BY_ID        = (id) => `recruitment/interviews/${id}`;
export const RECRUITMENT_INTERVIEW_SCHEDULE     = (id) => `recruitment/interviews/${id}/schedule`;
export const RECRUITMENT_INTERVIEW_SUBMIT_RESULT= (id) => `recruitment/interviews/${id}/submit-result`;
export const RECRUITMENT_INTERVIEW_CANCEL       = (id) => `recruitment/interviews/${id}/cancel`;

export const RECRUITMENT_OFFERS         = 'recruitment/offers';
export const RECRUITMENT_OFFER_BY_ID   = (id) => `recruitment/offers/${id}`;
export const RECRUITMENT_OFFER_SEND    = (id) => `recruitment/offers/${id}/send`;
export const RECRUITMENT_OFFER_EXPIRE  = (id) => `recruitment/offers/${id}/expire`;

export const RECRUITMENT_HIRES         = 'recruitment/hires';
export const RECRUITMENT_HIRE_BY_ID    = (id) => `recruitment/hires/${id}`;

export const RECRUITMENT_INTERVIEW_STAGES       = 'recruitment/interview-stages';
export const RECRUITMENT_INTERVIEW_STAGE_BY_ID  = (id) => `recruitment/interview-stages/${id}`;

export const RECRUITMENT_DASHBOARD      = 'recruitment/dashboard';
export const RECRUITMENT_REPORTS_BASE   = 'recruitment/reports';

// ── Public Career Page APIs (no auth) ──────────────────────────────────────
export const PUBLIC_JOBS             = 'jobs';
export const PUBLIC_JOB_BY_SLUG      = (slug) => `jobs/${slug}`;
export const PUBLIC_JOB_APPLY        = (slug) => `jobs/${slug}/apply`;

// ── Freelancer Payroll APIs ────────────────────────────────────────────────
export const FREELANCERS_BASE                  = 'freelancers-payroll/freelancers';
export const FREELANCER_BY_ID                  = (id) => `freelancers-payroll/freelancers/${id}`;
export const FREELANCER_PAYROLLS               = 'freelancers-payroll/payrolls';
export const FREELANCER_PAYROLLS_FOR_MEMBER    = (id) => `freelancers-payroll/freelancers/${id}/payrolls`;
export const FREELANCER_PAYROLL_BY_ID          = (id) => `freelancers-payroll/payrolls/${id}`;
export const FREELANCER_TOTAL_BY_MONTH          = 'freelancers-payroll/total-by-month';

// ── Payroll Reports APIs ───────────────────────────────────────────────────
export const PAYROLL_REPORTS_DASHBOARD         = 'payroll-reports/dashboard';
export const PAYROLL_REPORTS_PERIOD            = 'payroll-reports/period';
export const PAYROLL_REPORTS_EMPLOYEE_HISTORY  = (id) => `payroll-reports/employees/${id}/history`;
export const PAYROLL_REPORTS_FREELANCERS       = 'payroll-reports/freelancers';
