<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Official Holidays</h1>
        <p class="text-gray-500 mt-1">Manage public holidays and double-pay status</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="openLinkModal"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <LucideLink class="w-4 h-4" /> Link to Contract
        </button>
        <button
          @click="openAddModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
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
      @close="showLinkModal = false"
      @save="handleLink"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Holiday</label>
          <select v-model="linkForm.holiday_id" class="w-full border border-gray-300 rounded-lg px-4 py-2">
            <option v-for="h in holidays" :key="h.id" :value="h.id">{{ h.holiday_name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Contracts</label>
          <MultiSelect
            v-model="linkForm.contract_ids"
            :options="contractStore.contracts"
            labelKey="id"
            valueKey="id"
            placeholder="Select Contracts"
            multiple
          />
          <p class="text-xs text-gray-500 mt-1">Select one or more contracts (IDs) to apply this holiday to.</p>
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
import { LucideLink } from 'lucide-vue-next';

const store = useHrHolidaysStore();
const contractStore = useHrContractsStore();
const holidays = computed(() => store.holidays);

const showModal = ref(false);
const showLinkModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const showDeleteConfirm = ref(false);
const deleteId = ref(null);

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
];

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
    showModal.value = false;
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

const handleLink = async () => {
  if (!linkForm.value.holiday_id || linkForm.value.contract_ids.length === 0) {
    notyf.error('Please select a holiday and at least one contract');
    return;
  }
  try {
    await store.linkHolidayToContract(linkForm.value.holiday_id, linkForm.value.contract_ids);
    showLinkModal.value = false;
  } catch (e) {
    console.error(e);
  }
};
</script>
