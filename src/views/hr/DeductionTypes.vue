<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Deduction Types</h1>
        <p class="text-gray-500 mt-1">
          Manage reusable deduction type definitions for payroll calculations
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="w-10 h-10 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center cursor-pointer"
          :disabled="store.loading"
          title="Refresh deduction types"
          @click="fetchDeductionTypes"
        >
          <LucideRefreshCw class="w-4 h-4" :class="{ 'animate-spin': store.loading }" />
        </button>
        <button
          v-if="canCreate"
          type="button"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          @click="openCreateModal"
        >
          <span class="text-xl">+</span> New Deduction Type
        </button>
      </div>
    </div>

    <HrDataTable
      :headers="headers"
      :items="store.deductionTypes"
      :loading="store.loading"
      :has-actions="canMutate"
      emptyMessage="No deduction types found."
    >
      <template #name="{ item }">
        <span class="text-gray-800 font-medium">{{ item.name }}</span>
      </template>
      <template #type="{ item }">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="typeClass(item.type)"
        >
          {{ formatType(item.type) }}
        </span>
      </template>
      <template #value="{ item }">
        <span class="tabular-nums text-gray-700">{{ formatValue(item) }}</span>
      </template>
      <template #targeted_salary="{ item }">
        <span class="text-gray-700">{{ formatTargetedSalary(item.targeted_salary) }}</span>
      </template>
      <template #description="{ item }">
        <span class="text-gray-500 truncate max-w-[300px] block text-wrap text-center mx-auto">{{ item.description || "-" }}</span>
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

    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Deduction Type' : 'New Deduction Type'"
      :loading="store.loading"
      @close="closeModal"
      @save="handleSubmit"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Name -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            placeholder="e.g. Full Day Deduction"
          />
        </div>

        <!-- Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Type <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.type"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          >
            <option value="">Select type</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
            <option value="static">Static</option>
            <option value="daily_rate_fraction">Daily Rate Fraction</option>
          </select>
        </div>

        <!-- Value -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Value <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="form.value"
            type="number"
            step="0.0001"
            min="0"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            placeholder="e.g. 1"
          />
        </div>

        <!-- Targeted Salary -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Targeted Salary <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.targeted_salary"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          >
            <option value="">Select targeted salary</option>
            <option value="fixed_salary">Fixed Salary</option>
            <option value="variable_salary">Variable Salary</option>
          </select>
        </div>

        <!-- Description -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            placeholder="Optional description"
          />
        </div>
      </div>
    </HrModal>

    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Delete deduction type?"
      text="This deduction type will be soft deleted."
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
import { useHrDeductionTypesStore } from "@/stores/hr/deductionTypes";
import { HR_PERMISSION } from "@/constants/hrPermissions";
import HrDataTable from "@/components/hr-dashboard/HrDataTable.vue";
import HrModal from "@/components/hr-dashboard/HrModal.vue";
import SweetAlert2Modal from "@/components/global/SweetAlert2Modal.vue";
import notyf from "@/components/global/notyf";

const authStore = useAuthStore();
const store = useHrDeductionTypesStore();

const canCreate = computed(() => authStore.can(HR_PERMISSION.CREATE_DEDUCTION_TYPE));
const canEdit = computed(() => authStore.can(HR_PERMISSION.UPDATE_DEDUCTION_TYPE));
const canDelete = computed(() => authStore.can(HR_PERMISSION.DELETE_DEDUCTION_TYPE));
const canMutate = computed(() => canEdit.value || canDelete.value);

const headers = [
  { label: "Name", key: "name" },
  { label: "Type", key: "type" },
  { label: "Value", key: "value" },
  { label: "Targeted Salary", key: "targeted_salary" },
  { label: "Description", key: "description" },
];

// ── Modal state ──────────────────────────────────────────────────────────────
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const emptyForm = () => ({
  name: "",
  type: "",
  value: 0,
  targeted_salary: "",
  description: "",
});
const form = ref(emptyForm());

// ── Delete state ─────────────────────────────────────────────────────────────
const showDeleteConfirm = ref(false);
const deleteTarget = ref(null);

// ── Formatters ───────────────────────────────────────────────────────────────
const TYPE_LABELS = {
  percentage: "Percentage",
  fixed: "Fixed",
  static: "Static",
  daily_rate_fraction: "Daily Rate Fraction",
};

const TYPE_CLASSES = {
  percentage: "bg-blue-100 text-blue-700",
  fixed: "bg-emerald-100 text-emerald-700",
  static: "bg-purple-100 text-purple-700",
  daily_rate_fraction: "bg-amber-100 text-amber-700",
};

const formatType = (type) => TYPE_LABELS[type] ?? type ?? "-";
const typeClass = (type) => TYPE_CLASSES[type] ?? "bg-gray-100 text-gray-600";

const formatValue = (item) => {
  const v = Number(item?.value ?? 0);
  if (item?.type === "percentage") return `${v}%`;
  if (item?.type === "daily_rate_fraction") return `${v || "?"}`;
  return v.toFixed(2);
};

const formatTargetedSalary = (val) => {
  if (val === "fixed_salary") return "Fixed Salary";
  if (val === "variable_salary") return "Variable Salary";
  return val ?? "-";
};

// ── CRUD actions ─────────────────────────────────────────────────────────────
const fetchDeductionTypes = async () => {
  await store.getDeductionTypes();
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
    name: item?.name ? String(item.name) : "",
    type: item?.type ?? "",
    value: Number(item?.value ?? 0),
    targeted_salary: item?.targeted_salary ?? "",
    description: item?.description ? String(item.description) : "",
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const buildPayload = () => {
  const name = String(form.value.name ?? "").trim();
  const type = form.value.type;
  const targeted_salary = form.value.targeted_salary;

  if (!name) {
    notyf.error("Name is required.");
    return null;
  }
  if (!type) {
    notyf.error("Type is required.");
    return null;
  }
  if (!targeted_salary) {
    notyf.error("Targeted salary is required.");
    return null;
  }

  return {
    name,
    type,
    value: Number(form.value.value ?? 0),
    targeted_salary,
    description: String(form.value.description ?? "").trim(),
  };
};

const handleSubmit = async () => {
  const payload = buildPayload();
  if (!payload) return;

  if (isEditing.value) {
    if (!editingId.value) return;
    await store.updateDeductionType(editingId.value, payload);
  } else {
    await store.createDeductionType(payload);
  }
  showModal.value = false;
  await fetchDeductionTypes();
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
  await store.deleteDeductionType(id);
  cancelDelete();
  await fetchDeductionTypes();
};

onMounted(async () => {
  await fetchDeductionTypes();
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
