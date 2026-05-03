<template>
  <div class="px-3">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Scholarships</h1>

      <div v-if="authStore.hasPermission('create-scholarship')" @click="toggleForm" class="buttons">
        <button class="btn"><span></span>
          <p data-start="good luck!" data-text="ADD!" data-title="new Scholarship"></p>
        </button>
      </div>
    </div>



    <div>
      <DataTable :headers="[
        { label: 'Scholarship Name', key: 'name' },
        { label: 'Courses', key: 'courses' },
        { label: 'Type', key: 'study_type' }
       
      ]" :items="filteredScholarships" :search="search" resourceType="scholarship" @edit="editScholarship"
        @delete="confirmDelete" @open-scholarship-detail="openScholarshipPlanDetail"
        :loading="scholarshipStore.loading" />
    </div>

    <ScholarshipPlanDetailModal
      v-model="showPlanDetail"
      :detail="planDetail"
      :loading="planDetailLoading"
    />

    <!-- Reuse Modal Component for Add/Edit Scholarship -->
    <Modal v-if="showModal" :showModal="showModal" :modalTitle="isEditing ? 'Edit Scholarship' : 'Add Scholarship'"
      :form="form" :saving="saving" :isScholarship="true" :isCourse="false" :scholarships="true"
      @closeModal="closeModal" @saveData="saveScholarship" />

    <!-- SweetAlert2 Modal for Confirmation -->
    <SweetAlert2Modal v-if="showDeleteAlert" :title="'Are you sure?'" :text="'This scholarship will be deleted.'"
      :confirmButtonText="'Yes, delete it!'" :cancelButtonText="'Cancel'" @confirm="deleteScholarship"
      @cancel="cancelDelete" />
  </div>
</template>


<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useScholarshipStore } from "@/stores/scholarships";
import DataTable from "@/components/dashboard/DataTable.vue";
import ScholarshipPlanDetailModal from "@/components/dashboard/ScholarshipPlanDetailModal.vue";
import SweetAlert2Modal from "@/components/global/SweetAlert2Modal.vue";
import Modal from "@/components/global/Modal.vue";
import { useAuthStore } from "@/stores/auth";


const authStore = useAuthStore();
const scholarshipStore = useScholarshipStore();
const showModal = ref(false);
const saving = ref(false);
const isEditing = ref(false);
const form = ref({ name: "", courses: [], study_type: "" });
const showDeleteAlert = ref(false);
const scholarshipIdToDelete = ref(null);
const search = ref("");
const showPlanDetail = ref(false);
const planDetail = ref(null);
const planDetailLoading = ref(false);

watch(showPlanDetail, (open) => {
  if (!open) planDetail.value = null;
});

const filteredScholarships = computed(() => {
  return scholarshipStore.scholarships.filter((scholarship) => {
    return scholarship.name.toLowerCase().includes(search.value.toLowerCase());
  });
});

const toggleForm = () => {
  showModal.value = true;
  isEditing.value = false;
  form.value = { name: "", courses: [] };
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  saving.value = false;
};

const openScholarshipPlanDetail = async (id) => {
  showPlanDetail.value = true;
  planDetailLoading.value = true;
  planDetail.value = null;
  try {
    planDetail.value = await scholarshipStore.fetchScholarshipPlanById(id);
  } finally {
    planDetailLoading.value = false;
  }
};

const editScholarship = async (scholarship) => {
  isEditing.value = true;
  const full = await scholarshipStore.fetchScholarshipPlanById(scholarship.id);
  if (full) {
    form.value = {
      ...full,
      courses: Array.isArray(full.courses) ? full.courses : [],
    };
  } else {
    form.value = {
      ...scholarship,
      courses: Array.isArray(scholarship.courses) ? scholarship.courses : [],
    };
  }
  showModal.value = true;
};

const saveScholarship = async () => {
  saving.value = true;

  const payload = {
    ...form.value,
    courses: form.value.courses?.map((course) => course.id),
  };

  try {
    if (isEditing.value) {
      await scholarshipStore.updateScholarship(form.value.id, payload);
    } else {
      await scholarshipStore.addScholarship(payload);
    }
    closeModal();
  } catch (error) {
    console.error(error);
  } finally {
    saving.value = false;
  }
};


const confirmDelete = (id) => {
  showDeleteAlert.value = true;
  scholarshipIdToDelete.value = id;
};

const deleteScholarship = async () => {
  await scholarshipStore.deleteScholarship(scholarshipIdToDelete.value);
  showDeleteAlert.value = false;
  scholarshipIdToDelete.value = null;
};

const cancelDelete = () => {
  showDeleteAlert.value = false;
  scholarshipIdToDelete.value = null;
};

onMounted(() => {
  scholarshipStore.fetchScholarships();
});
</script>
