<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in relative min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Departments</h1>
        <p class="text-gray-500 mt-1">Manage company departments and structure</p>
      </div>
      <button
        @click="openAddModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <span class="text-xl">+</span> Add Department
      </button>
    </div>

    <!-- Error State -->
    <div v-if="store.error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex justify-between items-center">
      <span>{{ store.error }}</span>
      <button @click="store.error = null" class="text-red-800 font-bold">×</button>
    </div>

    <!-- Loading State -->
    <div v-if="store.loading && !departments.length" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Table -->
    <div v-else class="border border-gray-100 rounded-xl overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50">
          <tr>
            <th class="p-4 font-semibold text-gray-600">ID</th>
            <th class="p-4 font-semibold text-gray-600">Department Name</th>
            <th class="p-4 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="departments.length === 0">
            <td colspan="4" class="p-8 text-center text-gray-500">No departments found.</td>
          </tr>
          <tr
            v-for="dept in departments"
            :key="dept.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="p-4 text-gray-500">#{{ dept.id }}</td>
            <td class="p-4 font-medium text-gray-800">{{ dept.department_name }}</td>
            <td class="p-4 flex gap-3">
              <button @click="openEditModal(dept)" class="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
              <button @click="confirmDelete(dept.id)" class="text-red-500 hover:text-red-700 font-medium">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Department' : 'New Department'"
      :loading="store.loading"
      @close="closeModal"
      @save="handleSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
          <input
            v-model="form.department_name"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="e.g., Engineering, HR, Sales"
          />
        </div>
      </div>
    </HrModal>
    
    <!-- Delete Confirmation -->
    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Are you sure?"
      text="This department will be deleted permanently."
      icon="warning"
      @confirm="handleDeleteConfirm"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useHrDepartmentsStore } from '@/stores/hr/departments';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';

const store = useHrDepartmentsStore();
const departments = computed(() => store.departments);

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

// Delete Confirmation State
const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const form = ref({
  department_name: '',
});

onMounted(() => {
  store.getDepartments();
});

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = { department_name: '' };
  showModal.value = true;
};

const openEditModal = (dept) => {
  isEditing.value = true;
  editingId.value = dept.id;
  form.value = { ...dept };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  // store.error = null; // Store error handled by global handler
};

const handleSubmit = async () => {
  if (!form.value.department_name) {
    alert('Department name is required');
    return;
  }

  try {
    if (isEditing.value) {
      await store.updateDepartment(editingId.value, form.value);
    } else {
      await store.createDepartment(form.value);
    }
    closeModal();
  } catch (error) {
     console.error(error);
  }
};

const confirmDelete = (id) => {
  deleteId.value = id;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  if (deleteId.value) {
    try {
      await store.deleteDepartment(deleteId.value);
    } catch (error) {
      console.error(error);
    } finally {
      showDeleteConfirm.value = false;
      deleteId.value = null;
    }
  }
};

const cancelDelete = () => {
    showDeleteConfirm.value = false;
    deleteId.value = null;
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
