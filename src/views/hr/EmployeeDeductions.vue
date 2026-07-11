<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Employee Deductions</h1>
        <p class="text-gray-500 mt-1">
          Assign and manage deduction entries linked to employees by payroll month
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="w-10 h-10 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center cursor-pointer"
          :disabled="store.loading"
          title="Refresh"
          @click="fetchDeductions"
        >
          <LucideRefreshCw class="w-4 h-4" :class="{ 'animate-spin': store.loading }" />
        </button>
        <button
          v-if="canCreate"
          type="button"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          @click="openCreateModal"
        >
          <span class="text-xl">+</span> New Deduction
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
        <SearchableSelect
          v-model="filters.employee_id"
          :options="employeeOptions"
          placeholder="All Employees"
          clear-label="All Employees"
          search-placeholder="Search name..."
          @change="fetchDeductions"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Payroll Month</label>
        <input
          v-model="filters.payroll_month"
          type="month"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          @change="fetchDeductions"
        />
      </div>
      <div class="flex items-end">
        <button
          type="button"
          class="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          @click="clearFilters"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Table -->
    <HrDataTable
      :headers="headers"
      :items="store.employeeDeductions"
      :loading="store.loading"
      :has-actions="canMutate"
      emptyMessage="No employee deductions found."
    >
      <template #employee="{ item }">
        <span class="text-gray-800 font-medium">{{ rowEmployeeLabel(item) }}</span>
      </template>
      <template #deduction_type="{ item }">
        <span
          v-if="item.deduction_type"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="typeClass(item.deduction_type?.type)"
        >
          {{ item.deduction_type?.name ?? "-" }}
        </span>
        <span v-else class="text-gray-400">-</span>
      </template>
      <template #payroll_month="{ item }">
        <span class="text-gray-700">{{ normalizeMonth(item.payroll_month) }}</span>
      </template>
      <template #amount="{ item }">
        <span class="tabular-nums text-gray-700">
          {{ item.amount != null ? Number(item.amount).toFixed(2) : "-" }}
        </span>
      </template>
      <template #approved_by="{ item }">
        <span class="text-gray-700">{{ approvedByLabel(item) }}</span>
      </template>
      <template #notes="{ item }">
        <span class="text-gray-500 text-center block">{{ item.notes || "-" }}</span>
      </template>
      <template #actions="{ item }">
        <div class="flex items-center justify-center gap-3">
          <button
            type="button"
            class="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
            title="Edit"
            @click="openEditModal(item)"
            v-if="canEdit"
          >
            <LucidePencil class="w-5 h-5" />
          </button>
          <button
            type="button"
            class="cursor-pointer text-red-500 hover:text-red-700 transition-colors"
            title="Delete"
            @click="confirmDelete(item)"
            v-if="canDelete"
          >
            <LucideTrash2 class="w-5 h-5" />
          </button>
        </div>
      </template>
    </HrDataTable>

    <!-- Create / Edit Modal -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Employee Deduction' : 'New Employee Deduction'"
      :loading="store.loading"
      @close="closeModal"
      @save="handleSubmit"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Employee -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Employee <span class="text-red-500">*</span>
          </label>
          <SearchableSelect
            v-model="form.employee_id"
            :options="employeeOptions"
            placeholder="Select employee"
            clear-label="Select employee"
            search-placeholder="Search name..."
            :clearable="false"
          />
        </div>

        <!-- Deduction Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Deduction Type <span class="text-red-500">*</span>
          </label>
          <SearchableSelect
            v-model="form.deduction_type_id"
            :options="deductionTypeOptions"
            placeholder="Select deduction type"
            clear-label="Select deduction type"
            search-placeholder="Search type..."
            :clearable="false"
            @change="onDeductionTypeChange"
          />
        </div>

        <!-- Payroll Month -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Payroll Month <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.payroll_month"
            type="month"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
          <p v-if="payrollMonthHint" class="mt-1.5 flex items-center gap-1 text-xs text-indigo-600 font-medium">
            <span>→</span>
            <span>Payroll period: <strong>{{ form.payroll_month }}</strong></span>
          </p>
        </div>

        <!-- Amount — only required for static deduction type -->
        <div v-if="selectedDeductionType?.type === 'static'" class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Amount <span class="text-red-500">*</span>
            <span class="text-xs text-indigo-500 ml-1">(required for Static type)</span>
          </label>
          <input
            v-model.number="form.amount"
            type="number"
            step="0.01"
            min="0"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            placeholder="e.g. 200.00"
          />
        </div>

        <!-- Approved By -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Approved By
            <span class="text-xs text-gray-400 ml-1">(optional)</span>
          </label>
          <SearchableSelect
            v-model="form.approved_by"
            :options="employeeOptions"
            placeholder="None"
            clear-label="None"
            search-placeholder="Search name..."
          />
        </div>

        <!-- Notes -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            placeholder="Optional notes"
          />
        </div>
      </div>
    </HrModal>

    <!-- Delete confirmation -->
    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Delete employee deduction?"
      text="This deduction record will be soft deleted."
      icon="warning"
      confirmButtonText="Yes, delete"
      cancelButtonText="Cancel"
      @confirm="handleDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { LucidePencil, LucideRefreshCw, LucideTrash2 } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useHrEmployeesStore } from "@/stores/hr/employees";
