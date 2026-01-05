<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Job Titles</h1>
        <p class="text-gray-500 mt-1">Define job roles and responsibilities</p>
      </div>
      <button
        @click="openAddModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <span class="text-xl">+</span> Add Job Title
      </button>
    </div>

    <!-- Error State -->
    <div v-if="store.error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex justify-between items-center">
      <span>{{ store.error }}</span>
      <button @click="store.error = null" class="text-red-800 font-bold">×</button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && !jobTitles.length" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Table -->
    <div v-else class="border border-gray-100 rounded-xl overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50">
          <tr>
            <th class="p-4 font-semibold text-gray-600">ID</th>
            <th class="p-4 font-semibold text-gray-600">Title Name</th>
            <th class="p-4 font-semibold text-gray-600">Can Accept</th>
            <th class="p-4 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
           <tr v-if="jobTitles.length === 0">
            <td colspan="4" class="p-8 text-center text-gray-500">No job titles found.</td>
          </tr>
          <tr v-for="job in jobTitles" :key="job.id" class="hover:bg-gray-50 transition-colors">
            <td class="p-4 text-gray-500">#{{ job.id }}</td>
            <td class="p-4 font-medium text-gray-800">{{ job.title_name }}</td>
            <td class="p-4">
              <span class="px-2 py-1 rounded text-xs font-semibold" 
                :class="job.can_accept ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                {{ job.can_accept ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="p-4 flex gap-3">
              <button @click="openEditModal(job)" class="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
              <button @click="confirmDelete(job.id)" class="text-red-500 hover:text-red-700 font-medium">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Job Title' : 'New Job Title'"
      :loading="store.loading"
      @close="closeModal"
      @save="handleSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title Name</label>
          <input
            v-model="form.title_name"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="e.g., Senior Developer"
          />
        </div>
         <div class="flex items-center gap-3">
             <input type="checkbox" id="canAccept" v-model="form.can_accept" class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
            <label for="canAccept" class="text-sm font-medium text-gray-700">Can Accept New Contracts?</label>
        </div>
      </div>
    </HrModal>

    <!-- Delete Confirmation -->
    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Are you sure?"
      text="This Job Title will be deleted permanently."
      icon="warning"
      @confirm="handleDeleteConfirm"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useHrJobTitlesStore } from '@/stores/hr/jobTitles';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';

const store = useHrJobTitlesStore();
const jobTitles = computed(() => store.jobTitles);

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

// Delete Confirmation
const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const form = ref({
  title_name: '',
  can_accept: false
});

onMounted(() => {
  store.getJobTitles();
});

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = { title_name: '', can_accept: false };
  showModal.value = true;
};

const openEditModal = (job) => {
  isEditing.value = true;
  editingId.value = job.id;
  // Make sure boolean is correctly set if API returns 1/0
  form.value = { ...job, can_accept: Boolean(job.can_accept) };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSubmit = async () => {
  if (!form.value.title_name) {
    alert('Title name is required');
    return;
  }

  try {
    if (isEditing.value) {
      await store.updateJobTitle(editingId.value, form.value);
    } else {
      await store.createJobTitle(form.value);
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
      await store.deleteJobTitle(deleteId.value);
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
