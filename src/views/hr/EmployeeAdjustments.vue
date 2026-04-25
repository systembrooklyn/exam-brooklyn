<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Employee Adjustments</h1>
        <p class="text-gray-500 mt-1">
          Manage manual bonus and deductions by employee and month
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="w-10 h-10 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center cursor-pointer"
          :disabled="store.loading"
          title="Refresh adjustments"
          @click="fetchAdjustments"
        >
          <LucideRefreshCw class="w-4 h-4" :class="{ 'animate-spin': store.loading }" />
        </button>
        <button
          v-if="canMutateAdjustments"
          type="button"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          @click="openCreateModal"
        >
          <span class="text-xl">+</span> New Adjustment
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
        <select
          v-model="filters.employee_id"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          @change="fetchAdjustments"
        >
          <option value="">All Employees</option>
          <option v-for="emp in employeeStore.employees" :key="emp.id" :value="String(emp.id)">
            {{ employeeName(emp) }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Month</label>
        <input
          v-model="filters.month"
          type="month"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          @change="fetchAdjustments"
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

    <HrDataTable
      :headers="headers"
      :items="store.adjustments"
      :loading="store.loading"
      :has-actions="canMutateAdjustments"
      :reset-page-on-items-change="false"
      emptyMessage="No adjustments found."
    >
      <template #employee="{ item }">
        <span class="text-gray-800 font-medium">{{ rowEmployeeLabel(item) }}</span>
      </template>
      <template #month="{ item }">
        <span class="text-gray-700">{{ normalizeMonth(item.month) }}</span>
      </template>
      <template #bonus="{ item }">
        <span class="text-emerald-700 font-semibold tabular-nums">{{ formatAmount(item.bonus) }}</span>
      </template>
      <template #deductions="{ item }">
        <span class="text-rose-700 font-semibold tabular-nums">{{ formatAmount(item.deductions) }}</span>
      </template>
      <template #notes="{ item }">
        <span class="text-gray-700">{{ item.notes || "-" }}</span>
      </template>
      <template #actions="{ item }">
        <div class="flex items-center justify-center gap-3">
          <button
            type="button"
            class="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
            title="Edit"
            @click="openEditModal(item)"
          >
            <LucidePencil class="w-5 h-5" />
          </button>
          <button
            type="button"
            class="cursor-pointer text-red-500 hover:text-red-700 transition-colors"
            title="Delete"
            @click="confirmDelete(item)"
          >
            <LucideTrash2 class="w-5 h-5" />
          </button>
        </div>
      </template>
    </HrDataTable>

    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Adjustment' : 'New Adjustment'"
      :loading="store.loading"
      @close="closeModal"
      @save="handleSubmit"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="!isEditing" class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Employee <span class="text-red-500">*</span></label>
          <select
            v-model="form.employee_id"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          >
            <option value="">Select employee</option>
            <option v-for="emp in employeeStore.employees" :key="emp.id" :value="String(emp.id)">
              {{ employeeName(emp) }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Month <span class="text-red-500">*</span></label>
          <input
            v-model="form.month"
            type="month"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Bonus <span class="text-red-500">*</span></label>
          <input
            v-model.number="form.bonus"
            type="number"
            step="0.01"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deductions <span class="text-red-500">*</span></label>
          <input
            v-model.number="form.deductions"
            type="number"
            step="0.01"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
        </div>
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

    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Delete adjustment?"
      text="This adjustment will be soft deleted."
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
import { useHrEmployeeAdjustmentsStore } from "@/stores/hr/employeeAdjustments";
import { HR_PERMISSION } from "@/constants/hrPermissions";
import HrDataTable from "@/components/hr-dashboard/HrDataTable.vue";
import HrModal from "@/components/hr-dashboard/HrModal.vue";
import SweetAlert2Modal from "@/components/global/SweetAlert2Modal.vue";
import notyf from "@/components/global/notyf";

const authStore = useAuthStore();
const employeeStore = useHrEmployeesStore();
const store = useHrEmployeeAdjustmentsStore();

const canMutateAdjustments = computed(() =>
  authStore.can(HR_PERMISSION.UPDATE_PAYROLL_STATUS),
);

const headers = [
  { label: "Employee", key: "employee" },
  { label: "Month", key: "month" },
  { label: "Bonus", key: "bonus" },
  { label: "Deductions", key: "deductions" },
  { label: "Notes", key: "notes" },
];

const filters = ref({
  employee_id: "",
  month: "",
});

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const form = ref({
  employee_id: "",
  month: "",
  bonus: 0,
  deductions: 0,
  notes: "",
});

const showDeleteConfirm = ref(false);
const deleteTarget = ref(null);

const normalizeMonth = (raw) => String(raw || "").slice(0, 7);

const parseAmount = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatAmount = (v) => parseAmount(v).toFixed(2);

const employeeName = (emp) => {
  const pi = emp?.personal_info || {};
  const joined = [pi.first_name, pi.last_name].filter(Boolean).join(" ").trim();
  return (
    joined ||
    String(emp?.name || "").trim() ||
    `Employee #${emp?.id ?? "-"}`
  );
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

const fetchAdjustments = async () => {
  await store.getAdjustments({
    employee_id: filters.value.employee_id || undefined,
    month: normalizeMonth(filters.value.month) || undefined,
  });
};

const clearFilters = async () => {
  filters.value.employee_id = "";
  filters.value.month = "";
  await fetchAdjustments();
};

const openCreateModal = () => {
  form.value = {
    employee_id: "",
    month: "",
    bonus: 0,
    deductions: 0,
    notes: "",
  };
  isEditing.value = false;
  editingId.value = null;
  showModal.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  editingId.value = Number(item?.id) || null;
  form.value = {
    employee_id: String(item?.employee_id ?? item?.employee?.id ?? ""),
    month: normalizeMonth(item?.month),
    bonus: parseAmount(item?.bonus),
    deductions: parseAmount(item?.deductions),
    notes: item?.notes ? String(item.notes) : "",
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const buildPayload = () => {
  const month = normalizeMonth(form.value.month);
  const bonus = parseAmount(form.value.bonus);
  const deductions = parseAmount(form.value.deductions);

  if (!month) {
    notyf.error("Month is required.");
    return null;
  }

  if (!isEditing.value) {
    const employeeId = Number(form.value.employee_id);
    if (!Number.isFinite(employeeId) || employeeId <= 0) {
      notyf.error("Employee is required.");
      return null;
    }
    return {
      employee_id: employeeId,
      month,
      bonus,
      deductions,
      notes: form.value.notes ? String(form.value.notes).trim() : "",
    };
  }

  return {
    month,
    bonus,
    deductions,
    notes: form.value.notes ? String(form.value.notes).trim() : "",
  };
};

const handleSubmit = async () => {
  const payload = buildPayload();
  if (!payload) return;

  if (isEditing.value) {
    if (!editingId.value) return;
    await store.updateAdjustment(editingId.value, payload);
  } else {
    await store.createAdjustment(payload);
  }
  showModal.value = false;
  await fetchAdjustments();
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
  await store.deleteAdjustment(id);
  cancelDelete();
  await fetchAdjustments();
};

onMounted(async () => {
  await Promise.all([employeeStore.getEmployees(), fetchAdjustments()]);
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
