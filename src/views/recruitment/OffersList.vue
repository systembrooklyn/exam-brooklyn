<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText class="w-6 h-6 text-indigo-500" />
          Job Offers
        </h1>
        <p class="text-gray-500 mt-1 text-sm">Review, send and manage employment offer letters extended to candidates</p>
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
        v-model="statusFilter"
        class="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending Response</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
        <option value="expired">Expired</option>
      </select>

      <button
        v-if="statusFilter || search"
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
        <FileText class="w-10 h-10 mb-2 opacity-30" />
        <p class="text-sm font-medium">No job offers found</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Offer Code</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Candidate</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Job Post</th>
              <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Monthly terms</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Start Date</th>
              <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="offer in filtered" :key="offer.id" class="hover:bg-gray-50/40 transition-colors">
              <!-- Code -->
              <td class="px-5 py-4">
                <button
                  @click="openOfferDetailsModal(offer)"
                  class="font-bold text-indigo-600 hover:underline text-xs font-mono cursor-pointer"
                >
                  {{ offer.offer_number || '—' }}
                </button>
              </td>

              <!-- Candidate -->
              <td class="px-5 py-4">
                <router-link
                  v-if="offer.application_id"
                  :to="{ name: 'recruitment-application-details', params: { id: offer.application_id } }"
                  class="font-bold text-indigo-600 hover:underline block"
                >
                  {{ candidateName(offer) }}
                </router-link>
                <span v-else class="font-bold text-gray-900">{{ candidateName(offer) }}</span>
                <span class="text-xs text-gray-400 block mt-0.5">
                  {{ offer.application?.candidate?.email || appStore.applications.find(a => Number(a.id) === Number(offer.application_id))?.candidate?.email || '' }}
                </span>
              </td>

              <!-- Job -->
              <td class="px-5 py-4 text-gray-700">
                {{ offer.application?.job_post?.title || appStore.applications.find(a => Number(a.id) === Number(offer.application_id))?.job_post?.title || '—' }}
              </td>

              <!-- Terms -->
              <td class="px-5 py-4 text-center font-semibold text-gray-800">
                <div>
                  <p>{{ formatNumber(offer.salary) }} {{ offer.currency || 'EGP' }}</p>
                  <p class="text-[10px] text-gray-400 font-normal mt-0.5" v-if="offer.allowance">
                    +{{ formatNumber(offer.allowance) }} Allowance
                  </p>
                </div>
              </td>

              <!-- Start Date -->
              <td class="px-5 py-4 text-gray-600 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5">
                  <Calendar class="w-3.5 h-3.5 text-gray-400" />
                  {{ formatDate(offer.start_date) }}
                </span>
              </td>

              <!-- Status Badge -->
              <td class="px-5 py-4 text-center">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border"
                  :class="statusBadge(offer.status).cls"
                >
                  {{ statusBadge(offer.status).label }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-5 py-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <template v-if="offer.status === 'pending'">
                    <button
                      v-if="authStore.can('send-offers')"
                      @click="handleSend(offer.id)"
                      class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Send Offer Email"
                    >
                      <Send class="w-4 h-4" />
                    </button>
                    <button
                      v-if="authStore.can('update-offers')"
                      @click="openEditModal(offer)"
                      class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Terms"
                    >
                      <Edit class="w-4 h-4" />
                    </button>
                    <button
                      v-if="authStore.can('expire-offers')"
                      @click="handleExpire(offer.id)"
                      class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Expire Offer"
                    >
                      <XCircle class="w-4 h-4" />
                    </button>
                  </template>
                  <button
                    v-if="authStore.can('delete-offers')"
                    @click="handleDelete(offer.id)"
                    class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Offer"
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

    <!-- Edit Terms Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showEditModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 animate-scale-up">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Edit class="w-5 h-5 text-indigo-500" /> Update Offer Terms
        </h3>

        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Base Salary (monthly) *</label>
              <input
                v-model.number="editForm.salary"
                type="number"
                min="0"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Allowance (monthly)</label>
              <input
                v-model.number="editForm.allowance"
                type="number"
                min="0"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">One-time / Annual Bonus</label>
              <input
                v-model.number="editForm.bonus"
                type="number"
                min="0"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Probation Period (months)</label>
              <input
                v-model.number="editForm.probation_months"
                type="number"
                min="0"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Currency Code</label>
              <input
                v-model="editForm.currency"
                type="text"
                maxlength="3"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 uppercase"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Proposed Start Date</label>
              <input
                v-model="editForm.start_date"
                type="date"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showEditModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            @click="confirmEdit"
            :disabled="!editForm.salary || store.loading"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
    <!-- Offer Details Modal -->
    <div
      v-if="showOfferModal && selectedOffer"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showOfferModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 animate-scale-up text-xs animate-fade-in">
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
              :class="statusBadge(selectedOffer.status).cls"
            >
              {{ statusBadge(selectedOffer.status).label }}
            </span>
          </div>

          <!-- Position Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="block text-[10px] text-gray-400 uppercase font-bold tracking-wide">Candidate</span>
              <span class="font-bold text-gray-800 text-sm block mt-0.5">
                {{ candidateName(selectedOffer) }}
              </span>
            </div>
            <div>
              <span class="block text-[10px] text-gray-400 uppercase font-bold tracking-wide">Job Position</span>
              <span class="font-semibold text-gray-700 text-sm block mt-0.5">
                {{ selectedOffer.application?.job_post?.title || appStore.applications.find(a => Number(a.id) === Number(selectedOffer.application_id))?.job_post?.title || '—' }}
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
import { ref, reactive, computed, onMounted } from 'vue';
import { FileText, Search, Mail, Trash2, XCircle, X, Send, Calendar, Edit } from 'lucide-vue-next';
import { useOffersStore } from '@/stores/recruitment/offersStore';
import { useApplicationsStore } from '@/stores/recruitment/applicationsStore';
import { useAuthStore } from '@/stores/auth';

const store = useOffersStore();
const appStore = useApplicationsStore();
const authStore = useAuthStore();

const search = ref('');
const statusFilter = ref('');

const clearFilters = () => {
  search.value = '';
  statusFilter.value = '';
};

const candidateName = (offer) => {
  const appObj = appStore.applications.find(a => Number(a.id) === Number(offer.application_id));
  const c = offer.application?.candidate || appObj?.candidate;
  if (!c) return '—';
  return c.name || `${c.firstname || ''} ${c.lastname || ''}`.trim() || '—';
};

const formatNumber = (num) => Number(num || 0).toLocaleString('en-US');
const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusBadge = (status) => {
  const map = {
    pending:  { label: 'Pending Response', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    accepted: { label: 'Accepted',         cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected',         cls: 'bg-red-50 text-red-700 border-red-200' },
    expired:  { label: 'Expired',          cls: 'bg-gray-150 text-gray-600 border-gray-200' },
  };
  return map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500 border-gray-200' };
};

const filtered = computed(() => {
  let list = store.offers;
  if (search.value) {
    const q = search.value.toLowerCase().trim();
    list = list.filter(o => {
      const name = candidateName(o).toLowerCase();
      return name.includes(q);
    });
  }
  if (statusFilter.value) {
    list = list.filter(o => o.status === statusFilter.value);
  }
  return list;
});

// ── Actions ───────────────────────────────────────────────────────────────
const handleSend = async (id) => {
  await store.sendOffer(id);
  await store.fetchOffers();
};

const handleExpire = async (id) => {
  if (!confirm('Are you sure you want to expire this offer?')) return;
  await store.expireOffer(id);
  await store.fetchOffers();
};

const handleDelete = async (id) => {
  if (!confirm('Are you sure you want to delete this offer?')) return;
  await store.deleteOffer(id);
};

// Edit Modal
const showEditModal = ref(false);
const activeOfferId = ref(null);
const editForm = reactive({
  salary: '',
  allowance: '',
  bonus: '',
  currency: 'EGP',
  probation_months: 3,
  start_date: '',
});

const openEditModal = (offer) => {
  activeOfferId.value = offer.id;
  Object.assign(editForm, {
    salary: offer.salary || '',
    allowance: offer.allowance || '',
    bonus: offer.bonus || '',
    currency: offer.currency || 'EGP',
    probation_months: offer.probation_months || 3,
    start_date: offer.start_date || '',
  });
  showEditModal.value = true;
};

const confirmEdit = async () => {
  await store.updateOffer(activeOfferId.value, { ...editForm });
  showEditModal.value = false;
  await store.fetchOffers();
};

// Details Modal
const showOfferModal = ref(false);
const selectedOffer = ref(null);

const openOfferDetailsModal = (offer) => {
  selectedOffer.value = offer;
  showOfferModal.value = true;
};

onMounted(() => {
  store.fetchOffers();
  appStore.fetchApplications();
});
</script>
