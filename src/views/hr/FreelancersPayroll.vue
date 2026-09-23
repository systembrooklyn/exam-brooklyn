<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Freelancers Payroll</h1>
        <p class="text-gray-500 mt-1">
          Manage freelancers and monthly net payouts
        </p>
      </div>

      <div v-if="canViewTotal" class="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2">
        <div>
          <p class="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Month Net Total</p>
          <p class="text-lg font-bold text-indigo-900 tabular-nums">
            {{ formatCurrency(currentMonthTotal) }} EGP
          </p>
        </div>
        <input
          v-model="summaryMonth"
          type="month"
          class="border border-indigo-200 rounded-lg px-2 py-1.5 text-sm text-indigo-800 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          @change="loadMonthTotal"
        />
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 mb-6 gap-1">
      <button
        v-if="canViewFreelancers"
        type="button"
        class="px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer"
        :class="activeTab === 'freelancers'
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-gray-400 hover:text-gray-600'"
        @click="activeTab = 'freelancers'"
      >
        Freelancers
      </button>
      <button
        v-if="canViewPayrolls"
        type="button"
        class="px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer"
        :class="activeTab === 'payrolls'
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-gray-400 hover:text-gray-600'"
        @click="activeTab = 'payrolls'"
      >
        Payroll Records
      </button>
    </div>

    <!-- Tab: Freelancers -->
    <div v-if="activeTab === 'freelancers' && canViewFreelancers">
      <div class="flex flex-wrap justify-between items-end gap-3 mb-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-w-[240px]">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              v-model="freelancerFilters.first_name"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              placeholder="Filter first name"
              @change="fetchFreelancersList"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              v-model="freelancerFilters.last_name"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              placeholder="Filter last name"
              @change="fetchFreelancersList"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="freelancerFilters.email"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              placeholder="Filter email"
              @change="fetchFreelancersList"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm cursor-pointer"
            @click="clearFreelancerFilters"
          >
            Clear Filters
          </button>
          <button
            type="button"
            class="w-10 h-10 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 inline-flex items-center justify-center cursor-pointer disabled:opacity-60"
            :disabled="store.loading"
            title="Refresh"
            @click="fetchFreelancersList"
          >
            <LucideRefreshCw class="w-4 h-4" :class="{ 'animate-spin': store.loading }" />
          </button>
          <button
            v-if="canCreateFreelancer"
            type="button"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
            @click="openFreelancerModal()"
          >
            <span class="text-xl leading-none">+</span> Add Freelancer
          </button>
        </div>
      </div>

      <HrDataTable
        :headers="freelancerHeaders"
        :items="store.freelancers"
        :loading="store.loading"
        :has-actions="canMutateFreelancer || canViewPayrolls"
        empty-message="No freelancers found."
      >
        <template #name="{ item }">
          <span class="text-gray-800 font-medium">{{ freelancerFullName(item) }}</span>
        </template>
        <template #email="{ item }">
          <span class="text-gray-700">{{ item.email || "—" }}</span>
        </template>
        <template #phone="{ item }">
          <span class="text-gray-700">{{ item.phone || "—" }}</span>
        </template>
        <template #contract_link="{ item }">
          <a
            v-if="item.contract_link"
            :href="item.contract_link"
            target="_blank"
            rel="noopener noreferrer"
            class="text-indigo-600 hover:underline text-sm"
          >
            View
          </a>
          <span v-else class="text-gray-400">—</span>
        </template>
        <template #notes="{ item }">
          <span class="text-gray-500 text-sm line-clamp-2">{{ item.notes || "—" }}</span>
        </template>
        <template #actions="{ item }">
          <div class="flex items-center justify-center gap-3">
            <button
              v-if="canViewPayrolls"
              type="button"
              class="cursor-pointer text-indigo-600 hover:text-indigo-800 transition-colors"
              title="View payrolls"
              @click="viewPayrollsForFreelancer(item)"
            >
              <LucideReceipt class="w-5 h-5" />
            </button>
            <button
              v-if="canUpdateFreelancer"
              type="button"
              class="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
              title="Edit"
              @click="openFreelancerModal(item)"
            >
              <LucidePencil class="w-5 h-5" />
            </button>
            <button
              v-if="canDeleteFreelancer"
              type="button"
              class="cursor-pointer text-red-500 hover:text-red-700 transition-colors"
              title="Delete"
              @click="confirmDeleteFreelancer(item)"
            >
              <LucideTrash2 class="w-5 h-5" />
            </button>
          </div>
        </template>
      </HrDataTable>
    </div>

    <!-- Tab: Payroll Records -->
    <div v-else-if="activeTab === 'payrolls' && canViewPayrolls">
      <div class="flex flex-wrap justify-between items-end gap-3 mb-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 min-w-[240px]">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Freelancer</label>
            <SearchableSelect
              v-model="payrollFilters.freelancer_id"
              :options="freelancerOptions"
              placeholder="All Freelancers"
              clear-label="All Freelancers"
              search-placeholder="Search name..."
              @change="fetchPayrollsList"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Payroll Month</label>
            <input
              v-model="payrollFilters.payroll_month"
              type="month"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              @change="fetchPayrollsList"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              v-model="payrollFilters.from"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              @change="fetchPayrollsList"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              v-model="payrollFilters.to"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              @change="fetchPayrollsList"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm cursor-pointer"
            @click="clearPayrollFilters"
          >
            Clear Filters
          </button>
          <button
            type="button"
            class="w-10 h-10 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 inline-flex items-center justify-center cursor-pointer disabled:opacity-60"
            :disabled="store.loading"
            title="Refresh"
            @click="fetchPayrollsList"
          >
            <LucideRefreshCw class="w-4 h-4" :class="{ 'animate-spin': store.loading }" />
          </button>
          <button
            v-if="canCreatePayroll"
            type="button"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
            @click="openPayrollModal()"
          >
            <span class="text-xl leading-none">+</span> Add Payroll
          </button>
        </div>
      </div>

      <HrDataTable
        :headers="payrollHeaders"
        :items="store.payrolls"
        :loading="store.loading"
        :has-actions="canMutatePayroll"
        empty-message="No payroll records found."
      >
        <template #freelancer="{ item }">
          <span class="text-gray-800 font-medium">{{ payrollFreelancerLabel(item) }}</span>
        </template>
        <template #payroll_month="{ item }">
          <span class="text-gray-700">{{ normalizeMonth(item.payroll_month) || "—" }}</span>
        </template>
        <template #net_amount="{ item }">
          <span class="tabular-nums text-gray-700">{{ formatCurrency(item.net_amount) }}</span>
        </template>
        <template #payment_date="{ item }">
          <span class="text-gray-700">{{ item.payment_date || "—" }}</span>
        </template>
        <template #notes="{ item }">
          <span class="text-gray-500 text-sm">{{ item.notes || "—" }}</span>
        </template>
        <template #actions="{ item }">
          <div class="flex items-center justify-center gap-3">
            <button
              v-if="canUpdatePayroll"
              type="button"
              class="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
              title="Edit"
              @click="openPayrollModal(item)"
            >
              <LucidePencil class="w-5 h-5" />
            </button>
            <button
              v-if="canDeletePayroll"
              type="button"
              class="cursor-pointer text-red-500 hover:text-red-700 transition-colors"
              title="Delete"
              @click="confirmDeletePayroll(item)"
            >
              <LucideTrash2 class="w-5 h-5" />
            </button>
          </div>
        </template>
      </HrDataTable>
    </div>

    <div v-else class="text-center py-16 text-gray-500">
      You do not have permission to view this section.
    </div>

    <!-- Freelancer Modal -->
    <HrModal
      :show="showFreelancerModal"
      :title="editingFreelancer ? 'Edit Freelancer' : 'Add Freelancer'"
      :loading="store.submitting"
      @close="closeFreelancerModal"
      @save="saveFreelancer"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            First Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="freelancerForm.first_name"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            placeholder="John"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            v-model="freelancerForm.last_name"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            placeholder="Doe"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="freelancerForm.email"
            type="email"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            v-model="freelancerForm.phone"
            type="text"
            maxlength="20"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            placeholder="+201234567890"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Contract Link</label>
          <input
            v-model="freelancerForm.contract_link"
            type="url"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            placeholder="https://example.com/contract.pdf"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            v-model="freelancerForm.notes"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            placeholder="Optional notes"
          />
        </div>
      </div>
    </HrModal>

    <!-- Payroll Modal -->
    <HrModal
      :show="showPayrollModal"
      :title="editingPayroll ? 'Edit Payroll Record' : 'Add Payroll Record'"
      :loading="store.submitting"
      @close="closePayrollModal"
      @save="savePayroll"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Freelancer <span class="text-red-500">*</span>
          </label>
          <SearchableSelect
            v-model="payrollForm.freelancer_id"
            :options="freelancerOptions"
            placeholder="Select freelancer"
            clear-label="Select freelancer"
            search-placeholder="Search name..."
            :clearable="false"
            :disabled="!!editingPayroll"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Payroll Month <span class="text-red-500">*</span>
          </label>
          <input
            v-model="payrollForm.payroll_month"
            type="month"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Net Amount <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="payrollForm.net_amount"
            type="number"
            min="0"
            step="0.01"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
          <input
            v-model="payrollForm.payment_date"
            type="date"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            v-model="payrollForm.notes"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            placeholder="Optional notes"
          />
        </div>
      </div>
    </HrModal>

    <SweetAlert2Modal
      v-if="showDeleteFreelancerConfirm"
      title="Delete freelancer?"
      text="This will soft delete the freelancer profile."
      icon="warning"
      confirmButtonText="Yes, delete"
      cancelButtonText="Cancel"
      @confirm="handleDeleteFreelancer"
      @cancel="cancelDeleteFreelancer"
    />

    <SweetAlert2Modal
      v-if="showDeletePayrollConfirm"
      title="Delete payroll record?"
      text="This will soft delete the payroll record."
      icon="warning"
      confirmButtonText="Yes, delete"
      cancelButtonText="Cancel"
      @confirm="handleDeletePayroll"
      @cancel="cancelDeletePayroll"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { LucidePencil, LucideReceipt, LucideRefreshCw, LucideTrash2 } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useFreelancersStore } from "@/stores/hr/freelancersStore";
