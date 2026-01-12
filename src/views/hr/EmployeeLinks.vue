<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Job Assignments</h1>
        <p class="text-gray-500 mt-1">Link employees to departments and job titles</p>
      </div>
      <button
        @click="openAddModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <span class="text-xl">+</span> Assign Job
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-6">
        <input v-model="searchQuery" type="text" placeholder="Search employee or job title..." class="border border-gray-200 rounded-lg px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        
         <select v-model="deptFilter" class="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option :value="null">All Departments</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.department_name }}
            </option>
        </select>
    </div>



    <!-- Table -->
    <HrDataTable
      :headers="headers"
      :items="filteredLinks"
      :loading="store.loading"
      emptyMessage="No assignments found."
      @edit="openEditModal"
      @delete="confirmDelete"
    >
      <template #employee_id="{ item }">
        <span class="font-medium text-gray-900">
           {{ getEmployeeName(item.employee_id) }}
        </span>
      </template>

      <template #department_id="{ item }">
        {{ getDepartmentName(item.department_id) }}
      </template>

      <template #job_title_id="{ item }">
        {{ getJobTitleName(item.job_title_id) }}
      </template>
    </HrDataTable>

    <!-- Add/Edit Modal -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Assignment' : 'New Assignment'"
      :loading="store.loading"
      @close="closeModal"
      @save="handleSubmit"
    >
      <div class="space-y-4">
        <div>
             <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
             <select v-model="form.employee_id" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" :disabled="isEditing">
                <option :value="null">Select Employee</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                    {{ emp.first_name }} {{ emp.last_name }}
                </option>
            </select>
        </div>
         <div class="grid grid-cols-2 gap-4">
            <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select v-model="form.department_id" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none">
                    <option :value="null">Select Dept</option>
                    <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                        {{ dept.department_name }}
                    </option>
                </select>
             </div>
             <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <select v-model="form.job_title_id" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none">
                    <option :value="null">Select Job</option>
                    <option v-for="job in jobTitles" :key="job.id" :value="job.id">
                        {{ job.title_name }}
                    </option>
                </select>
             </div>
         </div>
         <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hired At</label>
            <input v-model="form.hired_at" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 outline-none" />
        </div>
      </div>
    </HrModal>

    <!-- Delete Confirmation -->
    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Are you sure?"
      text="This assignment will be deleted."
      icon="warning"
      @confirm="handleDeleteConfirm"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useHrLinksStore } from '@/stores/hr/links';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useHrDepartmentsStore } from '@/stores/hr/departments';
import { useHrJobTitlesStore } from '@/stores/hr/jobTitles';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import SweetAlert2Modal from '@/components/global/SweetAlert2Modal.vue';
import HrDataTable from '@/components/hr-dashboard/HrDataTable.vue';
import notyf from "@/components/global/notyf";
import { watch } from 'vue'; // Ensure watch is imported

const store = useHrLinksStore();
const empStore = useHrEmployeesStore();
const deptStore = useHrDepartmentsStore();
const jobStore = useHrJobTitlesStore();

const links = computed(() => store.links);
const employees = computed(() => empStore.employees);
const departments = computed(() => deptStore.departments);
const jobTitles = computed(() => jobStore.jobTitles);

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

// Delete Confirmation
const showDeleteConfirm = ref(false);

const form = ref({
  employee_id: null,
  department_id: null,
  job_title_id: null,
  hired_at: ''
});

const searchQuery = ref('');
const deptFilter = ref(null);

const headers = [
  { label: 'Employee', key: 'employee_id' },
  { label: 'Department', key: 'department_id' },
  { label: 'Job Title', key: 'job_title_id' },
  { label: 'Hired At', key: 'hired_at' },
];

const filteredLinks = computed(() => {
    return links.value.filter(link => {
        const empName = getEmployeeName(link.employee_id).toLowerCase();
        const jobName = getJobTitleName(link.job_title_id).toLowerCase();
        const search = searchQuery.value.toLowerCase();
        
        const matchesSearch = empName.includes(search) || jobName.includes(search);
        const matchesDept = !deptFilter.value || link.department_id === deptFilter.value;

        return matchesSearch && matchesDept;
    });
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = 7;

const totalPages = computed(() => Math.ceil(filteredLinks.value.length / itemsPerPage));

const paginatedLinks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredLinks.value.slice(start, end);
});

const goToPage = (page) => {
  currentPage.value = page;
};

// Reset pagination
watch([searchQuery, deptFilter], () => {
    currentPage.value = 1;
});


onMounted(() => {
  store.getEmployeeJobDeps();
  empStore.getEmployees();
  deptStore.getDepartments();
  jobStore.getJobTitles();
});

const getEmployeeName = (id) => {
    const emp = employees.value.find(e => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : `ID: ${id}`;
};

const getDepartmentName = (id) => {
    const d = departments.value.find(x => x.id === id);
    return d ? d.department_name : `ID: ${id}`;
};

const getJobTitleName = (id) => {
    const j = jobTitles.value.find(x => x.id === id);
    return j ? j.title_name : `ID: ${id}`;
};

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    employee_id: null,
    department_id: null,
    job_title_id: null,
    hired_at: new Date().toISOString().slice(0, 10)
  };
  showModal.value = true;
};

const openEditModal = (link) => {
  isEditing.value = true;
  editingId.value = link.id;
  form.value = { ...link };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSubmit = async () => {
  if (!form.value.employee_id || !form.value.department_id || !form.value.job_title_id) {
    notyf.error('All fields are required');
    return;
  }

  try {
    if (isEditing.value) {
      await store.updateEmployeeJobDep(editingId.value, form.value);
    } else {
      await store.linkEmployeeJobDep(form.value);
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
      await store.deleteEmployeeJobDep(deleteId.value);
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