import { useHrDeductionTypesStore } from "@/stores/hr/deductionTypes";
import { useHrEmployeeDeductionsStore } from "@/stores/hr/employeeDeductions";
import { HR_PERMISSION } from "@/constants/hrPermissions";
import HrDataTable from "@/components/hr-dashboard/HrDataTable.vue";
import HrModal from "@/components/hr-dashboard/HrModal.vue";
import SweetAlert2Modal from "@/components/global/SweetAlert2Modal.vue";
import SearchableSelect from "@/components/global/SearchableSelect.vue";
import notyf from "@/components/global/notyf";

const authStore = useAuthStore();
const employeeStore = useHrEmployeesStore();
const deductionTypesStore = useHrDeductionTypesStore();
const store = useHrEmployeeDeductionsStore();

const canCreate = computed(() => authStore.can(HR_PERMISSION.CREATE_EMPLOYEE_DEDUCTION));

const canEdit = computed(() => authStore.can(HR_PERMISSION.UPDATE_EMPLOYEE_DEDUCTION));
const canDelete = computed(() => authStore.can(HR_PERMISSION.DELETE_EMPLOYEE_DEDUCTION));

const canMutate = computed(() => canEdit.value || canDelete.value);



const headers = [
  { label: "Employee", key: "employee" },
  { label: "Deduction Type", key: "deduction_type" },
  { label: "Payroll Month", key: "payroll_month" },
  { label: "Amount", key: "amount" },
  { label: "Approved By", key: "approved_by" },
  { label: "Notes", key: "notes" },
];

// ── Filters ──────────────────────────────────────────────────────────────────
const getCurrentMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const filters = ref({ employee_id: "", payroll_month: getCurrentMonth() });

const normalizeMonth = (raw) => String(raw || "").slice(0, 7);

/** Converts "YYYY-MM" → "YYYY-MM-20" as required by the API */
const toApiMonth = (raw) => {
  const m = normalizeMonth(raw);
  return m.length === 7 ? `${m}-20` : m;
};

/** Converts "2026-05" → "May 2026" for the hint label */
const payrollMonthHint = computed(() => {
  const val = normalizeMonth(form.value.payroll_month);
  if (!val || val.length < 7) return "";
  const [year, month] = val.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
});

// ── Select options ────────────────────────────────────────────────────────────
const employeeOptions = computed(() =>
  (employeeStore.employees ?? []).map((emp) => ({
    value: String(emp.id),
    label: employeeName(emp),
  }))
);

const deductionTypeOptions = computed(() =>
  (deductionTypesStore.deductionTypes ?? []).map((dt) => ({
    value: String(dt.id),
    label: `${dt.name} (${dt.type})`,
    searchText: dt.type,
  }))
);

// ── Modal state ───────────────────────────────────────────────────────────────
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

const emptyForm = () => ({
  employee_id: "",
  deduction_type_id: "",
  payroll_month: getCurrentMonth(),
  amount: null,
  notes: "",
  approved_by: "",
});
const form = ref(emptyForm());

// ── Delete state ──────────────────────────────────────────────────────────────
const showDeleteConfirm = ref(false);
const deleteTarget = ref(null);

// ── Type badge helpers ────────────────────────────────────────────────────────
const TYPE_CLASSES = {
  percentage: "bg-blue-100 text-blue-700",
  fixed: "bg-emerald-100 text-emerald-700",
  static: "bg-purple-100 text-purple-700",
  daily_rate_fraction: "bg-amber-100 text-amber-700",
};
const typeClass = (type) => TYPE_CLASSES[type] ?? "bg-gray-100 text-gray-600";

// ── Selected deduction type (for conditional amount field) ────────────────────
const selectedDeductionType = computed(() => {
  const id = Number(form.value.deduction_type_id);
  if (!id) return null;
  return deductionTypesStore.deductionTypes.find((dt) => Number(dt.id) === id) ?? null;
});

const onDeductionTypeChange = () => {
  // Clear amount when switching away from static type
  if (selectedDeductionType.value?.type !== "static") {
    form.value.amount = null;
  }
};

