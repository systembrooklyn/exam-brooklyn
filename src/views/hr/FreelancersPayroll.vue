<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/20 p-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Freelancer Payroll Management</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage external contractors, contract records, and monthly payouts</p>
      </div>

      <!-- Quick Summary (Live Total) -->
      <div class="bg-sky-50 border border-sky-100 rounded-2xl px-5 py-3 flex items-center gap-4">
        <div class="p-2 bg-sky-500 text-white rounded-xl">
          <Banknote class="w-5 h-5" />
        </div>
        <div>
          <p class="text-xs text-sky-600 font-semibold uppercase tracking-wider">Month Net Total</p>
          <div class="flex items-center gap-2">
            <span class="text-lg font-bold text-sky-900">{{ currentMonthTotal.toLocaleString() }} EGP</span>
            <input
              type="month"
              v-model="summaryMonth"
              @change="loadMonthTotal"
              class="bg-transparent border-0 text-xs text-sky-700 focus:ring-0 p-0 font-medium cursor-pointer underline"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-gray-100 mb-6">
      <button
        @click="activeTab = 'freelancers'"
        class="px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2"
        :class="activeTab === 'freelancers' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-400 hover:text-gray-600'"
      >
        <Users class="w-4 h-4" />
        Freelancers
      </button>
      <button
        @click="activeTab = 'payrolls'"
        class="px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2"
        :class="activeTab === 'payrolls' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-400 hover:text-gray-600'"
      >
        <Receipt class="w-4 h-4" />
        Payroll Records
      </button>
    </div>

    <!-- Tab 1: Freelancers -->
    <div v-if="activeTab === 'freelancers'">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <input
          v-model="searchQuery"
          placeholder="Search by name or email..."
          class="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 w-64"
        />
        <button
          @click="openFreelancerModal()"
          class="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <Plus class="w-4 h-4" /> Add Freelancer
        </button>
      </div>

      <div v-if="store.loading" class="flex justify-center py-10">
        <div class="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="filteredFreelancers.length === 0" class="text-center py-16 bg-white border border-gray-100 rounded-2xl">
        <Users class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">No freelancers found</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="freelancer in filteredFreelancers"
          :key="freelancer.id"
          class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-sky-100 text-sky-700 font-bold rounded-xl flex items-center justify-center">
                {{ freelancer.first_name?.[0] }}{{ freelancer.last_name?.[0] }}
              </div>
              <div>
                <h3 class="font-bold text-gray-900">{{ freelancer.first_name }} {{ freelancer.last_name }}</h3>
                <p class="text-xs text-gray-400">{{ freelancer.email }}</p>
              </div>
            </div>

            <p class="text-xs text-gray-500 line-clamp-2 mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100/60" v-if="freelancer.notes">
              {{ freelancer.notes }}
            </p>

            <div class="space-y-2 text-xs text-gray-600 mb-4">
              <div class="flex items-center gap-2">
                <Phone class="w-3.5 h-3.5 text-gray-400" />
                <span>{{ freelancer.phone || '—' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <FileText class="w-3.5 h-3.5 text-gray-400" />
                <a
                  v-if="freelancer.contract_link"
                  :href="freelancer.contract_link"
                  target="_blank"
                  class="text-sky-600 hover:underline font-medium flex items-center gap-1"
                >
                  View Contract Link <ExternalLink class="w-3 h-3" />
                </a>
                <span v-else class="text-gray-400">No contract link uploaded</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-4 border-t border-gray-50 mt-auto">
            <button
              @click="openFreelancerModal(freelancer)"
              class="flex-1 py-2 text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-center"
            >
              Edit Info
            </button>
            <button
              @click="handleDeleteFreelancer(freelancer.id)"
              class="px-3 py-2 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Payroll Records -->
    <div v-else-if="activeTab === 'payrolls'">
      <div class="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div class="flex flex-wrap items-center gap-3">
          <select
            v-model="payrollFilters.freelancer_id"
            class="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none bg-white focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="">All Freelancers</option>
            <option v-for="f in store.freelancers" :key="f.id" :value="f.id">{{ f.first_name }} {{ f.last_name }}</option>
          </select>
          <input
            type="month"
            v-model="payrollFilters.month"
            class="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
          <button
            @click="loadPayrolls"
            class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
          >
            Filter
          </button>
        </div>

        <button
          @click="openPayrollModal()"
          class="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <Plus class="w-4 h-4" /> Create Payroll Record
        </button>
      </div>

      <div v-if="store.loading" class="flex justify-center py-10">
        <div class="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="store.payrolls.length === 0" class="text-center py-16 bg-white border border-gray-100 rounded-2xl">
        <Receipt class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">No payroll records found</p>
      </div>

      <div v-else class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Freelancer</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Amount</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Date</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
              <th class="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="p in store.payrolls" :key="p.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-5 py-4 font-medium text-gray-900">
                {{ p.freelancer?.first_name }} {{ p.freelancer?.last_name }}
              </td>
              <td class="px-5 py-4 text-gray-600">{{ p.payroll_month }}</td>
              <td class="px-5 py-4 font-bold text-gray-800">{{ Number(p.net_amount).toLocaleString() }} EGP</td>
              <td class="px-5 py-4 text-gray-500">{{ p.payment_date || '—' }}</td>
              <td class="px-5 py-4 text-gray-500 max-w-xs truncate">{{ p.notes || '—' }}</td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openPayrollModal(p)"
                    class="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDeletePayroll(p.id)"
                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
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

    <!-- Freelancer Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showFreelancerModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeFreelancerModal" />
          <div class="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">{{ editingFreelancer ? 'Edit Freelancer' : 'Add Freelancer' }}</h3>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">First Name *</label>
                  <input
                    v-model="freelancerForm.first_name"
                    class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name</label>
                  <input
                    v-model="freelancerForm.last_name"
                    class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input
                  type="email"
                  v-model="freelancerForm.email"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                <input
                  v-model="freelancerForm.phone"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Contract Link (URL)</label>
                <input
                  v-model="freelancerForm.contract_link"
                  placeholder="https://example.com/contract.pdf"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                <textarea
                  v-model="freelancerForm.notes"
                  rows="3"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button @click="closeFreelancerModal" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
              <button
                @click="saveFreelancer"
                :disabled="store.submitting"
                class="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <span v-if="store.submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Save
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Payroll Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showPayrollModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closePayrollModal" />
          <div class="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">{{ editingPayroll ? 'Edit Payroll Record' : 'Create Payroll Record' }}</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Freelancer *</label>
                <select
                  v-model="payrollForm.freelancer_id"
                  :disabled="editingPayroll"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
                >
                  <option value="">Select Freelancer...</option>
                  <option v-for="f in store.freelancers" :key="f.id" :value="f.id">{{ f.first_name }} {{ f.last_name }}</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Payroll Month *</label>
                  <input
                    type="month"
                    v-model="payrollForm.payroll_month"
                    class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Net Amount *</label>
                  <input
                    type="number"
                    v-model.number="payrollForm.net_amount"
                    min="0"
                    placeholder="EGP"
                    class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Date</label>
                <input
                  type="date"
                  v-model="payrollForm.payment_date"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                <textarea
                  v-model="payrollForm.notes"
                  rows="3"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button @click="closePayrollModal" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
              <button
                @click="savePayroll"
                :disabled="store.submitting"
                class="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <span v-if="store.submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Save
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useFreelancersStore } from '@/stores/hr/freelancersStore';
import {
  Users, Banknote, Receipt, Plus, Phone, FileText, ExternalLink, Pencil, Trash2
} from 'lucide-vue-next';

const store = useFreelancersStore();

const activeTab = ref('freelancers');
const searchQuery = ref('');
const summaryMonth = ref(new Date().toISOString().substring(0, 7));
const currentMonthTotal = ref(0);

const payrollFilters = reactive({
  freelancer_id: '',
  month: ''
});

// ── Modals ──────────────────────────────────────────────────────────────────
const showFreelancerModal = ref(false);
const editingFreelancer = ref(null);
const freelancerForm = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  contract_link: '',
  notes: ''
});

