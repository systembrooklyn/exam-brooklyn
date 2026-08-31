<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList class="w-6 h-6 text-indigo-500" />
          Job Requests
        </h1>
        <p class="text-gray-500 mt-1 text-sm">Manage hiring requests — from draft to approval</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="authStore.can('create-job-requests')"
          @click="$router.push({ name: 'recruitment-job-request-create' })"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-semibold cursor-pointer"
        >
          <Plus class="w-4 h-4" /> New Job Request
        </button>
      </div>
    </div>

    <!-- Summary KPI Strips -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="kpi in kpiCards"
        :key="kpi.label"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between cursor-pointer hover:border-indigo-200 transition-colors"
        @click="statusFilter = kpi.filter"
      >
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{{ kpi.label }}</p>
          <p class="text-3xl font-bold" :class="kpi.numCls">{{ kpi.count }}</p>
        </div>
        <div class="p-2.5 rounded-xl flex-shrink-0" :class="kpi.iconBg">
          <component :is="kpi.icon" class="w-5 h-5" :class="kpi.iconCls" />
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="search"
          type="text"
          placeholder="Search position, department..."
          class="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-60 bg-white"
        />
      </div>

      <select
        v-model="statusFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      >
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      <select
        v-model="priorityFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      >
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      <button
        v-if="statusFilter || priorityFilter || search"
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
        <ClipboardList class="w-10 h-10 mb-2 opacity-30" />
        <p class="text-sm font-medium">No job requests found</p>
        <p v-if="authStore.can('create-job-requests')" class="text-xs mt-1">
          <button class="text-indigo-500 hover:underline" @click="$router.push({ name: 'recruitment-job-request-create' })">Create the first one</button>
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">#</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Position / Dept</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Count</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Priority</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Needed Before</th>
              <th class="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(req, idx) in filtered"
              :key="req.id"
              class="hover:bg-gray-50/40 transition-colors"
            >
              <!-- # -->
              <td class="px-4 py-3.5 text-gray-400 text-xs font-medium">{{ idx + 1 }}</td>

              <!-- Position / Dept -->
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Briefcase class="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <button
                      @click="openDetailsModal(req.id)"
                      class="font-semibold text-indigo-600 hover:underline leading-snug text-left cursor-pointer"
                    >
                      {{ req.position?.name ?? '—' }}
                    </button>
                    <p class="text-[11px] text-gray-400 mt-0.5">{{ req.department?.name ?? '—' }}</p>
                  </div>
                </div>
              </td>

              <!-- Requested Count -->
              <td class="px-4 py-3.5 text-center font-bold text-gray-700">{{ req.requested_count }}</td>

              <!-- Priority Badge -->
              <td class="px-4 py-3.5 text-center">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
                  :class="store.priorityMeta(req.priority).cls"
                >
                  {{ store.priorityMeta(req.priority).label }}
                </span>
              </td>

              <!-- Employment Type -->
              <td class="px-4 py-3.5 text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  {{ formatEnumLabel(req.employment_type) }}
                </span>
              </td>

              <!-- Status Badge -->
              <td class="px-4 py-3.5 text-center">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
                  :class="store.statusMeta(req.status).cls"
                >
                  <component :is="statusIcon(req.status)" class="w-3 h-3" />
                  {{ store.statusMeta(req.status).label }}
                </span>
              </td>

              <!-- Needed Before -->
              <td class="px-4 py-3.5 text-gray-500 text-xs">
                {{ req.needed_before ? formatDate(req.needed_before) : '—' }}
              </td>

              <!-- Actions -->
              <td class="px-4 py-3.5">
                <div class="flex items-center justify-center gap-1.5">

                  <!-- Submit (draft) -->
                  <button
                    v-if="req.status === 'draft' && authStore.can('submit-job-requests')"
                    @click="handleSubmit(req.id)"
                    :disabled="store.submitting"
                    class="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    title="Submit for approval"
                  >
                    <Send class="w-3 h-3" /> Submit
                  </button>

                  <!-- Approve (pending) -->
                  <button
                    v-if="req.status === 'pending' && authStore.can('approve-job-requests')"
                    @click="handleApprove(req.id)"
                    :disabled="store.submitting"
                    class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    title="Approve request"
                  >
                    <CheckCircle class="w-4 h-4" />
                  </button>

                  <!-- Reject (pending) -->
                  <button
                    v-if="req.status === 'pending' && authStore.can('reject-job-requests')"
                    @click="openRejectModal(req)"
                    :disabled="store.submitting"
                    class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Reject request"
                  >
                    <XCircle class="w-4 h-4" />
                  </button>

                  <!-- Reopen (rejected) -->
                  <button
                    v-if="req.status === 'rejected' && authStore.can('reopen-job-requests')"
                    @click="handleReopen(req.id)"
                    :disabled="store.submitting"
                    class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    title="Reopen as draft"
                  >
                    <RefreshCw class="w-3.5 h-3.5" />
                  </button>

                  <!-- Edit (draft only) -->
                  <button
                    v-if="req.status === 'draft' && authStore.can('update-job-requests')"
                    @click="$router.push({ name: 'recruitment-job-request-edit', params: { id: req.id } })"
                    class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit class="w-3.5 h-3.5" />
                  </button>

                  <!-- Delete (draft only) -->
                  <button
                    v-if="req.status === 'draft' && authStore.can('delete-job-requests')"
                    @click="openDeleteConfirm(req.id)"
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

    <!-- Reject Modal -->
    <div
      v-if="showRejectModal"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showRejectModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <XCircle class="w-5 h-5 text-red-500" /> Reject Request
        </h3>
        <p class="text-sm text-gray-500">Provide a reason for rejecting this job request.</p>
        <textarea
          v-model="rejectReason"
          rows="3"
          placeholder="e.g. Budget not approved for this quarter..."
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400/30 resize-none"
        />
        <div class="flex justify-end gap-3">
          <button @click="showRejectModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
          <button
            @click="confirmReject"
            :disabled="!rejectReason.trim() || store.submitting"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </div>

    <!-- Job Request Details Modal -->
    <div
      v-if="showDetailsModal && detailsRequest"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showDetailsModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-6 animate-scale-up">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-gray-50 pb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList class="w-5 h-5 text-indigo-500" />
              Job Request Details
            </h3>
            <p class="text-xs text-gray-400 mt-1">ID: #{{ detailsRequest.id }} &middot; Position: {{ detailsRequest.position?.name }}</p>
          </div>
          <button @click="showDetailsModal = false" class="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body Content -->
        <div class="space-y-6 max-h-[60vh] overflow-y-auto pr-2 text-xs">
          <!-- 1. General & Status Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <div class="space-y-2">
              <div>
                <span class="block text-[10px] text-gray-400 uppercase font-bold tracking-wide">Status</span>
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border mt-1"
                  :class="store.statusMeta(detailsRequest.status).cls"
                >
                  <component :is="statusIcon(detailsRequest.status)" class="w-3 h-3" />
                  {{ store.statusMeta(detailsRequest.status).label }}
                </span>
              </div>
              <div>
                <span class="block text-[10px] text-gray-400 uppercase font-bold tracking-wide">Priority</span>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border mt-1"
                  :class="store.priorityMeta(detailsRequest.priority).cls"
                >
                  {{ store.priorityMeta(detailsRequest.priority).label }}
                </span>
              </div>
            </div>
            
            <div class="space-y-2">
              <div>
                <span class="block text-[10px] text-gray-400 uppercase font-bold tracking-wide">Requested Quantity</span>
                <span class="text-sm font-bold text-gray-800 text-left block mt-1">{{ detailsRequest.requested_count }} Person(s)</span>
              </div>
              <div>
                <span class="block text-[10px] text-gray-400 uppercase font-bold tracking-wide mt-1">Needed Before</span>
                <span class="text-sm font-semibold text-gray-700 block mt-1">{{ detailsRequest.needed_before ? formatDate(detailsRequest.needed_before) : 'Not defined' }}</span>
              </div>
            </div>
          </div>

          <!-- 2. Position and Department Specs -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-400 uppercase font-bold tracking-wide mb-1 text-[10px]">Position Title</label>
              <p class="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{{ detailsRequest.position?.name || '—' }}</p>
            </div>
            <div>
              <label class="block text-gray-400 uppercase font-bold tracking-wide mb-1 text-[10px]">Department</label>
              <p class="text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{{ detailsRequest.department?.name || '—' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-400 uppercase font-bold tracking-wide mb-1 text-[10px]">Branch / Office</label>
              <p class="text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{{ detailsRequest.branch?.name || 'Main HQ' }}</p>
            </div>
            <div>
              <label class="block text-gray-400 uppercase font-bold tracking-wide mb-1 text-[10px]">Employment Type</label>
              <p class="text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 capitalize">{{ formatEnumLabel(detailsRequest.employment_type) }}</p>
            </div>
          </div>

          <!-- 3. Sourcing Details & Salary Budget -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-400 uppercase font-bold tracking-wide mb-1 text-[10px]">Salary Budget (From - To)</label>
              <p class="text-sm font-bold text-emerald-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                {{ detailsRequest.budget_salary_from ? formatNumber(detailsRequest.budget_salary_from) : '0' }} - 
                {{ detailsRequest.budget_salary_to ? formatNumber(detailsRequest.budget_salary_to) : '∞' }} EGP
              </p>
            </div>
            <div>
              <label class="block text-gray-400 uppercase font-bold tracking-wide mb-1 text-[10px]">Request Sourcing Type</label>
              <p class="text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 capitalize">{{ detailsRequest.request_type || 'Expansion' }}</p>
            </div>
          </div>

          <!-- Replacement for employee if exists -->
          <div v-if="detailsRequest.replacement_for" class="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
            <span class="block text-[10px] text-blue-500 uppercase font-bold tracking-wide mb-1">Replacement For Employee</span>
            <p class="text-xs font-semibold text-blue-700">{{ detailsRequest.replacement_for?.name || detailsRequest.replacement_for }}</p>
          </div>

          <!-- Reason & Notes -->
          <div class="space-y-4 border-t border-gray-50 pt-4">
            <div>
              <label class="block text-gray-400 uppercase font-bold tracking-wide mb-1 text-[10px]">Reason for Hire / Sourcing</label>
              <p class="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap leading-relaxed">{{ detailsRequest.reason || 'No specific reasoning provided.' }}</p>
            </div>
            <div>
              <label class="block text-gray-400 uppercase font-bold tracking-wide mb-1 text-[10px]">Additional Notes / Requirements</label>
              <p class="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap leading-relaxed">{{ detailsRequest.notes || 'No notes.' }}</p>
            </div>
          </div>

          <!-- 4. Sourcing Logistics (Requested by / Approval Audit) -->
          <div class="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-gray-500">
            <div class="space-y-1">
              <p><span class="font-bold text-gray-700">Requested By:</span> {{ detailsRequest.requested_by?.name || '—' }}</p>
              <p><span class="font-bold text-gray-700">Submitted At:</span> {{ formatDate(detailsRequest.submitted_at || detailsRequest.created_at) }}</p>
            </div>
            <div class="space-y-1" v-if="detailsRequest.approved_at || detailsRequest.rejected_at">
              <template v-if="detailsRequest.status === 'approved'">
                <p class="text-emerald-600 font-bold">Approved Request Details</p>
                <p><span class="font-bold text-gray-700">Approved At:</span> {{ formatDate(detailsRequest.approved_at) }}</p>
                <p v-if="detailsRequest.approval_notes"><span class="font-bold text-gray-700">Approval Notes:</span> {{ detailsRequest.approval_notes }}</p>
              </template>
              <template v-else-if="detailsRequest.status === 'rejected'">
                <p class="text-red-500 font-bold">Rejection Details</p>
                <p><span class="font-bold text-gray-700">Rejected At:</span> {{ formatDate(detailsRequest.rejected_at) }}</p>
                <p v-if="detailsRequest.rejection_reason"><span class="font-bold text-gray-700">Rejection Reason:</span> {{ detailsRequest.rejection_reason }}</p>
              </template>
            </div>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex justify-end border-t border-gray-50 pt-4">
          <button @click="showDetailsModal = false" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs">
            Close details
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
        <h3 class="text-lg font-bold text-gray-900">Delete Job Request?</h3>
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

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  ClipboardList, Plus, Search, Briefcase, CheckCircle, XCircle,
  RefreshCw, Edit, Trash2, X, Send, FileText, Clock, AlertTriangle
} from 'lucide-vue-next';
import { useJobRequestsStore } from '@/stores/recruitment/jobRequestsStore';
import { useAuthStore } from '@/stores/auth';

