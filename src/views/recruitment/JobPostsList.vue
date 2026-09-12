<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Briefcase class="w-6 h-6 text-indigo-500" />
          Job Posts
        </h1>
        <p class="text-gray-500 mt-1 text-sm">Create and publish job listings to public portals and social media</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="authStore.can('create-job-posts')"
          @click="$router.push({ name: 'recruitment-job-post-create' })"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-semibold cursor-pointer"
        >
          <Plus class="w-4 h-4" /> New Job Post
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
          placeholder="Search job title, location..."
          class="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-60 bg-white"
        />
      </div>

      <select
        v-model="statusFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      >
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="closed">Closed</option>
        <option value="archived">Archived</option>
      </select>

      <select
        v-model="typeFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      >
        <option value="">All Job Types</option>
        <option value="full_time">Full Time</option>
        <option value="part_time">Part Time</option>
        <option value="contract">Contract</option>
        <option value="internship">Internship</option>
        <option value="freelance">Freelance</option>
      </select>

      <button
        v-if="statusFilter || typeFilter || search"
        @click="clearFilters"
        class="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
      >
        <X class="w-3.5 h-3.5" /> Clear
      </button>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      <!-- Loading -->
      <div v-if="listLoading" class="flex justify-center items-center h-48">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center h-48 text-gray-400">
        <Briefcase class="w-10 h-10 mb-2 opacity-30" />
        <p class="text-sm font-medium">No job posts found</p>
        <p v-if="authStore.can('create-job-posts')" class="text-xs mt-1">
          <button class="text-indigo-500 hover:underline" @click="$router.push({ name: 'recruitment-job-post-create' })">Create the first one</button>
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">#</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Title</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Location</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Salary (EGP)</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Deadline</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(post, idx) in filtered"
              :key="post.id"
              class="hover:bg-gray-50/40 transition-colors"
            >
              <td class="px-4 py-3.5 text-gray-400 text-xs font-medium">{{ idx + 1 }}</td>

              <!-- Title -->
              <td class="px-4 py-3.5 font-semibold text-gray-900">
                <div>
                  <div class="flex items-center gap-1.5">
                    <button
                      @click="openDetailsModal(post.id)"
                      class="cursor-pointer hover:text-indigo-600 hover:underline transition-colors text-left font-semibold focus:outline-none"
                      :disabled="detailsLoadingId !== null"
                    >
                      {{ post.title }}
                    </button>
                    <span
                      v-if="detailsLoadingId === post.id"
                      class="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin flex-shrink-0"
                    />
                  </div>
                  <p class="text-[10px] text-gray-400 font-normal mt-0.5">Slug: {{ post.slug }}</p>
                </div>
              </td>

              <!-- Location -->
              <td class="px-4 py-3.5 text-gray-600">
                <span class="inline-flex items-center gap-1">
                  <MapPin class="w-3.5 h-3.5 text-gray-400" />
                  {{ post.location || 'Remote' }}
                </span>
              </td>

              <!-- Employment Type -->
              <td class="px-4 py-3.5 text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap">
                  {{ formatEnumLabel(post.employment_type) }}
                </span>
              </td>

              <!-- Salary range -->
              <td class="px-4 py-3.5 text-center font-medium text-gray-700 whitespace-nowrap">
                <span v-if="post.salary_min || post.salary_max">
                  {{ post.salary_min ? formatNumber(post.salary_min) : '0' }}–{{ post.salary_max ? formatNumber(post.salary_max) : '∞' }}
                </span>
                <span v-else class="text-gray-300">—</span>
              </td>

              <!-- Status Badge -->
              <td class="px-4 py-3.5 text-center">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
                  :class="store.statusMeta(post.status).cls"
                >
                  <component :is="statusIcon(post.status)" class="w-3 h-3" />
                  {{ store.statusMeta(post.status).label }}
                </span>
              </td>

              <!-- Deadline -->
              <td class="px-4 py-3.5 text-gray-500 text-xs">
                {{ post.deadline ? formatDate(post.deadline) : 'No Deadline' }}
              </td>

              <!-- Actions -->
              <td class="px-4 py-3.5">
                <div class="flex items-center justify-center gap-1.5">

                  <!-- Publish (draft only) -->
                  <button
                    v-if="post.status === 'draft' && authStore.can('publish-job-posts')"
                    @click="openPublishModal(post)"
                    class="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    title="Publish Job Post"
                  >
                    <Send class="w-3 h-3" /> Publish
                  </button>

                  <!-- Close (published/draft) -->
                  <button
                    v-if="(post.status === 'published' || post.status === 'draft') && authStore.can('close-job-posts')"
                    @click="handleClose(post.id)"
                    :disabled="store.submitting"
                    class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Close Job Post"
                  >
                    <XCircle class="w-4 h-4" />
                  </button>

                  <!-- Archive (closed) -->
                  <button
                    v-if="post.status === 'closed' && authStore.can('archive-job-posts')"
                    @click="handleArchive(post.id)"
                    :disabled="store.submitting"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Archive Job Post"
                  >
                    <Archive class="w-4 h-4" />
                  </button>

                  <!-- Edit (draft only) -->
                  <button
                    v-if="post.status === 'draft' && authStore.can('update-job-posts')"
                    @click="$router.push({ name: 'recruitment-job-post-edit', params: { id: post.id } })"
                    class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit class="w-3.5 h-3.5" />
                  </button>

                  <!-- Delete (draft only) -->
                  <button
                    v-if="post.status === 'draft' && authStore.can('delete-job-posts')"
                    @click="openDeleteConfirm(post.id)"
                    class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
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

    <!-- Publish Platforms Modal -->
    <div
      v-if="showPublishModal"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showPublishModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Globe class="w-5 h-5 text-emerald-500" /> Publish Job Post
        </h3>
        <p class="text-sm text-gray-500">Select the platforms where this job should be visible:</p>

        <div class="space-y-3">
          <div
            v-for="(plat, idx) in selectedPlatforms"
            :key="idx"
            class="flex items-center justify-between border border-gray-100 rounded-xl p-3 bg-gray-50/50"
          >
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                v-model="plat.checked"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span class="text-sm font-semibold text-gray-700">{{ plat.name }}</span>
            </div>
            <select
              v-if="plat.checked"
              v-model="plat.method"
              class="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-600 bg-white"
            >
              <option value="automatic">Automatic</option>
              <option value="copy_text">Copy Text</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showPublishModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            @click="confirmPublish"
            :disabled="!hasCheckedPlatforms || store.submitting"
            class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Confirm Publish
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
        <h3 class="text-lg font-bold text-gray-900">Delete Job Post?</h3>
        <p class="text-sm text-gray-500">This action cannot be undone.</p>
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

    <!-- Job Post Details Modal -->
    <div
      v-if="showDetailsModal && detailsPost"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      @click.self="showDetailsModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-indigo-50/30 to-white">
          <div>
            <h3 class="text-xl font-bold text-gray-900">{{ detailsPost.title }}</h3>
            <div class="flex flex-wrap items-center gap-2 mt-2">
              <span
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border"
                :class="store.statusMeta(detailsPost.status).cls"
              >
                <component :is="statusIcon(detailsPost.status)" class="w-3 h-3" />
                {{ store.statusMeta(detailsPost.status).label }}
              </span>
              <span class="text-xs text-gray-400 font-medium">Slug: {{ detailsPost.slug }}</span>
            </div>
          </div>
          <button @click="showDetailsModal = false" class="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Content (Scrollable) -->
        <div class="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-gray-600">
          
          <!-- Key details grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <div>
              <span class="block text-xs text-gray-400 font-semibold uppercase tracking-wider">Location</span>
              <span class="font-bold text-gray-800 flex items-center gap-1 mt-1">
                <MapPin class="w-3.5 h-3.5 text-indigo-500" />
                {{ detailsPost.location || 'Remote' }}
              </span>
            </div>
            <div>
              <span class="block text-xs text-gray-400 font-semibold uppercase tracking-wider">Type</span>
              <span class="font-bold text-gray-800 block mt-1 capitalize">{{ formatEnumLabel(detailsPost.employment_type) }}</span>
            </div>
            <div>
              <span class="block text-xs text-gray-400 font-semibold uppercase tracking-wider">Salary (EGP)</span>
              <span class="font-bold text-gray-800 block mt-1" v-if="detailsPost.salary_min || detailsPost.salary_max">
                {{ detailsPost.salary_min ? formatNumber(detailsPost.salary_min) : '0' }}–{{ detailsPost.salary_max ? formatNumber(detailsPost.salary_max) : '∞' }}
              </span>
              <span class="font-bold text-gray-400 block mt-1" v-else>—</span>
            </div>
            <div>
              <span class="block text-xs text-gray-400 font-semibold uppercase tracking-wider">Deadline</span>
              <span class="font-bold text-gray-800 block mt-1">
                {{ detailsPost.deadline ? formatDate(detailsPost.deadline) : 'No Deadline' }}
              </span>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Job Description</h4>
            <div class="bg-gray-50/30 p-4 rounded-xl border border-gray-100/60 whitespace-pre-wrap leading-relaxed text-gray-700">
              {{ detailsPost.description || 'No description provided.' }}
            </div>
          </div>

          <!-- Requirements Snapshot -->
          <div class="space-y-2" v-if="detailsPost.requirements_snapshot && detailsPost.requirements_snapshot.length">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Job Requirements</h4>
            <ul class="list-disc pl-5 space-y-1 text-gray-700">
              <li v-for="(req, rIdx) in detailsPost.requirements_snapshot" :key="rIdx">{{ req }}</li>
            </ul>
          </div>

          <!-- Associated Job Request details -->
          <!-- <div class="space-y-3 border-t border-gray-100 pt-5" v-if="detailsPost.job_request">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Associated Job Request Info</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span class="text-gray-400 block">Department</span>
                <span class="font-semibold text-gray-700 mt-0.5 block">
                  {{ detailsPost.job_request.department?.department_name || detailsPost.job_request.department?.name || '—' }}
                </span>
              </div>
              <div>
                <span class="text-gray-400 block">Requested By</span>
                <span class="font-semibold text-gray-700 mt-0.5 block">
                  {{ detailsPost.job_request.requested_by_employee?.personal_info?.first_name || detailsPost.job_request.requested_by_employee?.name || '—' }}
                </span>
              </div>
              <div>
                <span class="text-gray-400 block">Priority</span>
                <span class="font-semibold text-gray-700 mt-0.5 block capitalize">{{ detailsPost.job_request.priority }}</span>
              </div>
              <div>
                <span class="text-gray-400 block">Requested Count</span>
                <span class="font-semibold text-gray-700 mt-0.5 block">{{ detailsPost.job_request.requested_count }} position(s)</span>
              </div>
            </div>
            <div class="text-xs mt-2" v-if="detailsPost.job_request.reason">
              <span class="text-gray-400 block">Reason for hiring</span>
              <p class="text-gray-700 mt-1 bg-gray-50 p-2.5 rounded-lg border border-gray-100/60">{{ detailsPost.job_request.reason }}</p>
            </div>
          </div> -->

        </div>

        <!-- Footer Actions -->
        <div class="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2.5">
          <button @click="showDetailsModal = false" class="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
            Close
          </button>

          <!-- Edit (draft only) -->
          <button
            v-if="detailsPost.status === 'draft' && authStore.can('update-job-posts')"
            @click="detailsPostAction(() => $router.push({ name: 'recruitment-job-post-edit', params: { id: detailsPost.id } }))"
            class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Edit class="w-3.5 h-3.5" /> Edit Post
          </button>

          <!-- Publish (draft only) -->
          <button
            v-if="detailsPost.status === 'draft' && authStore.can('publish-job-posts')"
            @click="detailsPostAction(() => openPublishModal(detailsPost))"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Send class="w-3.5 h-3.5" /> Publish Post
          </button>

          <!-- Close Post (published/draft) -->
          <button
            v-if="(detailsPost.status === 'published' || detailsPost.status === 'draft') && authStore.can('close-job-posts')"
            @click="detailsPostAction(() => handleClose(detailsPost.id))"
            class="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/50 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <XCircle class="w-3.5 h-3.5" /> Close Post
          </button>

          <!-- Archive Post (closed) -->
          <button
            v-if="detailsPost.status === 'closed' && authStore.can('archive-job-posts')"
            @click="detailsPostAction(() => handleArchive(detailsPost.id))"
            class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Archive class="w-3.5 h-3.5" /> Archive Post
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  Briefcase, Plus, Search, MapPin, X, FileText, Send, XCircle,
  Archive, Edit, Trash2, Globe, CheckCircle, Clock
} from 'lucide-vue-next';
import { useJobPostsStore } from '@/stores/recruitment/jobPostsStore';
import { useAuthStore } from '@/stores/auth';