const showPayrollModal = ref(false);
const editingPayroll = ref(null);
const payrollForm = reactive({
  freelancer_id: '',
  payroll_month: '',
  net_amount: 0,
  payment_date: '',
  notes: ''
});

// ── Computed ────────────────────────────────────────────────────────────────
const filteredFreelancers = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return store.freelancers;
  return store.freelancers.filter(f => {
    const full = `${f.first_name} ${f.last_name}`.toLowerCase();
    return full.includes(q) || (f.email && f.email.toLowerCase().includes(q));
  });
});

// ── Freelancers CRUD ────────────────────────────────────────────────────────
function openFreelancerModal(freelancer = null) {
  editingFreelancer.value = freelancer;
  if (freelancer) {
    Object.assign(freelancerForm, {
      first_name: freelancer.first_name || '',
      last_name: freelancer.last_name || '',
      email: freelancer.email || '',
      phone: freelancer.phone || '',
      contract_link: freelancer.contract_link || '',
      notes: freelancer.notes || ''
    });
  } else {
    Object.assign(freelancerForm, { first_name: '', last_name: '', email: '', phone: '', contract_link: '', notes: '' });
  }
  showFreelancerModal.value = true;
}

function closeFreelancerModal() { showFreelancerModal.value = false; }

async function saveFreelancer() {
  if (!freelancerForm.first_name.trim()) return alert('First Name is required.');
  const payload = { ...freelancerForm };
  if (editingFreelancer.value) {
    await store.updateFreelancer(editingFreelancer.value.id, payload);
  } else {
    await store.createFreelancer(payload);
  }
  closeFreelancerModal();
}

