<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Hires</h1>
        <p class="text-sm text-gray-500 mt-0.5">Track all hired candidates and their onboarding status</p>
      </div>
      <button
        @click="$router.push({ name: 'recruitment-hire-create' })"
        class="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        Add Hire
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
      <input
        v-model="filters.search"
        placeholder="Search candidate..."
        class="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-52"
      />
      <select
        v-model="filters.status"
        class="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
      >
        <option value="">All Statuses</option>
        <option value="pending_onboarding">Pending Onboarding</option>
        <option value="onboarded">Onboarded</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button
        @click="load"
        class="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
      >
        Search
      </button>
      <button
        @click="resetFilters"
        class="px-4 py-2 text-gray-500 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        Reset
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!store.hires.length" class="text-center py-24">
      <div class="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <UserCheck class="w-8 h-8 text-emerald-400" />
      </div>
      <p class="text-gray-500 font-medium">No hires found</p>
      <p class="text-gray-400 text-sm mt-1">Hired candidates will appear here after marking applications as hired.</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Post</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Offer #</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
            <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th class="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="hire in store.hires"
            :key="hire.id"
            class="hover:bg-gray-50/60 transition-colors"
          >
            <!-- Candidate -->
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {{ candidateInitials(hire) }}
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ candidateName(hire) }}</p>
                  <p class="text-xs text-gray-400">{{ hire.application?.candidate?.email ?? appStore.applications.find(a => a.id === hire.application_id)?.candidate?.email ?? '—' }}</p>
                </div>
              </div>
            </td>

            <!-- Job Post -->
            <td class="px-5 py-4">
              <span class="text-gray-700">{{ hire.application?.job_post?.title ?? appStore.applications.find(a => a.id === hire.application_id)?.job_post?.title ?? '—' }}</span>
            </td>

            <!-- Offer -->
            <td class="px-5 py-4">
              <button
                v-if="getOfferObj(hire)"
                @click="openOfferDetailsModal(getOfferObj(hire))"
                class="font-bold text-indigo-600 hover:underline text-xs font-mono cursor-pointer"
              >
                {{ getOfferObj(hire).offer_number }}
              </button>
              <span v-else class="text-gray-400">—</span>
            </td>

            <!-- Start Date -->
            <td class="px-5 py-4">
              <span class="text-gray-600">{{ getOfferStartDate(hire) }}</span>
            </td>

            <!-- Status -->
            <td class="px-5 py-4">
              <span
                class="px-2.5 py-1 rounded-full text-xs font-semibold border"
                :class="store.statusMeta[hire.status]?.cls ?? 'bg-gray-50 text-gray-600 border-gray-200'"
              >
                {{ store.statusMeta[hire.status]?.label ?? hire.status }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-5 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="$router.push({ name: 'recruitment-hire-detail', params: { id: hire.id } })"
                  class="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  title="View Details"
                >
                  <Eye class="w-4 h-4" />
                </button>
                <button
                  v-if="hire.status === 'pending_onboarding'"
                  @click="markOnboarded(hire)"
                  class="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer border border-emerald-200"
                >
                  Mark Onboarded
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Offer Details Modal -->
    <div
      v-if="showOfferModal && selectedOffer"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showOfferModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 animate-scale-up text-xs">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-gray-50 pb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText class="w-5 h-5 text-indigo-500" />
              Job Offer Details
            </h3>
            <p class="text-xs text-gray-400 mt-1">Ref Code: {{ selectedOffer.offer_number }}</p>
          </div>
          <button @click="showOfferModal = false" class="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="space-y-4">
          <!-- Status Badge -->
          <div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
            <span class="text-gray-400 uppercase font-bold tracking-wide text-[10px]">Offer Status</span>
            <span
              class="px-2.5 py-0.5 rounded-full font-bold border capitalize"
              :class="offerStatusBadge(selectedOffer.status).cls"
            >
              {{ offerStatusBadge(selectedOffer.status).label }}
            </span>
          </div>

          <!-- Position Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="block text-[10px] text-gray-400 uppercase font-bold tracking-wide">Candidate</span>
              <span class="font-bold text-gray-800 text-sm block mt-0.5">
                {{ appStore.applications.find(a => Number(a.id) === Number(selectedOffer.application_id))?.candidate?.name || '—' }}
              </span>
            </div>
            <div>
              <span class="block text-[10px] text-gray-400 uppercase font-bold tracking-wide">Job Position</span>
              <span class="font-semibold text-gray-700 text-sm block mt-0.5">
                {{ appStore.applications.find(a => Number(a.id) === Number(selectedOffer.application_id))?.job_post?.title || '—' }}
              </span>
            </div>
          </div>

          <!-- Financial Details -->
          <div class="border-t border-gray-50 pt-4 space-y-2">
            <h4 class="text-gray-400 font-bold uppercase tracking-wide text-[10px]">Salary Breakdown</h4>
            <div class="space-y-1.5">
              <div class="flex justify-between">
                <span class="text-gray-500">Base Monthly Salary</span>
                <span class="font-bold text-gray-800">{{ formatNumber(selectedOffer.salary) }} {{ selectedOffer.currency || 'EGP' }}</span>
              </div>
              <div class="flex justify-between" v-if="selectedOffer.allowance">
                <span class="text-gray-500">Monthly Allowance</span>
                <span class="font-bold text-gray-800">+{{ formatNumber(selectedOffer.allowance) }} {{ selectedOffer.currency || 'EGP' }}</span>
              </div>
              <div class="flex justify-between" v-if="selectedOffer.bonus">
                <span class="text-gray-500">One-time Sign-on Bonus</span>
                <span class="font-bold text-gray-800">{{ formatNumber(selectedOffer.bonus) }} {{ selectedOffer.currency || 'EGP' }}</span>
              </div>
              <div class="flex justify-between border-t border-dashed border-gray-100 pt-1.5 font-bold text-sm text-emerald-600">
                <span>Total Monthly Package</span>
                <span>
                  {{ formatNumber(Number(selectedOffer.salary) + Number(selectedOffer.allowance || 0)) }} {{ selectedOffer.currency || 'EGP' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Start Date & Probation -->
          <div class="border-t border-gray-50 pt-4 grid grid-cols-2 gap-4">
            <div>
              <span class="block text-[10px] text-gray-400 uppercase font-bold tracking-wide">Proposed Start Date</span>
              <span class="font-semibold text-gray-700 block mt-0.5">{{ selectedOffer.start_date ? formatDate(selectedOffer.start_date) : '—' }}</span>
            </div>
            <div>
              <span class="block text-[10px] text-gray-400 uppercase font-bold tracking-wide">Probation Period</span>
              <span class="font-semibold text-gray-700 block mt-0.5">{{ selectedOffer.probation_months || '3' }} Months</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end border-t border-gray-50 pt-4">
          <button @click="showOfferModal = false" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs">
            Close Offer details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Plus, UserCheck, Eye, FileText, X } from 'lucide-vue-next';
import { useHiresStore } from '@/stores/recruitment/hiresStore';
import { useApplicationsStore } from '@/stores/recruitment/applicationsStore';
import { useOffersStore } from '@/stores/recruitment/offersStore';

const store = useHiresStore();
const appStore = useApplicationsStore();
const offersStore = useOffersStore();

const filters = ref({ search: '', status: '' });

function candidateName(hire) {
  const appObj = appStore.applications.find(a => a.id === hire.application_id);
  const c = hire.application?.candidate || appObj?.candidate;
  if (!c) return '—';
  return c.name || `${c.firstname ?? ''} ${c.lastname ?? ''}`.trim() || '—';
}

function getOfferStartDate(hire) {
  const o = hire.offer || offersStore.offers.find(o => o.id === hire.offer_id || o.application_id === hire.application_id);
  return o?.start_date ? formatDate(o.start_date) : '—';
}

function candidateInitials(hire) {
  const name = candidateName(hire);
  if (name === '—') return '?';
  const parts = name.split(' ');
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
}

function getOfferObj(hire) {
  return hire.offer || offersStore.offers.find(o => o.id === hire.offer_id || o.application_id === hire.application_id);
}

const showOfferModal = ref(false);
const selectedOffer = ref(null);

const openOfferDetailsModal = (offer) => {
  selectedOffer.value = offer;
  showOfferModal.value = true;
};

const offerStatusBadge = (status) => {
  const map = {
    pending:  { label: 'Pending Response', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    accepted: { label: 'Accepted',         cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected',         cls: 'bg-red-50 text-red-700 border-red-200' },
    expired:  { label: 'Expired',          cls: 'bg-gray-150 text-gray-600 border-gray-200' },
  };
  return map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500 border-gray-200' };
};

const formatNumber = (num) => num ? Number(num).toLocaleString('en-US') : '0';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function load() {
  const params = {};
  if (filters.value.status) params.status = filters.value.status;
  await Promise.all([
    store.fetchHires(params),
    appStore.fetchApplications(),
    offersStore.fetchOffers(),
  ]);
}

function resetFilters() {
  filters.value = { search: '', status: '' };
  load();
}

async function markOnboarded(hire) {
  if (!confirm('Mark this hire as Onboarded?')) return;
  await store.updateHire(hire.id, { status: 'onboarded' });
}

onMounted(load);
</script>