import { HR_PERMISSION } from "@/constants/hrPermissions";
import HrDataTable from "@/components/hr-dashboard/HrDataTable.vue";
import HrModal from "@/components/hr-dashboard/HrModal.vue";
import SweetAlert2Modal from "@/components/global/SweetAlert2Modal.vue";
import SearchableSelect from "@/components/global/SearchableSelect.vue";
import notyf from "@/components/global/notyf";

const authStore = useAuthStore();
const store = useFreelancersStore();

function canFreelancerModule(slug) {
  return (
    authStore.isAdminUser ||
    authStore.hasHrRoleOrHrPermission ||
    authStore.can(slug)
  );
}

const canViewFreelancers = computed(() =>
  canFreelancerModule(HR_PERMISSION.VIEW_FREELANCERS),
);
const canCreateFreelancer = computed(() =>
  canFreelancerModule(HR_PERMISSION.CREATE_FREELANCERS),
);
const canUpdateFreelancer = computed(() =>
  canFreelancerModule(HR_PERMISSION.UPDATE_FREELANCERS),
);
const canDeleteFreelancer = computed(() =>
  canFreelancerModule(HR_PERMISSION.DELETE_FREELANCERS),
);
const canMutateFreelancer = computed(
  () => canUpdateFreelancer.value || canDeleteFreelancer.value,
);

