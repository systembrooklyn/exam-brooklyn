<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Official Holidays</h1>
        <p class="text-gray-500 mt-1">Manage public holidays and double-pay status</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="authStore.can(HR_PERMISSION.LINK_CONTRACT_TO_HOLIDAY)"
          type="button"
          :disabled="!canBulkUnlink || store.loading"
          class="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border"
          :class="
            canBulkUnlink && !store.loading
              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 cursor-pointer'
              : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
          "
          @click="handleBulkUnlink"
        >
          <LucideUnlink class="w-4 h-4" /> Unlink Selected
        </button>
        <button
          v-if="authStore.can(HR_PERMISSION.LINK_CONTRACT_TO_HOLIDAY)"
          @click="openLinkModal"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LucideLink class="w-4 h-4" /> Link to Contract
        </button>
        <button
          v-if="authStore.can(HR_PERMISSION.CREATE_OFFICIAL_HOLIDAYS)"
          @click="openAddModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span class="text-xl">+</span> Add Holiday
        </button>
      </div>
    </div>

    <!-- Table -->
    <HrDataTable
      :headers="headers"
      :items="holidays"
      :loading="store.loading"
      emptyMessage="No holidays found."
      :has-edit="authStore.can(HR_PERMISSION.UPDATE_OFFICIAL_HOLIDAYS)"
      :has-delete="authStore.can(HR_PERMISSION.DELETE_OFFICIAL_HOLIDAYS)"
      @edit="openEditModal"
      @delete="confirmDelete"
    >
      <template #is_double_paid="{ item }">
        <span 
          class="px-2 py-1 rounded-full text-xs font-semibold uppercase"
          :class="item.is_double_paid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
        >
          {{ item.is_double_paid ? 'Yes' : 'No' }}
        </span>
      </template>
      <template #linked_employees="{ item }">
        <div
          v-if="Array.isArray(item.linked_employees) && item.linked_employees.length"
          class="w-full min-w-[22rem]"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1.5">
            <button
              v-for="emp in visibleLinkedEmployees(item)"
              :key="`${item.id}-${emp.contract_id}`"
              type="button"
              class="inline-flex items-center justify-between gap-1.5 px-2 py-1 rounded-full border text-xs transition-colors cursor-pointer w-full min-w-0"
              :class="
                isContractSelected(item.id, emp.contract_id)
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
              "
              @click="toggleContractSelection(item.id, emp.contract_id)"
            >
              <span class="font-medium truncate">{{ emp.employee_name || `Employee #${emp.employee_id ?? '?'}` }}</span>
              <span class="opacity-70 whitespace-nowrap">(FP: {{ emp.fingerprint ?? '—' }})</span>
            </button>
          </div>
          <button
            v-if="hasMoreLinkedEmployees(item)"
            type="button"
            class="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
            @click="toggleLinkedEmployeesExpanded(item.id)"
          >
            {{ isLinkedEmployeesExpanded(item.id) ? 'See less' : `See more (${(item.linked_employees?.length || 0) - LINKED_EMPLOYEE_PREVIEW_COUNT})` }}
          </button>
        </div>
        <span v-else class="text-gray-300">—</span>
      </template>
    </HrDataTable>

    <!-- Add/Edit Modal -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Holiday' : 'New Holiday'"
      :loading="store.loading"
      @close="closeModal"
      @save="handleSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
          <input v-model="form.holiday_name" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="e.g. Eid al-Fitr" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input v-model="form.holiday_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2" />
        </div>
        <div class="flex items-center gap-2">
          <input v-model="form.is_double_paid" type="checkbox" id="double_paid" class="w-4 h-4 text-indigo-600 border-gray-300 rounded" />
          <label for="double_paid" class="text-sm font-medium text-gray-700">Double Paid</label>
        </div>
      </div>
    </HrModal>

    <!-- Link to Contract Modal -->
    <HrModal
      :show="showLinkModal"
      title="Link Holiday to Contracts"
      :loading="store.loading"
      body-overflow-visible
      @close="closeLinkModal"
      @save="handleLink"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Holiday</label>
          <select v-model="linkForm.holiday_id" class="w-full border border-gray-300 rounded-lg px-4 py-2">
            <option :value="null">Select Holiday</option>
            <option v-for="h in holidays" :key="h.id" :value="h.id">{{ h.holiday_name }}</option>
          </select>
        </div>
        <div class="relative z-10">
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Contracts</label>
          <MultiSelect
            v-model="linkForm.contract_ids"
            :options="contractOptions"
            label-key="label"
            value-key="id"
            placeholder="Select Contracts"
            multiple
          />
          <p class="text-xs text-gray-500 mt-1">
            Select one or more contracts by employee name; IDs are sent when saving.
          </p>
        </div>
      </div>
    </HrModal>

    <!-- Delete Confirmation -->
    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Delete Holiday?"
      text="This action cannot be undone."
      icon="warning"
      @confirm="handleDeleteConfirm"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useHrHolidaysStore } from '@/stores/hr/holidays';
import { useHrContractsStore } from '@/stores/hr/contracts';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import notyf from "@/components/global/notyf";
import MultiSelect from '@/components/global/MultiSelect.vue';
import { LucideLink, LucideUnlink } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { HR_PERMISSION } from '@/constants/hrPermissions';

const store = useHrHolidaysStore();
const contractStore = useHrContractsStore();
const authStore = useAuthStore();
const holidays = computed(() => store.holidays);

