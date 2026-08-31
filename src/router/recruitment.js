import Layout from "../components/hr-dashboard/Layout.vue";

export default {
  path: "/hr/recruitment",
  component: Layout,
  name: "hr-recruitment",
  children: [
    {
      path: "dashboard",
      name: "recruitment-dashboard",
      meta: { requiresPermission: "view-recruitment-reports" },
      component: () => import("@/views/recruitment/Dashboard.vue"),
    },
    {
      path: "job-requests",
      name: "recruitment-job-requests",
      meta: { requiresPermission: "view-job-requests" },
      component: () => import("@/views/recruitment/JobRequestsList.vue"),
    },
    {
      path: "job-requests/create",
      name: "recruitment-job-request-create",
      meta: { requiresPermission: "create-job-requests" },
      component: () => import("@/views/recruitment/JobRequestForm.vue"),
    },
    {
      path: "job-requests/:id/edit",
      name: "recruitment-job-request-edit",
      meta: { requiresPermission: "update-job-requests" },
      component: () => import("@/views/recruitment/JobRequestForm.vue"),
    },
    {
      path: "job-posts",
      name: "recruitment-job-posts",
      meta: { requiresPermission: "view-job-posts" },
      component: () => import("@/views/recruitment/JobPostsList.vue"),
    },
    {
      path: "job-posts/create",
      name: "recruitment-job-post-create",
      meta: { requiresPermission: "create-job-posts" },
      component: () => import("@/views/recruitment/JobPostForm.vue"),
    },
    {
      path: "job-posts/:id/edit",
      name: "recruitment-job-post-edit",
      meta: { requiresPermission: "update-job-posts" },
      component: () => import("@/views/recruitment/JobPostForm.vue"),
    },
    {
      path: "candidates",
      name: "recruitment-candidates",
      meta: { requiresPermission: "view-candidates" },
      component: () => import("@/views/recruitment/CandidatesList.vue"),
    },
    {
      path: "candidates/create",
      name: "recruitment-candidate-create",
      meta: { requiresPermission: "create-candidates" },
      component: () => import("@/views/recruitment/CandidateForm.vue"),
    },
    {
      path: "candidates/:id/edit",
      name: "recruitment-candidate-edit",
      meta: { requiresPermission: "update-candidates" },
      component: () => import("@/views/recruitment/CandidateForm.vue"),
    },
    {
      path: "candidates/:id",
      name: "recruitment-candidate-profile",
      meta: { requiresPermission: "view-candidates" },
      component: () => import("@/views/recruitment/CandidateProfile.vue"),
    },
    {
      path: "applications",
      name: "recruitment-applications",
      meta: { requiresPermission: "view-applications" },
      component: () => import("@/views/recruitment/ApplicationsList.vue"),
    },
    {
      path: "applications/:id",
      name: "recruitment-application-details",
      meta: { requiresPermission: "view-applications" },
      component: () => import("@/views/recruitment/ApplicationDetails.vue"),
    },
    {
      path: "interviews",
      name: "recruitment-interviews",
      meta: { requiresPermission: "view-interviews" },
      component: () => import("@/views/recruitment/InterviewsList.vue"),
    },
    {
      path: "offers",
      name: "recruitment-offers",
      meta: { requiresPermission: "view-offers" },
      component: () => import("@/views/recruitment/OffersList.vue"),
    },
    {
      path: "hires",
      name: "recruitment-hires",
      meta: { requiresPermission: "view-hires" },
      component: () => import("@/views/recruitment/HiresList.vue"),
    },
    {
      path: "hires/:id",
      name: "recruitment-hire-detail",
      meta: { requiresPermission: "view-hires" },
      component: () => import("@/views/recruitment/HireDetail.vue"),
    },
    {
      path: "interview-stages",
      name: "recruitment-interview-stages",
      meta: { requiresPermission: "view-interview-stages" },
      component: () => import("@/views/recruitment/InterviewStagesConfig.vue"),
    },
    {
      path: "reports",
      name: "recruitment-reports",
      meta: { requiresPermission: "view-recruitment-reports" },
      component: () => import("@/views/recruitment/ReportsList.vue"),
    },
  ],
};