const canViewPayrolls = computed(() =>
  canFreelancerModule(HR_PERMISSION.VIEW_FREELANCER_PAYROLLS),
);
const canCreatePayroll = computed(() =>
  canFreelancerModule(HR_PERMISSION.CREATE_FREELANCER_PAYROLLS),
);
const canUpdatePayroll = computed(() =>
  canFreelancerModule(HR_PERMISSION.UPDATE_FREELANCER_PAYROLLS),
);
const canDeletePayroll = computed(() =>
  canFreelancerModule(HR_PERMISSION.DELETE_FREELANCER_PAYROLLS),
);
const canMutatePayroll = computed(
  () => canUpdatePayroll.value || canDeletePayroll.value,
);

const canViewTotal = computed(() =>
  canFreelancerModule(HR_PERMISSION.VIEW_FREELANCER_PAYROLL_TOTAL),
);

const activeTab = ref(
  canViewFreelancers.value ? "freelancers" : canViewPayrolls.value ? "payrolls" : "freelancers",
);

watch([canViewFreelancers, canViewPayrolls], () => {
  if (activeTab.value === "freelancers" && !canViewFreelancers.value && canViewPayrolls.value) {
    activeTab.value = "payrolls";
  } else if (activeTab.value === "payrolls" && !canViewPayrolls.value && canViewFreelancers.value) {
    activeTab.value = "freelancers";
  }
});

const getCurrentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const normalizeMonth = (raw) => String(raw || "").slice(0, 7);

const formatCurrency = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const freelancerFullName = (item) => {
  const name = item?.full_name || `Freelancer #${item?.id ?? "—"}`;
    return name;
  };

  const payrollFreelancerLabel = (item) => {
    return freelancerFullName(item?.freelancer);
};

const summaryMonth = ref(getCurrentMonth());
const currentMonthTotal = ref(0);

const freelancerFilters = reactive({
  first_name: "",
  last_name: "",
  email: "",
});

const payrollFilters = reactive({
  freelancer_id: "",
  payroll_month: "",
  from: "",
  to: "",
});

const freelancerHeaders = [
  { label: "Name", key: "name" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phone" },
  { label: "Contract", key: "contract_link" },
  { label: "Notes", key: "notes" },
];

const payrollHeaders = [
  { label: "Freelancer", key: "freelancer" },
  { label: "Payroll Month", key: "payroll_month" },
  { label: "Net Amount", key: "net_amount" },
  { label: "Payment Date", key: "payment_date" },
  { label: "Notes", key: "notes" },
];

const freelancerOptions = computed(() =>
  (store.freelancers ?? []).map((f) => ({
    value: String(f.id),
    label: freelancerFullName(f),
  })),
);

// ── Freelancer modal ────────────────────────────────────────────────────────
const showFreelancerModal = ref(false);
const editingFreelancer = ref(null);
const freelancerFormSnapshot = ref(null);
const freelancerForm = reactive({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  contract_link: "",
  notes: "",
});

function resetFreelancerForm() {
  Object.assign(freelancerForm, {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    contract_link: "",
    notes: "",
  });
}

function normalizeOptional(value) {
  const s = String(value ?? "").trim();
  return s || null;
}

function freelancerFormValues() {
  return {
    first_name: String(freelancerForm.first_name || "").trim(),
    last_name: normalizeOptional(freelancerForm.last_name),
    email: normalizeOptional(freelancerForm.email),
    phone: normalizeOptional(freelancerForm.phone),
    contract_link: normalizeOptional(freelancerForm.contract_link),
    notes: normalizeOptional(freelancerForm.notes),
  };
}

function openFreelancerModal(freelancer = null) {
  editingFreelancer.value = freelancer;
  if (freelancer) {
    Object.assign(freelancerForm, {
      first_name: freelancer.first_name || "",
      last_name: freelancer.last_name || "",
      email: freelancer.email || "",
      phone: freelancer.phone || "",
      contract_link: freelancer.contract_link || "",
      notes: freelancer.notes || "",
    });
    freelancerFormSnapshot.value = freelancerFormValues();
  } else {
    resetFreelancerForm();
    freelancerFormSnapshot.value = null;
  }
  showFreelancerModal.value = true;
}

function closeFreelancerModal() {
  showFreelancerModal.value = false;
  editingFreelancer.value = null;
  freelancerFormSnapshot.value = null;
}

async function saveFreelancer() {
  if (!String(freelancerForm.first_name || "").trim()) {
    notyf.error("First name is required.");
    return;
  }
  const phone = String(freelancerForm.phone || "").trim();
  if (phone.length > 20) {
    notyf.error("Phone must be at most 20 characters.");
    return;
  }

  const current = freelancerFormValues();

  try {
    if (editingFreelancer.value) {
      const original = freelancerFormSnapshot.value || {};
      const payload = {};
      for (const key of Object.keys(current)) {
        if (current[key] !== original[key]) payload[key] = current[key];
      }
      if (Object.keys(payload).length === 0) {
        notyf.error("No changes to save.");
        return;
      }
      await store.updateFreelancer(editingFreelancer.value.id, payload);
    } else {
      await store.createFreelancer(current);
    }
    closeFreelancerModal();
    await fetchFreelancersList();
  } catch {
    // handleError already toasted
  }
}

const showDeleteFreelancerConfirm = ref(false);
const deleteFreelancerTarget = ref(null);

function confirmDeleteFreelancer(item) {
  deleteFreelancerTarget.value = item;
  showDeleteFreelancerConfirm.value = true;
}

function cancelDeleteFreelancer() {
  showDeleteFreelancerConfirm.value = false;
  deleteFreelancerTarget.value = null;
}

async function handleDeleteFreelancer() {
  const id = Number(deleteFreelancerTarget.value?.id);
  cancelDeleteFreelancer();
  if (!Number.isFinite(id) || id <= 0) return;
  try {
    await store.deleteFreelancer(id);
    await fetchFreelancersList();
  } catch {
    // handled
  }
}

// ── Payroll modal ───────────────────────────────────────────────────────────
const showPayrollModal = ref(false);
const editingPayroll = ref(null);
const payrollFormSnapshot = ref(null);
const payrollForm = reactive({
  freelancer_id: "",
  payroll_month: "",
  net_amount: 0,
  payment_date: "",
  notes: "",
});

function payrollFormValues() {
  return {
    freelancer_id: Number(payrollForm.freelancer_id) || 0,
    payroll_month: normalizeMonth(payrollForm.payroll_month),
    net_amount: Number(payrollForm.net_amount),
    payment_date: normalizeOptional(payrollForm.payment_date),
    notes: normalizeOptional(payrollForm.notes),
  };
}

function openPayrollModal(payroll = null) {
  editingPayroll.value = payroll;
  if (payroll) {
    Object.assign(payrollForm, {
      freelancer_id: String(payroll.freelancer_id ?? payroll.freelancer?.id ?? ""),
      payroll_month: normalizeMonth(payroll.payroll_month),
      net_amount: Number(payroll.net_amount) || 0,
      payment_date: payroll.payment_date || "",
      notes: payroll.notes || "",
    });
    payrollFormSnapshot.value = payrollFormValues();
  } else {
    Object.assign(payrollForm, {
      freelancer_id: payrollFilters.freelancer_id || "",
      payroll_month: summaryMonth.value || getCurrentMonth(),
      net_amount: 0,
      payment_date: "",
      notes: "",
    });
    payrollFormSnapshot.value = null;
  }
  showPayrollModal.value = true;
}

function closePayrollModal() {
  showPayrollModal.value = false;
  editingPayroll.value = null;
  payrollFormSnapshot.value = null;
}

async function savePayroll() {
  const current = payrollFormValues();

  if (!Number.isFinite(current.freelancer_id) || current.freelancer_id <= 0) {
    notyf.error("Freelancer is required.");
    return;
  }
  if (!current.payroll_month || current.payroll_month.length !== 7) {
    notyf.error("Payroll month is required.");
    return;
  }
  if (!Number.isFinite(current.net_amount) || current.net_amount < 0) {
    notyf.error("Net amount must be 0 or greater.");
    return;
  }

  try {
    if (editingPayroll.value) {
      const original = payrollFormSnapshot.value || {};
      const payload = {};
      for (const key of Object.keys(current)) {
        if (current[key] !== original[key]) payload[key] = current[key];
      }
      if (Object.keys(payload).length === 0) {
        notyf.error("No changes to save.");
        return;
      }
      await store.updatePayroll(editingPayroll.value.id, payload);
    } else {
      await store.createPayroll(current);
    }
    closePayrollModal();
    await fetchPayrollsList();
    await loadMonthTotal();
  } catch {
    // handled
  }
}

const showDeletePayrollConfirm = ref(false);
const deletePayrollTarget = ref(null);

function confirmDeletePayroll(item) {
  deletePayrollTarget.value = item;
  showDeletePayrollConfirm.value = true;
}

function cancelDeletePayroll() {
  showDeletePayrollConfirm.value = false;
  deletePayrollTarget.value = null;
}

async function handleDeletePayroll() {
  const id = Number(deletePayrollTarget.value?.id);
  cancelDeletePayroll();
  if (!Number.isFinite(id) || id <= 0) return;
  try {
    await store.deletePayroll(id);
    await fetchPayrollsList();
    await loadMonthTotal();
  } catch {
    // handled
  }
}

// ── Lists / filters ─────────────────────────────────────────────────────────
async function fetchFreelancersList() {
  if (!canViewFreelancers.value) return;
  await store.fetchFreelancers({
    first_name: freelancerFilters.first_name.trim() || undefined,
    last_name: freelancerFilters.last_name.trim() || undefined,
    email: freelancerFilters.email.trim() || undefined,
  });
}

async function clearFreelancerFilters() {
  freelancerFilters.first_name = "";
  freelancerFilters.last_name = "";
  freelancerFilters.email = "";
  await fetchFreelancersList();
}

async function fetchPayrollsList() {
  if (!canViewPayrolls.value) return;
  await store.fetchPayrolls({
    freelancer_id: payrollFilters.freelancer_id || undefined,
    payroll_month: normalizeMonth(payrollFilters.payroll_month) || undefined,
    from: payrollFilters.from || undefined,
    to: payrollFilters.to || undefined,
  });
}

async function clearPayrollFilters() {
  payrollFilters.freelancer_id = "";
  payrollFilters.payroll_month = "";
  payrollFilters.from = "";
  payrollFilters.to = "";
  await fetchPayrollsList();
}

async function viewPayrollsForFreelancer(freelancer) {
  if (!canViewPayrolls.value || !freelancer?.id) return;
  payrollFilters.freelancer_id = String(freelancer.id);
  payrollFilters.payroll_month = "";
  payrollFilters.from = "";
  payrollFilters.to = "";
  activeTab.value = "payrolls";
  try {
    await store.fetchPayrollsForFreelancer(freelancer.id);
  } catch {
    await fetchPayrollsList();
  }
}

async function loadMonthTotal() {
  if (!canViewTotal.value) {
    currentMonthTotal.value = 0;
    return;
  }
  const month = normalizeMonth(summaryMonth.value);
  if (!month) return;
  try {
    currentMonthTotal.value = await store.fetchTotalByMonth(month);
  } catch {
    // Keep last known total; handleError already toasted — do not invent 0
  }
}

onMounted(async () => {
  const tasks = [];
  if (canViewFreelancers.value) tasks.push(fetchFreelancersList());
  else if (canViewPayrolls.value) {
    // Need freelancer names for payroll filter/select
    tasks.push(store.fetchFreelancers().catch(() => []));
  }
  if (canViewPayrolls.value) tasks.push(fetchPayrollsList());
  if (canViewTotal.value) tasks.push(loadMonthTotal());
  await Promise.all(tasks);

  if (!canViewFreelancers.value && canViewPayrolls.value) {
    activeTab.value = "payrolls";
  }
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