const store = useJobPostsStore();
const authStore = useAuthStore();

// ── Job Post Details ──────────────────────────────────────────────────────
const showDetailsModal = ref(false);
const detailsPost = computed(() => store.currentPost);
const detailsLoadingId = ref(null);

const openDetailsModal = async (id) => {
  detailsLoadingId.value = id;
  try {
    await store.fetchPost(id);
    showDetailsModal.value = true;
  } finally {
    detailsLoadingId.value = null;
  }
};

const detailsPostAction = (actionCallback) => {
  showDetailsModal.value = false;
  actionCallback();
};

// ── Filters ───────────────────────────────────────────────────────────────
const search = ref('');
const statusFilter = ref('');
const typeFilter = ref('');

const clearFilters = () => {
  search.value = '';
  statusFilter.value = '';
  typeFilter.value = '';
};

// ── Filtered List ─────────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = store.posts;
  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q)
    );
  }
  if (statusFilter.value) list = list.filter(p => p.status === statusFilter.value);
  if (typeFilter.value) list = list.filter(p => p.employment_type === typeFilter.value);
  return list;
});

// ── Status Icon ───────────────────────────────────────────────────────────
const statusIcon = (status) => {
  const map = {
    draft: FileText,
    published: Send,
    closed: XCircle,
    archived: Archive
  };
  return map[status] ?? FileText;
};

