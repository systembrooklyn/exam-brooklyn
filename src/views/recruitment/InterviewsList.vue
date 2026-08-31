<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar class="w-6 h-6 text-indigo-500" />
          Scheduled Interviews
        </h1>
        <p class="text-gray-500 mt-1 text-sm">Monitor and manage all candidate pipeline interviews across departments</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
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
        v-model="resultFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      >
        <option value="">All Results</option>
        <option value="pending">Pending</option>
        <option value="passed">Passed</option>
        <option value="rejected">Rejected</option>
        <option value="no_show">No Show</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <input
        v-model="dateFilter"
        type="date"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      />

      <button
        v-if="resultFilter || dateFilter || search"
        @click="clearFilters"
        class="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
      >
        <X class="w-3.5 h-3.5" /> Clear Filters
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
        <Calendar class="w-10 h-10 mb-2 opacity-30" />
        <p class="text-sm font-medium">No scheduled interviews found</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Candidate</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Job Position</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Stage</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Scheduled Date</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Interviewer</th>
              <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Result</th>
              <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="iv in filtered" :key="iv.id" class="hover:bg-gray-50/40 transition-colors">
              <!-- Candidate -->
              <td class="px-5 py-4">
                <router-link
                  v-if="iv.application_id"
                  :to="{ name: 'recruitment-application-details', params: { id: iv.application_id } }"
                  class="font-bold text-indigo-600 hover:underline block"
                >
                  {{ candidateName(iv) }}
                </router-link>
                <span v-else class="font-bold text-gray-900">{{ candidateName(iv) }}</span>
                <span class="text-xs text-gray-400 block mt-0.5">{{ iv.application?.candidate?.email || iv.email || appStore.applications.find(a => a.id === iv.application_id)?.candidate?.email || '' }}</span>
              </td>

              <!-- Job -->
              <td class="px-5 py-4 text-gray-700">
                {{ iv.application?.job_post?.title || appStore.applications.find(a => a.id === iv.application_id)?.job_post?.title || '—' }}
              </td>

              <!-- Stage -->
              <td class="px-5 py-4 font-medium text-gray-800">
                {{ iv.stage_snapshot_name || iv.interview_stage?.name || '—' }}
              </td>

              <!-- Scheduled Date -->
              <td class="px-5 py-4 text-gray-600 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5">
                  <Clock class="w-3.5 h-3.5 text-gray-400" />
                  {{ formatDate(iv.scheduled_at, true) }}
                </span>
              </td>

              <!-- Interviewer -->
              <td class="px-5 py-4 text-gray-700">
                {{ iv.interviewer?.name || '—' }}
              </td>

              <!-- Result Badge -->
              <td class="px-5 py-4 text-center">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border"
                  :class="resultBadge(iv.result).cls"
                >
                  {{ resultBadge(iv.result).label }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-5 py-4">
                <div class="flex items-center justify-center gap-2">
                  <template v-if="iv.result === 'pending'">
                    <button
                      v-if="authStore.can('schedule-interviews')"
                      @click="openRescheduleModal(iv)"
                      class="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg border border-amber-200/50 transition-colors cursor-pointer"
                    >
                      Reschedule
                    </button>
                    <button
                      v-if="authStore.can('submit-interview-results')"
                      @click="openResultModal(iv)"
                      class="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Result
                    </button>
                  </template>
                  <button
                    v-if="authStore.can('delete-interviews')"
                    @click="handleDelete(iv.id)"
                    class="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Interview"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Reschedule Modal -->
    <div
      v-if="showRescheduleModal"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showRescheduleModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 animate-scale-up">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Clock class="w-5 h-5 text-amber-500" /> Reschedule Interview
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Interview Stage</label>
            <input
              type="text"
              disabled
              :value="rescheduleForm.stage_name"
              class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-400 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Scheduled At <span class="text-red-500">*</span></label>
              <input
                v-model="rescheduleForm.scheduled_at"
                type="datetime-local"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Interviewer <span class="text-red-500">*</span></label>
              <select
                v-model="rescheduleForm.interviewer_id"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
              >
                <option value="">Select employee...</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ employeeName(emp) }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Meeting Link <span class="text-xs text-gray-400">(optional)</span></label>
              <input
                v-model="rescheduleForm.meeting_link"
                type="url"
                placeholder="https://meet.google.com/..."
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Location / Office <span class="text-xs text-gray-400">(optional)</span></label>
              <input
                v-model="rescheduleForm.location"
                type="text"
                placeholder="e.g. Cairo Headquarters"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showRescheduleModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            @click="confirmReschedule"
            :disabled="!rescheduleForm.scheduled_at || !rescheduleForm.interviewer_id || store.loading"
            class="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>

    <!-- Submit Interview Result Modal -->
    <div
      v-if="showResultModal"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showResultModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 animate-scale-up">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 class="w-5 h-5 text-emerald-600" /> Submit Interview Result
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Result Outcome <span class="text-red-500">*</span></label>
            <select
              v-model="resultForm.result"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="passed">Passed</option>
              <option value="rejected">Rejected</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Evaluation Score (0 - 100)</label>
            <input
              v-model.number="resultForm.score"
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 85"
              class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Interviewer Feedback</label>
            <textarea
              v-model="resultForm.feedback"
              rows="3"
              placeholder="Strengths, weaknesses, alignment comments..."
              class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showResultModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            @click="confirmSubmitResult"
            :disabled="store.loading"
            class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { Calendar, Search, Trash2, Clock, User, CheckCircle2, MapPin, Globe, X } from 'lucide-vue-next';
