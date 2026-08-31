<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users class="w-6 h-6 text-indigo-500" />
          Candidates
        </h1>
        <p class="text-gray-500 mt-1 text-sm">Manage candidate directory, resumes, contact details, and blacklist statuses</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="authStore.can('create-candidates')"
          @click="$router.push({ name: 'recruitment-candidate-create' })"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-semibold cursor-pointer"
        >
          <Plus class="w-4 h-4" /> Add Candidate
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
          placeholder="Search name, email, phone..."
          class="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-60 bg-white"
        />
      </div>

      <select
        v-model="statusFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="blacklisted">Blacklisted</option>
        <option value="archived">Archived</option>
      </select>

      <select
        v-model="sourceFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      >
        <option value="">All Sources</option>
        <option v-for="src in uniqueSources" :key="src" :value="src">{{ src }}</option>
      </select>

      <button
        v-if="statusFilter || sourceFilter || search"
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
        <Users class="w-10 h-10 mb-2 opacity-30" />
        <p class="text-sm font-medium">No candidates found</p>
        <p v-if="authStore.can('create-candidates')" class="text-xs mt-1">
          <button class="text-indigo-500 hover:underline" @click="$router.push({ name: 'recruitment-candidate-create' })">Add manually</button>
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">#</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Candidate</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Contact Details</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Experience</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Source</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Resume</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(cand, idx) in filtered"
              :key="cand.id"
              class="hover:bg-gray-50/40 transition-colors"
            >
              <td class="px-4 py-3.5 text-gray-400 text-xs font-medium">{{ idx + 1 }}</td>

              <!-- Name & City -->
              <td class="px-4 py-3.5 font-semibold text-gray-900">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">
                    {{ candidateInitials(cand) }}
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">{{ candidateName(cand) }}</p>
                    <p class="text-[10px] text-gray-400 font-normal mt-0.5">{{ cand.city }}, {{ cand.country }}</p>
                  </div>
                </div>
              </td>

              <!-- Contact -->
              <td class="px-4 py-3.5 text-gray-600">
                <div class="space-y-0.5">
                  <p class="text-xs flex items-center gap-1">
                    <Mail class="w-3.5 h-3.5 text-gray-400" />
                    {{ cand.email }}
                  </p>
                  <p class="text-xs flex items-center gap-1">
                    <Phone class="w-3.5 h-3.5 text-gray-400" />
                    {{ cand.phone }}
                  </p>
                </div>
              </td>

              <!-- Experience -->
              <td class="px-4 py-3.5 text-center font-medium text-gray-700">
                {{ cand.experience_years != null ? `${cand.experience_years} yrs` : '—' }}
              </td>

              <!-- Source -->
              <td class="px-4 py-3.5 text-center">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                  {{ cand.source || 'Website' }}
                </span>
              </td>

              <!-- Status Badge -->
              <td class="px-4 py-3.5 text-center">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
                  :class="store.statusMeta(cand.status).cls"
                >
                  <component :is="statusIcon(cand.status)" class="w-3 h-3" />
                  {{ store.statusMeta(cand.status).label }}
                </span>
              </td>

              <!-- Resume File -->
              <td class="px-4 py-3.5 text-center">
                <a
                  v-if="cand.cv_file"
                  :href="cand.cv_file"
                  target="_blank"
                  class="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  <FileText class="w-4 h-4" /> Download
                </a>
                <span v-else class="text-gray-300">No CV</span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3.5">
                <div class="flex items-center justify-center gap-1.5">

                  <!-- View Profile -->
                  <button
                    @click="$router.push({ name: 'recruitment-candidate-profile', params: { id: cand.id } })"
                    class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="View Full Profile"
                  >
                    <Eye class="w-4 h-4" />
                  </button>

                  <!-- Edit -->
                  <button
                    v-if="authStore.can('update-candidates')"
                    @click="$router.push({ name: 'recruitment-candidate-edit', params: { id: cand.id } })"
                    class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Info"
                  >
                    <Edit class="w-3.5 h-3.5" />
                  </button>

                  <!-- Delete -->
                  <button
                    v-if="authStore.can('delete-candidates')"
                    @click="openDeleteConfirm(cand.id)"
                    class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Profile"
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
        <h3 class="text-lg font-bold text-gray-900">Delete Candidate?</h3>
        <p class="text-sm text-gray-500">This will remove their profile and all active applications.</p>
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
import { ref, computed, onMounted } from 'vue';
import {
  Users, Plus, Search, Mail, Phone, FileText, Eye, Edit, Trash2, X, AlertOctagon, CheckCircle, Clock
} from 'lucide-vue-next';
import { useCandidatesStore } from '@/stores/recruitment/candidatesStore';
import { useAuthStore } from '@/stores/auth';

const store = useCandidatesStore();
const authStore = useAuthStore();

// ── Filters ───────────────────────────────────────────────────────────────
const search = ref('');
const statusFilter = ref('');
const sourceFilter = ref('');

const clearFilters = () => {
  search.value = '';
  statusFilter.value = '';
  sourceFilter.value = '';
};

// ── Unique Sources for dropdown filter ─────────────────────────────────────
const uniqueSources = computed(() => {
  const sources = store.candidates.map(c => c.source).filter(Boolean);
  return [...new Set(sources)];
});

const candidateName = (cand) => {
  if (!cand) return '—';
  return cand.name || `${cand.firstname || ''} ${cand.lastname || ''}`.trim() || '—';
};

const candidateInitials = (cand) => {
  const name = candidateName(cand);
  if (name === '—') return '?';
  const parts = name.split(' ');
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
};

// ── Filtered List ─────────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = store.candidates;
  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter(c =>
      candidateName(c).toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  }
  if (statusFilter.value) list = list.filter(c => c.status === statusFilter.value);
  if (sourceFilter.value) list = list.filter(c => c.source === sourceFilter.value);
  return list;
});

// ── Status Icon ───────────────────────────────────────────────────────────
const statusIcon = (status) => {
  const map = {
    active: CheckCircle,
    blacklisted: AlertOctagon,
    archived: Clock
  };
  return map[status] ?? CheckCircle;
};

// ── Delete Action ─────────────────────────────────────────────────────────
const deleteTargetId = ref(null);
const openDeleteConfirm = (id) => { deleteTargetId.value = id; };
const confirmDelete = async () => {
  await store.deleteCandidate(deleteTargetId.value);
  deleteTargetId.value = null;
};

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => store.fetchCandidates());
</script>
