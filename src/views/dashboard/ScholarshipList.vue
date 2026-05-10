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
       
      ]" :items="tableRows" :search="search" resourceType="scholarship" @edit="editScholarship"
        @delete="confirmDelete" @open-scholarship-detail="openScholarshipPlanDetail"
        :loading="scholarshipStore.loading" :loading-edit-id="scholarshipEditLoadingId" />
    </div>

    <ScholarshipPlanDetailModal
      v-model="showPlanDetail"
      :detail="planDetail"
      :loading="planDetailLoading"
    />

    <!-- Reuse Modal Component for Add/Edit Scholarship -->
    <Modal
      v-if="showModal"
      :showModal="showModal"
      :modalTitle="isEditing ? 'Edit Scholarship Plan' : 'New Scholarship Plan'"
      :form="form"
      :saving="saving"
      :isEditing="isEditing"
      :isScholarship="true"
      :isCourse="false"
      :scholarships="true"
      @closeModal="closeModal"
      @saveData="saveScholarship"
      @update:courseGroups="onUpdateCourseGroups"
    />

    <!-- SweetAlert2 Modal for Confirmation -->
    <SweetAlert2Modal v-if="showDeleteAlert" :title="'Are you sure?'" :text="'This scholarship plan will be deleted.'"
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
import {
  mapPlanDetailToForm,
  buildScholarshipPlanPayload,
  attachDisplayCourses,
} from "@/utils/scholarshipPlan";
import notyf from "@/components/global/notyf";


const authStore = useAuthStore();
const scholarshipStore = useScholarshipStore();
const showModal = ref(false);
const saving = ref(false);
const isEditing = ref(false);

function emptyPlanForm() {
  return {
    name: "",
    study_type: "online",
    course_groups: [],
  };
}

const form = ref(emptyPlanForm());
const showDeleteAlert = ref(false);
const scholarshipIdToDelete = ref(null);
const search = ref("");
const showPlanDetail = ref(false);
const planDetail = ref(null);
const planDetailLoading = ref(false);
/** Inline spinner on the matching DataTable edit button while plan detail loads */
const scholarshipEditLoadingId = ref(null);

watch(showPlanDetail, (open) => {
  if (!open) planDetail.value = null;
});

const filteredScholarships = computed(() => {
  return scholarshipStore.scholarshipPlans.filter((scholarship) => {
    return scholarship.name.toLowerCase().includes(search.value.toLowerCase());
  });
});

const tableRows = computed(() =>
  filteredScholarships.value.map((row) => attachDisplayCourses(row))
);

const toggleForm = () => {
  showModal.value = true;
  isEditing.value = false;
  form.value = emptyPlanForm();
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  saving.value = false;
  scholarshipEditLoadingId.value = null;
};

function onUpdateCourseGroups(courseGroups) {
  if (!form.value) return;
  form.value.course_groups = Array.isArray(courseGroups) ? courseGroups : [];
}

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
  scholarshipEditLoadingId.value = scholarship.id;
  try {
    const full = await scholarshipStore.fetchScholarshipPlanById(scholarship.id);
    if (full) {
      form.value = mapPlanDetailToForm(full);
    } else {
      form.value = mapPlanDetailToForm(scholarship);
    }
    showModal.value = true;
  } finally {
    scholarshipEditLoadingId.value = null;
  }
};

const saveScholarship = async () => {
  const name = (form.value.name ?? "").trim();
  if (!name) {
    notyf.error("Please enter a scholarship name.");
    return;
  }

  for (const course of form.value.course_groups ?? []) {
    const activeGroups = (course.groups ?? []).filter((group) => !group?._deleted);
    if (course.requires_group_setup && !(activeGroups.length > 0)) {
      notyf.error(`Course ${course.course_code} needs at least one group before saving.`);
      return;
    }

    for (const group of activeGroups) {
      const groupCode = String(group.group_code ?? "").trim();
      const groupName = String(group.group_name ?? "").trim();
      if (!groupCode || !groupName) {
        notyf.error(
          `Please complete group code and group name for course ${course.course_code}.`
        );
        return;
      }
    }
  }

  saving.value = true;

  const payload = buildScholarshipPlanPayload(form.value);

  try {
    if (isEditing.value) {
      await scholarshipStore.updateScholarshipPlan(form.value.id, payload);
    } else {
      await scholarshipStore.createScholarshipPlan(payload);
    }
    closeModal();
    await scholarshipStore.fetchScholarshipPlans();
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
  scholarshipStore.fetchScholarshipPlans();
});
</script>