async function handleDeleteFreelancer(id) {
  if (!confirm('Delete this freelancer? This will soft delete their profile.')) return;
  await store.deleteFreelancer(id);
}

// ── Payrolls CRUD ───────────────────────────────────────────────────────────
function openPayrollModal(payroll = null) {
  editingPayroll.value = payroll;
  if (payroll) {
    Object.assign(payrollForm, {
      freelancer_id: payroll.freelancer_id || '',
      payroll_month: payroll.payroll_month || '',
      net_amount: payroll.net_amount || 0,
      payment_date: payroll.payment_date || '',
      notes: payroll.notes || ''
    });
  } else {
    Object.assign(payrollForm, {
      freelancer_id: '',
      payroll_month: summaryMonth.value,
      net_amount: 0,
      payment_date: new Date().toISOString().substring(0, 10),
      notes: ''
    });
  }
  showPayrollModal.value = true;
}

function closePayrollModal() { showPayrollModal.value = false; }

async function savePayroll() {
  if (!payrollForm.freelancer_id) return alert('Freelancer selection is required.');
  if (!payrollForm.payroll_month) return alert('Payroll month is required.');
  if (payrollForm.net_amount <= 0) return alert('Amount must be greater than 0.');

  const payload = { ...payrollForm };
  if (editingPayroll.value) {
    await store.updatePayroll(editingPayroll.value.id, payload);
  } else {
    await store.createPayroll(payload);
  }
  closePayrollModal();
  loadMonthTotal();
}

async function handleDeletePayroll(id) {
  if (!confirm('Delete this payroll record?')) return;
  await store.deletePayroll(id);
  loadMonthTotal();
}

async function loadPayrolls() {
  const params = {};
  if (payrollFilters.freelancer_id) params.freelancer_id = payrollFilters.freelancer_id;
  if (payrollFilters.month)          params.payroll_month  = payrollFilters.month;
  await store.fetchPayrolls(params);
}

async function loadMonthTotal() {
  try {
    currentMonthTotal.value = await store.fetchTotalByMonth(summaryMonth.value);
  } catch {
    // If endpoint doesn't exist or is overloaded, calculate locally from payrolls
    currentMonthTotal.value = store.payrolls
      .filter(p => p.payroll_month === summaryMonth.value)
      .reduce((sum, p) => sum + Number(p.net_amount || 0), 0);
  }
}

onMounted(async () => {
  await Promise.all([
    store.fetchFreelancers(),
    store.fetchPayrolls(),
  ]);
  loadMonthTotal();
});
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
