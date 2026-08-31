<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <GitPullRequest class="w-6 h-6 text-indigo-500" />
          Applications
        </h1>
        <p class="text-gray-500 mt-1 text-sm">Track applicant pipelines, screen profiles, assign recruiters, and advance stages</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="authStore.can('create-applications')"
          @click="openAddModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-semibold cursor-pointer"
        >
          <Plus class="w-4 h-4" /> Add Application
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="search"
          type="text"
          placeholder="Search candidate name..."
          class="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-60 bg-white"
        />
      </div>

      <select
        v-model="statusFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="rejected">Rejected</option>
        <option value="withdrawn">Withdrawn</option>
        <option value="hired">Hired</option>
      </select>

      <select
        v-model="stageFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      >
        <option value="">All Pipeline Stages</option>
        <option v-for="stg in stages" :key="stg.id" :value="stg.id">{{ stg.name }}</option>
      </select>

      <select
        v-model="jobFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      >
        <option value="">All Job Posts</option>
        <option v-for="post in posts" :key="post.id" :value="post.id">{{ post.title }}</option>
      </select>

      <button
        v-if="statusFilter || stageFilter || jobFilter || search"
        @click="clearFilters"
        class="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
      >
        <X class="w-3.5 h-3.5" /> Clear
      </button>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      <!-- Loading -->
      <div v-if="store.loading" class="flex justify-center items-center h-48">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center h-48 text-gray-400">
        <GitPullRequest class="w-10 h-10 mb-2 opacity-30" />
        <p class="text-sm font-medium">No applications found</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">#</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Candidate</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Job Position</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Assigned Recruiter</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Current Stage</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Applied Date</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(app, idx) in filtered"
              :key="app.id"
              class="hover:bg-gray-50/40 transition-colors"
            >
              <td class="px-4 py-3.5 text-gray-400 text-xs font-medium">{{ idx + 1 }}</td>

              <!-- Candidate -->
              <td class="px-4 py-3.5">
                <div class="font-bold text-gray-900" v-if="app.candidate">
                  {{ app.candidate.name || `${app.candidate.firstname || ''} ${app.candidate.lastname || ''}`.trim() }}
                  <p class="text-[10px] text-gray-400 font-normal mt-0.5">{{ app.candidate.email }}</p>
                </div>
                <span v-else class="text-gray-400">—</span>
              </td>

              <!-- Job Post -->
              <td class="px-4 py-3.5 font-semibold text-gray-700">
                {{ app.job_post?.title || '—' }}
              </td>

              <!-- Recruiter -->
              <td class="px-4 py-3.5 text-gray-600">
                <span v-if="app.assigned_recruiter" class="inline-flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-gray-400" />
                  {{ app.assigned_recruiter.name }}
                </span>
                <span v-else class="text-gray-300">Unassigned</span>
              </td>

              <!-- Current Pipeline Stage -->
              <td class="px-4 py-3.5 text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {{ (app.stage || app.current_stage)?.name || 'Screening' }}
                </span>
              </td>

              <!-- Status -->
              <td class="px-4 py-3.5 text-center">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
                  :class="store.statusMeta(app.status).cls"
                >
                  {{ store.statusMeta(app.status).label }}
                </span>
              </td>

              <!-- Applied Date -->
              <td class="px-4 py-3.5 text-gray-500 text-xs">
                {{ formatDate(app.created_at || app.applied_date) }}
              </td>

              <!-- Actions -->
              <td class="px-4 py-3.5">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- Details -->
                  <button
                    @click="$router.push({ name: 'recruitment-application-details', params: { id: app.id } })"
                    class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="View details & pipeline"
                  >
                    <Eye class="w-4 h-4" />
                  </button>

                  <!-- Delete -->
                  <button
                    v-if="authStore.can('delete-applications')"
                    @click="openDeleteConfirm(app.id)"
                    class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Application"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Application Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showAddModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <GitPullRequest class="w-5 h-5 text-indigo-500" /> Register Candidate Application
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Select Candidate <span class="text-red-500">*</span></label>
            <select
              v-model="form.candidate_id"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="">Choose candidate...</option>
              <option v-for="cand in candidates" :key="cand.id" :value="cand.id">
                {{ cand.name || `${cand.firstname || ''} ${cand.lastname || ''}`.trim() }} ({{ cand.email }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Select Published Job <span class="text-red-500">*</span></label>
            <select
              v-model="form.job_post_id"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="">Choose job post...</option>
              <option v-for="p in publishedPosts" :key="p.id" :value="p.id">
                {{ p.title }} ({{ p.location || 'Remote' }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Assign Recruiter <span class="text-xs text-gray-400">(optional)</span></label>
            <select
              v-model="form.assigned_recruiter_id"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="">Select recruiter...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ employeeName(emp) }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              v-model="form.notes"
              rows="2"
              placeholder="Application registration comments..."
              class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>
        </div>

        <p v-if="validationError" class="text-xs text-red-500">{{ validationError }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showAddModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            @click="confirmAdd"
            :disabled="store.submitting"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Register
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div
      v-if="deleteTargetId"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="deleteTargetId = null"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
        <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <Trash2 class="w-7 h-7 text-red-500" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">Delete Application?</h3>
        <p class="text-sm text-gray-500">This action will remove the applicant from the active pipeline.</p>
        <div class="flex justify-center gap-3">
          <button @click="deleteTargetId = null" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            @click="confirmDelete"
            :disabled="store.loading"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import {
  GitPullRequest, Plus, Search, Eye, Trash2, X, User
} from 'lucide-vue-next';
import { useApplicationsStore } from '@/stores/recruitment/applicationsStore';
import { useJobPostsStore } from '@/stores/recruitment/jobPostsStore';
import { useCandidatesStore } from '@/stores/recruitment/candidatesStore';
import { useInterviewStagesStore } from '@/stores/recruitment/interviewStagesStore';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useAuthStore } from '@/stores/auth';

const store = useApplicationsStore();
const postsStore = useJobPostsStore();
const candidatesStore = useCandidatesStore();
const stagesStore = useInterviewStagesStore();
const employeesStore = useHrEmployeesStore();
const authStore = useAuthStore();

// ── Dropdowns ─────────────────────────────────────────────────────────────
const posts = computed(() => postsStore.posts);
const publishedPosts = computed(() => postsStore.posts.filter(p => p.status === 'published'));
const candidates = computed(() => candidatesStore.candidates);
const stages = computed(() => stagesStore.stages);
const employees = computed(() => employeesStore.employees);

const employeeName = (emp) => {
  const pi = emp?.personal_info || {};
  const joined = [pi.first_name, pi.last_name].filter(Boolean).join(" ").trim();
  const name = joined || String(emp?.name || "").trim() || `Employee #${emp?.id ?? "-"}`;
  const fp = emp?.fingerprint ?? emp?.fingerPrint ?? pi?.fingerprint ?? pi?.fingerPrint ?? emp?.user?.fingerPrint;
  return fp ? `${name} (${fp})` : name;
};

// ── Filters ───────────────────────────────────────────────────────────────
const search = ref('');
const statusFilter = ref('');
const stageFilter = ref('');
const jobFilter = ref('');

const clearFilters = () => {
  search.value = '';
  statusFilter.value = '';
  stageFilter.value = '';
  jobFilter.value = '';
};

// ── Filtered List ─────────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = store.applications;
  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter(a => {
      const name = a.candidate?.name || `${a.candidate?.firstname || ''} ${a.candidate?.lastname || ''}`.trim();
      return name.toLowerCase().includes(q);
    });
  }
  if (statusFilter.value) list = list.filter(a => a.status === statusFilter.value);
  if (stageFilter.value) list = list.filter(a => (a.stage || a.current_stage)?.id === Number(stageFilter.value));
  if (jobFilter.value) list = list.filter(a => a.job_post?.id === Number(jobFilter.value));
  return list;
});

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Add Modal State ────────────────────────────────────────────────────────
const showAddModal = ref(false);
const form = reactive({
  candidate_id: '',
  job_post_id: '',
  assigned_recruiter_id: '',
  notes: '',
});
const validationError = ref('');

const openAddModal = () => {
  Object.assign(form, { candidate_id: '', job_post_id: '', assigned_recruiter_id: '', notes: '' });
  validationError.value = '';
  showAddModal.value = true;
};

const confirmAdd = async () => {
  if (!form.candidate_id) { validationError.value = 'Candidate is required.'; return; }
  if (!form.job_post_id) { validationError.value = 'Job post is required.'; return; }
  
  await store.createApplication({
    candidate_id: form.candidate_id,
    job_post_id: form.job_post_id,
    assigned_recruiter_id: form.assigned_recruiter_id || null,
    notes: form.notes,
  });
  showAddModal.value = false;
};

// ── Delete ────────────────────────────────────────────────────────────────
const deleteTargetId = ref(null);
const openDeleteConfirm = (id) => { deleteTargetId.value = id; };
const confirmDelete = async () => {
  await store.deleteApplication(deleteTargetId.value);
  deleteTargetId.value = null;
};

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    store.fetchApplications(),
    postsStore.fetchPosts(),
    candidatesStore.fetchCandidates(),
    stagesStore.fetchStages(),
    employeesStore.getEmployees(),
  ]);
});
</script>