/** Labels for MultiSelect: show employee + type; value stays contract id. */
const contractOptions = computed(() =>
  (contractStore.contracts || []).map((c) => {
    const empName =
      c.employee?.name ||
      (c.employee?.personal_info
        ? `${c.employee.personal_info.first_name || ""} ${c.employee.personal_info.last_name || ""}`.trim()
        : "") ||
      `Employee #${c.employee_id ?? "?"}`;
    const type = c.type ? String(c.type) : "";
    const label = `${empName} (${type})`;
    return { id: c.id, label };
  }),
);

const showModal = ref(false);
const showLinkModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const showDeleteConfirm = ref(false);
const deleteId = ref(null);
const selectedHolidayId = ref(null);
const selectedContractIds = ref([]);
const expandedLinkedEmployeeHolidayIds = ref([]);
const LINKED_EMPLOYEE_PREVIEW_COUNT = 4;

const form = ref({
  holiday_name: '',
  holiday_date: '',
  is_double_paid: false
});

const linkForm = ref({
  holiday_id: null,
  contract_ids: []
});

const headers = [
  { label: 'Holiday Name', key: 'holiday_name' },
  { label: 'Date', key: 'holiday_date' },
  { label: 'Double Paid', key: 'is_double_paid' },
  { label: 'Linked Employees', key: 'linked_employees' },
];

const canBulkUnlink = computed(
  () => selectedHolidayId.value != null && selectedContractIds.value.length > 0,
);

function resetUnlinkSelection() {
  selectedHolidayId.value = null;
  selectedContractIds.value = [];
}

function isLinkedEmployeesExpanded(holidayId) {
  const h = Number(holidayId);
  if (!Number.isFinite(h)) return false;
  return expandedLinkedEmployeeHolidayIds.value.includes(h);
}

function toggleLinkedEmployeesExpanded(holidayId) {
  const h = Number(holidayId);
  if (!Number.isFinite(h)) return;
  const idx = expandedLinkedEmployeeHolidayIds.value.indexOf(h);
  if (idx >= 0) {
    expandedLinkedEmployeeHolidayIds.value.splice(idx, 1);
  } else {
    expandedLinkedEmployeeHolidayIds.value.push(h);
  }
}

function visibleLinkedEmployees(item) {
  const list = Array.isArray(item?.linked_employees) ? item.linked_employees : [];
  if (isLinkedEmployeesExpanded(item?.id)) return list;
  return list.slice(0, LINKED_EMPLOYEE_PREVIEW_COUNT);
}

function hasMoreLinkedEmployees(item) {
  const list = Array.isArray(item?.linked_employees) ? item.linked_employees : [];
  return list.length > LINKED_EMPLOYEE_PREVIEW_COUNT;
}

function isContractSelected(holidayId, contractId) {
  const h = Number(holidayId);
  const c = Number(contractId);
  if (!Number.isFinite(h) || !Number.isFinite(c)) return false;
  return selectedHolidayId.value === h && selectedContractIds.value.includes(c);
}

function toggleContractSelection(holidayId, contractId) {
  const h = Number(holidayId);
  const c = Number(contractId);
  if (!Number.isFinite(h) || !Number.isFinite(c)) return;

  if (selectedHolidayId.value == null || selectedHolidayId.value !== h) {
    selectedHolidayId.value = h;
    selectedContractIds.value = [c];
    return;
  }

  const idx = selectedContractIds.value.indexOf(c);
  if (idx >= 0) {
    selectedContractIds.value.splice(idx, 1);
    if (selectedContractIds.value.length === 0) {
      selectedHolidayId.value = null;
    }
  } else {
    selectedContractIds.value.push(c);
  }
}

onMounted(async () => {
  await store.getHolidays();
  await contractStore.getContracts();
});

const openAddModal = () => {
  isEditing.value = false;
  form.value = { holiday_name: '', holiday_date: '', is_double_paid: false };
  showModal.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  editingId.value = item.id;
  form.value = { ...item, is_double_paid: !!item.is_double_paid };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  editingId.value = null;
};

const handleSubmit = async () => {
  if (!form.value.holiday_name || !form.value.holiday_date) {
    notyf.error('Please fill in all fields');
    return;
  }
  
  const payload = {
    ...form.value,
    is_double_paid: form.value.is_double_paid ? 1 : 0
  };

  try {
    if (isEditing.value) {
      await store.updateHoliday(editingId.value, payload);
    } else {
      await store.createHoliday(payload);
    }
    closeModal();
  } catch (e) {
    console.error(e);
  }
};

const confirmDelete = (id) => {
  deleteId.value = id;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  await store.deleteHoliday(deleteId.value);
  showDeleteConfirm.value = false;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
};

const openLinkModal = () => {
  linkForm.value = { holiday_id: null, contract_ids: [] };
  showLinkModal.value = true;
};

const closeLinkModal = () => {
  showLinkModal.value = false;
};

const handleLink = async () => {
  if (!linkForm.value.holiday_id || linkForm.value.contract_ids.length === 0) {
    notyf.error('Please select a holiday and at least one contract');
    return;
  }
  try {
    await store.linkHolidayToContract(linkForm.value.holiday_id, linkForm.value.contract_ids);
    closeLinkModal();
    await store.getHolidays();
    resetUnlinkSelection();
  } catch (e) {
    console.error(e);
  }
};

const handleBulkUnlink = async () => {
  if (!canBulkUnlink.value) {
    notyf.error('Select at least one linked employee from one holiday row.');
    return;
  }
  try {
    await store.unlinkHolidayFromContract(
      selectedHolidayId.value,
      [...selectedContractIds.value],
    );
    resetUnlinkSelection();
  } catch (e) {
    console.error(e);
  }
};
</script>