const store     = useJobRequestsStore();
const authStore = useAuthStore();

// ── Filters ───────────────────────────────────────────────────────────────
const search         = ref('');
const statusFilter   = ref('');
const priorityFilter = ref('');

const clearFilters = () => {
  search.value = '';
  statusFilter.value = '';
  priorityFilter.value = '';
};

// ── Filtered List ─────────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = store.requests;
  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter(r =>
      r.position?.name?.toLowerCase().includes(q) ||
      r.department?.name?.toLowerCase().includes(q) ||
      r.reason?.toLowerCase().includes(q)
    );
  }
  if (statusFilter.value) list = list.filter(r => r.status === statusFilter.value);
  if (priorityFilter.value) list = list.filter(r => r.priority === priorityFilter.value);
  return list;
});

// ── KPI Cards ─────────────────────────────────────────────────────────────
const kpiCards = computed(() => [
  {
    label: 'Total',
    count: store.requests.length,
    filter: '',
    icon: FileText,
    numCls: 'text-gray-800',
    iconBg: 'bg-indigo-50',
    iconCls: 'text-indigo-500',
  },
  {
    label: 'Pending Approval',
    count: store.requests.filter(r => r.status === 'pending').length,
    filter: 'pending',
    icon: Clock,
    numCls: 'text-amber-600',
    iconBg: 'bg-amber-50',
    iconCls: 'text-amber-500',
  },
  {
    label: 'Approved',
    count: store.requests.filter(r => r.status === 'approved').length,
    filter: 'approved',
    icon: CheckCircle,
    numCls: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    iconCls: 'text-emerald-500',
  },
  {
    label: 'Draft',
    count: store.requests.filter(r => r.status === 'draft').length,
    filter: 'draft',
    icon: AlertTriangle,
    numCls: 'text-gray-500',
    iconBg: 'bg-gray-50',
    iconCls: 'text-gray-400',
  },
]);