import { useInterviewsStore } from '@/stores/recruitment/interviewsStore';
import { useApplicationsStore } from '@/stores/recruitment/applicationsStore';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useAuthStore } from '@/stores/auth';

const store = useInterviewsStore();
const appStore = useApplicationsStore();
const employeesStore = useHrEmployeesStore();
const authStore = useAuthStore();

const search = ref('');
const resultFilter = ref('');
const dateFilter = ref('');

const employees = computed(() => employeesStore.employees);

const clearFilters = () => {
  search.value = '';
  resultFilter.value = '';
  dateFilter.value = '';
};

const candidateName = (iv) => {
  const appObj = appStore.applications.find(a => a.id === iv.application_id);
  const c = iv.application?.candidate || iv.candidate || appObj?.candidate;
  if (!c) return '—';
  return c.name || `${c.firstname || ''} ${c.lastname || ''}`.trim() || '—';
};

const employeeName = (emp) => {
  const pi = emp?.personal_info || {};
  const joined = [pi.first_name, pi.last_name].filter(Boolean).join(" ").trim();
  return joined || String(emp?.name || "").trim() || `Employee #${emp?.id ?? "-"}`;
};

const formatDate = (d, includeTime = false) => {
  if (!d) return '—';
  const opt = { day: '2-digit', month: 'short', year: 'numeric' };
  if (includeTime) {
    opt.hour = '2-digit';
    opt.minute = '2-digit';
  }
  return new Date(d).toLocaleDateString('en-GB', opt);
};

const resultBadge = (res) => {
  const map = {
    pending:   { label: 'Pending',   cls: 'bg-amber-50 text-amber-600 border-amber-200' },
    passed:    { label: 'Passed',    cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    rejected:  { label: 'Rejected',  cls: 'bg-red-50 text-red-600 border-red-200' },
    no_show:   { label: 'No Show',   cls: 'bg-purple-50 text-purple-600 border-purple-200' },
    cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  };
  return map[res] ?? { label: res, cls: 'bg-gray-100 text-gray-500 border-gray-200' };
};

const filtered = computed(() => {
  let list = store.interviews;
  if (search.value) {
    const q = search.value.toLowerCase().trim();
    list = list.filter(iv => {
      const name = candidateName(iv).toLowerCase();
      return name.includes(q);
    });
  }
  if (resultFilter.value) {
    list = list.filter(iv => iv.result === resultFilter.value);
  }
  if (dateFilter.value) {
    const d = dateFilter.value; // YYYY-MM-DD
    list = list.filter(iv => iv.scheduled_at && iv.scheduled_at.startsWith(d));
  }
  return list;
});

// ── Actions ───────────────────────────────────────────────────────────────
const handleDelete = async (id) => {
  if (!confirm('Are you sure you want to delete this scheduled interview?')) return;
  await store.deleteInterview(id);
};

// Reschedule
const showRescheduleModal = ref(false);
const activeRescheduleId = ref(null);
const rescheduleForm = reactive({
  stage_name: '',
  scheduled_at: '',
  interviewer_id: '',
  meeting_link: '',
  location: '',
});

const openRescheduleModal = (iv) => {
  activeRescheduleId.value = iv.id;
  let formattedDate = '';
  if (iv.scheduled_at) {
    const dt = new Date(iv.scheduled_at);
    const tzOffset = dt.getTimezoneOffset() * 60000;
    formattedDate = (new Date(dt.getTime() - tzOffset)).toISOString().slice(0, 16);
  }
  Object.assign(rescheduleForm, {
    stage_name: iv.stage_snapshot_name || iv.interview_stage?.name || 'Interview',
    scheduled_at: formattedDate,
    interviewer_id: iv.interviewer?.id || iv.interviewer_id || '',
    meeting_link: iv.meeting_link || '',
    location: iv.location || '',
  });
  showRescheduleModal.value = true;
};

const confirmReschedule = async () => {
  await store.rescheduleInterview(activeRescheduleId.value, {
    scheduled_at: rescheduleForm.scheduled_at,
    interviewer_id: rescheduleForm.interviewer_id,
    meeting_link: rescheduleForm.meeting_link,
    location: rescheduleForm.location,
  });
  showRescheduleModal.value = false;
  await store.fetchInterviews();
};

// Result modal
const showResultModal = ref(false);
const activeInterviewId = ref(null);
const resultForm = reactive({
  result: 'passed',
  score: '',
  feedback: '',
});

const openResultModal = (iv) => {
  activeInterviewId.value = iv.id;
  Object.assign(resultForm, { result: 'passed', score: '', feedback: '' });
  showResultModal.value = true;
};

const confirmSubmitResult = async () => {
  await store.submitResult(activeInterviewId.value, { ...resultForm });
  showResultModal.value = false;
  await store.fetchInterviews();
};

onMounted(async () => {
  await Promise.all([
    store.fetchInterviews(),
    appStore.fetchApplications(),
    employeesStore.getEmployees(),
  ]);
});
</script>