// ── Label helpers ─────────────────────────────────────────────────────────────
const employeeName = (emp) => {
  const pi = emp?.personal_info || {};
  const joined = [pi.first_name, pi.last_name].filter(Boolean).join(" ").trim();
  return joined || String(emp?.name || "").trim() || `Employee #${emp?.id ?? "-"}`;
};

const rowEmployeeLabel = (item) => {
  const rowEmp = item?.employee;
  if (rowEmp?.name) return rowEmp.name;
  if (rowEmp?.personal_info) {
    const name = [rowEmp.personal_info.first_name, rowEmp.personal_info.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (name) return name;
  }
  const id = Number(item?.employee_id ?? rowEmp?.id);
  if (Number.isFinite(id) && id > 0) {
    const emp = (employeeStore.employees || []).find((e) => Number(e.id) === id);
    if (emp) return employeeName(emp);
  }
  return id > 0 ? `Employee #${id}` : "-";
};

const approvedByLabel = (item) => {
  const approver = item?.approved_by;
  if (approver?.name) return approver.name;
  if (approver?.personal_info) {
    const name = [approver.personal_info.first_name, approver.personal_info.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (name) return name;
  }
  const id = Number(item?.approved_by);
  if (Number.isFinite(id) && id > 0) {
    const emp = (employeeStore.employees || []).find((e) => Number(e.id) === id);
    if (emp) return employeeName(emp);
    return `Employee #${id}`;
  }
  return "-";
};

// ── CRUD ──────────────────────────────────────────────────────────────────────
const fetchDeductions = async () => {
  const month = normalizeMonth(filters.value.payroll_month);
  await store.getEmployeeDeductions({
    employee_id: filters.value.employee_id || undefined,
    payroll_month: month ? toApiMonth(month) : undefined,
  });
};

const clearFilters = async () => {
  filters.value.employee_id = "";
  filters.value.payroll_month = "";
  await fetchDeductions();
};

const openCreateModal = () => {
  form.value = emptyForm();
  isEditing.value = false;
  editingId.value = null;
  showModal.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  editingId.value = Number(item?.id) || null;
  form.value = {
    employee_id: String(item?.employee_id ?? item?.employee?.id ?? ""),
    deduction_type_id: String(item?.deduction_type_id ?? item?.deduction_type?.id ?? ""),
    payroll_month: normalizeMonth(item?.payroll_month),
    amount: item?.amount != null ? Number(item.amount) : null,
    notes: item?.notes ? String(item.notes) : "",
    approved_by: item?.approved_by != null ? String(item.approved_by) : "",
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const buildPayload = () => {
  const employee_id = Number(form.value.employee_id);
  const deduction_type_id = Number(form.value.deduction_type_id);
  const payroll_month = normalizeMonth(form.value.payroll_month);

  if (!Number.isFinite(employee_id) || employee_id <= 0) {
    notyf.error("Employee is required.");
    return null;
  }
  if (!Number.isFinite(deduction_type_id) || deduction_type_id <= 0) {
    notyf.error("Deduction type is required.");
    return null;
  }
  if (!payroll_month) {
    notyf.error("Payroll month is required.");
    return null;
  }

  // amount is required only for static type
  let amount = null;
  if (selectedDeductionType.value?.type === "static") {
    const parsed = Number(form.value.amount);
    if (!Number.isFinite(parsed) || parsed < 0) {
      notyf.error("Amount is required for Static deduction types.");
      return null;
    }
    amount = parsed;
  }

  const approved_by_raw = Number(form.value.approved_by);
  const approved_by =
    Number.isFinite(approved_by_raw) && approved_by_raw > 0 ? approved_by_raw : null;

  return {
    employee_id,
    deduction_type_id,
    payroll_month: toApiMonth(form.value.payroll_month),
    amount,
    notes: String(form.value.notes ?? "").trim() || null,
    ...(approved_by !== null ? { approved_by } : {}),
  };
};

const handleSubmit = async () => {
  const payload = buildPayload();
  if (!payload) return;

  if (isEditing.value) {
    if (!editingId.value) return;
    await store.updateEmployeeDeduction(editingId.value, payload);
  } else {
    await store.createEmployeeDeduction(payload);
  }
  showModal.value = false;
  await fetchDeductions();
};

const confirmDelete = (item) => {
  deleteTarget.value = item;
  showDeleteConfirm.value = true;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  deleteTarget.value = null;
};

const handleDelete = async () => {
  const id = Number(deleteTarget.value?.id);
  if (!Number.isFinite(id) || id <= 0) {
    cancelDelete();
    return;
  }
  await store.deleteEmployeeDeduction(id);
  cancelDelete();
  await fetchDeductions();
};

onMounted(async () => {
  await Promise.all([
    employeeStore.getEmployees(),
    deductionTypesStore.getDeductionTypes(),
    fetchDeductions(),
  ]);
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