// ── Status Icon ───────────────────────────────────────────────────────────
const statusIcon = (status) => {
  const map = { draft: FileText, pending: Clock, approved: CheckCircle, rejected: XCircle };
  return map[status] ?? FileText;
};

// ── Helpers ───────────────────────────────────────────────────────────────
const formatEnumLabel = (v) => (v ?? '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Workflow Actions ──────────────────────────────────────────────────────
const handleSubmit = async (id) => { await store.submitRequest(id); };
const handleApprove = async (id) => { await store.approveRequest(id); };
const handleReopen  = async (id) => { await store.reopenRequest(id); };

// Reject
const showRejectModal = ref(false);
const rejectTargetId  = ref(null);
const rejectReason    = ref('');

const openRejectModal = (req) => {
  rejectTargetId.value = req.id;
  rejectReason.value   = '';
  showRejectModal.value = true;
};
const confirmReject = async () => {
  await store.rejectRequest(rejectTargetId.value, rejectReason.value.trim());
  showRejectModal.value = false;
};

// Details Modal
const showDetailsModal = ref(false);
const detailsRequest = ref(null);

const openDetailsModal = async (id) => {
  try {
    const res = await store.fetchRequest(id);
    detailsRequest.value = res;
    showDetailsModal.value = true;
  } catch (err) {
    // secure mockup fallback in case request id is mock
    detailsRequest.value = store.requests.find(r => r.id === id);
    showDetailsModal.value = true;
  }
};

const formatNumber = (num) => num ? Number(num).toLocaleString('en-US') : '0';

// Delete
const deleteTargetId = ref(null);
const openDeleteConfirm = (id) => { deleteTargetId.value = id; };
const confirmDelete = async () => {
  await store.deleteRequest(deleteTargetId.value);
  deleteTargetId.value = null;
};

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => store.fetchRequests());
</script>