// ── Helpers ───────────────────────────────────────────────────────────────
const formatEnumLabel = (v) => (v ?? '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const formatNumber = (num) => Number(num).toLocaleString('en-US');
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Actions ───────────────────────────────────────────────────────────────
const handleClose = async (id) => { await store.closePost(id); };
const handleArchive = async (id) => { await store.archivePost(id); };

// Delete
const deleteTargetId = ref(null);
const openDeleteConfirm = (id) => { deleteTargetId.value = id; };
const confirmDelete = async () => {
  await store.deletePost(deleteTargetId.value);
  deleteTargetId.value = null;
};

// Publish platforms
const showPublishModal = ref(false);
const publishTargetId = ref(null);
const selectedPlatforms = ref([
  { name: 'LinkedIn', checked: true, method: 'copy_text' },
  { name: 'Company Website', checked: true, method: 'automatic' },
  { name: 'Indeed', checked: false, method: 'manual' },
]);
const hasCheckedPlatforms = computed(() => selectedPlatforms.value.some(p => p.checked));

const openPublishModal = (post) => {
  publishTargetId.value = post.id;
  showPublishModal.value = true;
};
const confirmPublish = async () => {
  const platforms = selectedPlatforms.value
    .filter(p => p.checked)
    .map(p => ({
      platform_name: p.name,
      publish_method: p.method
    }));
  await store.publishPost(publishTargetId.value, platforms);
  showPublishModal.value = false;
};

// ── Lifecycle ─────────────────────────────────────────────────────────────
const listLoading = ref(false);

onMounted(async () => {
  listLoading.value = true;
  try {
    await store.fetchPosts();
  } finally {
    listLoading.value = false;
  }
});
</script>
