<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Employees Directory</h1>
        <p class="text-gray-500 mt-1">Manage employee profiles and roles</p>
      </div>
      <button
        @click="openAddModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <span class="text-xl">+</span> Add Employee
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-6">
        <input v-model="searchQuery" type="text" placeholder="Search employees..." class="border border-gray-200 rounded-lg px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        
         <select v-model="statusFilter" class="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
        </select>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && !employees.length" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Table -->
    <div v-else class="border border-gray-100 rounded-xl overflow-hidden overflow-x-auto">
      <table class="w-full text-left min-w-[800px]">
        <thead class="bg-gray-50">
          <tr>
            <th class="p-4 font-semibold text-gray-600">Employee</th>
            <th class="p-4 font-semibold text-gray-600">FingerPrint ID</th>
            <th class="p-4 font-semibold text-gray-600">Hiring Date</th>
            <th class="p-4 font-semibold text-gray-600">Status</th>
            <th class="p-4 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
           <tr v-if="filteredEmployees.length === 0">
            <td colspan="6" class="p-8 text-center text-gray-500">No employees found.</td>
          </tr>
          <tr v-for="emp in filteredEmployees" :key="emp.id" class="hover:bg-gray-50 transition-colors">
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                        {{ emp.first_name?.charAt(0) }}{{ emp.last_name?.charAt(0) }}
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">{{ emp.first_name }} {{ emp.last_name }}</div>
                        <div class="text-xs text-gray-500">{{ emp.email }}</div>
                    </div>
                </div>
            </td>
            <td class="p-4 text-gray-600">{{ emp.fingerPrint || '-' }}</td>
            <td class="p-4 text-gray-600">{{ emp.hiring_date }}</td>
             <td class="p-4">
              <span class="px-2 py-1 rounded-full text-xs font-semibold uppercase"
                :class="{
                    'bg-green-100 text-green-700': emp.status === 'active',
                    'bg-gray-100 text-gray-600': emp.status === 'inactive',
                    'bg-red-100 text-red-700': emp.status === 'terminated',
                }"
              >
                  {{ emp.status }}
              </span>
            </td>
            <td class="p-4 flex gap-3">
              <button @click="openEditModal(emp)" class="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
              <button @click="confirmDelete(emp.id)" class="text-red-500 hover:text-red-700 font-medium">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Employee' : 'New Employee'"
      :loading="store.loading"
      @close="closeModal"
      @save="handleSubmit"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input v-model="form.first_name" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" placeholder="John" />
            </div>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input v-model="form.last_name" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" placeholder="Doe" />
            </div>
        </div>
         <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" placeholder="john@example.com" />
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Fingerprint ID</label>
                 <input v-model="form.fingerPrint" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" placeholder="1024" />
            </div>
             <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Hiring Date</label>
                 <input v-model="form.hiring_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" />
            </div>
        </div>
         <div>
             <label class="block text-sm font-medium text-gray-700 mb-1">Manager</label>
            <select v-model="form.manager_id" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none">
                <option :value="null">None</option>
                <option v-for="manager in potentialManagers" :key="manager.id" :value="manager.id">
                    {{ manager.first_name }} {{ manager.last_name }}
                </option>
            </select>
         </div>
         <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select v-model="form.status" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                </select>
            </div>
             <div v-if="form.status === 'terminated' || form.left_at">
                 <label class="block text-sm font-medium text-gray-700 mb-1">Left At</label>
                 <input v-model="form.left_at" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" />
            </div>
         </div>
      </div>
    </HrModal>

    <!-- Delete Confirmation -->
    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Are you sure?"
      text="This employee will be deleted permanently."
      icon="warning"
      @confirm="handleDeleteConfirm"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';

const store = useHrEmployeesStore();
const employees = computed(() => store.employees);

const searchQuery = ref('');
const statusFilter = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

// Delete Confirmation
const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  fingerPrint: '',
  manager_id: null,
  hiring_date: '',
  left_at: null,
  status: 'active'
});

onMounted(() => {
  store.getEmployees();
});

const filteredEmployees = computed(() => {
    return employees.value.filter(emp => {
        const matchesSearch = 
            emp.first_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
            emp.last_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
            emp.email?.toLowerCase().includes(searchQuery.value.toLowerCase());
        
        const matchesStatus = !statusFilter.value || emp.status === statusFilter.value;

        return matchesSearch && matchesStatus;
    });
});

const potentialManagers = computed(() => {
    // Exclude self from manager list if editing
    if (editingId.value) {
        return employees.value.filter(e => e.id !== editingId.value);
    }
    return employees.value;
});

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    first_name: '',
    last_name: '',
    email: '',
    fingerPrint: '',
    manager_id: null,
    hiring_date: new Date().toISOString().slice(0, 10),
    left_at: null,
    status: 'active'
  };
  showModal.value = true;
};

const openEditModal = (emp) => {
  isEditing.value = true;
  editingId.value = emp.id;
  form.value = { ...emp };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  // store.error = null;
};

const handleSubmit = async () => {
  if (!form.value.first_name || !form.value.last_name || !form.value.email) {
    alert('Please fill in all required fields.');
    return;
  }

  try {
    if (isEditing.value) {
      await store.updateEmployee(editingId.value, form.value);
    } else {
      await store.createEmployee(form.value);
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
      await store.deleteEmployee(deleteId.value);
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
