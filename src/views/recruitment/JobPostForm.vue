<template>
  <div class="space-y-6 animate-fade-in max-w-3xl mx-auto">

    <!-- Header -->
    <div class="flex items-center gap-3">
      <button @click="$router.back()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
        <ArrowLeft class="w-5 h-5 text-gray-500" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit ? 'Edit Job Post' : 'New Job Post' }}
        </h1>
        <p class="text-gray-500 text-sm mt-0.5">
          {{ isEdit ? 'Update the details of this job listing' : 'Create a job listing from an approved job request' }}
        </p>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

      <!-- Job Request Link (Disabled on Edit) -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Approved Job Request <span class="text-red-500">*</span></label>
        <select
          v-model="form.job_request_id"
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          :disabled="isEdit"
          @change="onJobRequestChange"
        >
          <option value="">Select an approved request...</option>
          <option
            v-for="req in approvedRequests"
            :key="req.id"
            :value="req.id"
          >
            Req #{{ req.id }} - {{ req.position?.name }} ({{ req.department?.department_name || req.department?.name }}) - Count: {{ req.requested_count }}
          </option>
        </select>
        <p v-if="!isEdit && approvedRequests.length === 0" class="text-xs text-amber-600 mt-1">
          No approved job requests available. Approve a job request first.
        </p>
      </div>

      <!-- Title + Slug -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Job Title <span class="text-red-500">*</span></label>
          <input
            v-model="form.title"
            type="text"
            placeholder="e.g. Senior Backend Developer"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            @input="generateSlug"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Slug <span class="text-red-500">*</span></label>
          <input
            v-model="form.slug"
            type="text"
            placeholder="e.g. senior-backend-developer"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-gray-50/50"
          />
        </div>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Job Description</label>
        <textarea
          v-model="form.description"
          rows="6"
          placeholder="Detailed role description, responsibilities, requirements..."
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <!-- Employment Type + Location -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Employment Type <span class="text-red-500">*</span></label>
          <select
            v-model="form.employment_type"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">Select type...</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
          <input
            v-model="form.location"
            type="text"
            placeholder="e.g. Cairo, Egypt or Remote"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <!-- Salary range -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Minimum Salary <span class="text-xs text-gray-400">(optional)</span></label>
          <input
            v-model.number="form.salary_min"
            type="number"
            min="0"
            placeholder="e.g. 10000"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Maximum Salary <span class="text-xs text-gray-400">(optional)</span></label>
          <input
            v-model.number="form.salary_max"
            type="number"
            min="0"
            placeholder="e.g. 15000"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <!-- Deadline -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Application Deadline <span class="text-xs text-gray-400">(optional)</span></label>
        <input
          v-model="form.deadline"
          type="date"
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <!-- Validation Error -->
      <p v-if="validationError" class="text-sm text-red-500 flex items-center gap-1.5">
        <AlertTriangle class="w-4 h-4" /> {{ validationError }}
      </p>

      <!-- Submit buttons -->
      <div class="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          @click="$router.back()"
          class="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          :disabled="store.submitting"
          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          <span v-if="store.submitting" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          {{ isEdit ? 'Save Changes' : 'Create Job Post' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, AlertTriangle } from 'lucide-vue-next';
import { useJobPostsStore } from '@/stores/recruitment/jobPostsStore';
import { useJobRequestsStore } from '@/stores/recruitment/jobRequestsStore';

const route = useRoute();
const router = useRouter();

const store = useJobPostsStore();
const requestsStore = useJobRequestsStore();

// ── Mode ──────────────────────────────────────────────────────────────────
const isEdit = computed(() => !!route.params.id);

// ── Approved Requests list ────────────────────────────────────────────────
const approvedRequests = computed(() =>
  requestsStore.requests.filter(r => r.status === 'approved')
);

// ── Form State ────────────────────────────────────────────────────────────
const form = reactive({
  job_request_id: '',
  title: '',
  slug: '',
  description: '',
  employment_type: '',
  salary_min: '',
  salary_max: '',
  location: '',
  deadline: '',
});

const validationError = ref('');

// ── Slug Generator ────────────────────────────────────────────────────────
const generateSlug = () => {
  if (isEdit.value) return; // Don't auto-regenerate on edit
  form.slug = form.title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-alphanumeric chars
    .replace(/[\s_]+/g, '-')   // replace spaces/underscores with hyphen
    .replace(/^-+|-+$/g, '');  // trim leading/trailing hyphens
};

// ── Dropdown selection handler ───────────────────────────────────────────
const onJobRequestChange = () => {
  const selectedReq = approvedRequests.value.find(r => r.id === form.job_request_id);
  if (selectedReq) {
    form.title = selectedReq.position?.name ? `${selectedReq.position.name}` : '';
    form.employment_type = selectedReq.employment_type || '';
    form.salary_min = selectedReq.budget_salary_from || '';
    form.salary_max = selectedReq.budget_salary_to || '';
    form.location = selectedReq.branch?.name || '';
    generateSlug();
  }
};

// ── Validation ────────────────────────────────────────────────────────────
const validate = () => {
  if (!form.job_request_id) return 'Approved Job Request is required.';
  if (!form.title.trim()) return 'Job Title is required.';
  if (!form.slug.trim()) return 'Slug is required.';
  if (!form.employment_type) return 'Employment Type is required.';
  if (form.salary_min && form.salary_max && form.salary_min > form.salary_max) {
    return 'Minimum salary cannot exceed maximum salary.';
  }
  return '';
};

// ── Save ──────────────────────────────────────────────────────────────────
const handleSave = async () => {
  validationError.value = validate();
  if (validationError.value) return;

  const payload = { ...form };
  if (!payload.salary_min) delete payload.salary_min;
  if (!payload.salary_max) delete payload.salary_max;
  if (!payload.deadline) delete payload.deadline;

  if (isEdit.value) {
    await store.updatePost(route.params.id, payload);
  } else {
    await store.createPost(payload);
  }
  router.push({ name: 'recruitment-job-posts' });
};

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  await requestsStore.fetchRequests();

  if (isEdit.value) {
    const post = await store.fetchPost(route.params.id);
    if (post) {
      Object.assign(form, {
        job_request_id: post.job_request_id || '',
        title: post.title || '',
        slug: post.slug || '',
        description: post.description || '',
        employment_type: post.employment_type || '',
        salary_min: post.salary_min || '',
        salary_max: post.salary_max || '',
        location: post.location || '',
        deadline: post.deadline || '',
      });
    }
  }
});
</script>
