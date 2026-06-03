<template>
  <div class="min-h-screen w-full px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-4 bg-gray-50/50 dark:bg-gray-900/50 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
            <GraduationCap class="w-6 h-6" />
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Scholarships</h1>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-850 dark:bg-indigo-950/40 dark:text-indigo-300">
            {{ scholarshipStore.scholarshipPlans.length }} plans
          </span>
        </div>
        <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base leading-relaxed">
          Manage and configure scholarship programs, student pricing plans, and course requirements.
        </p>
      </div>

      <div v-if="authStore.hasPermission('create-scholarship')" @click="toggleForm" class="buttons self-start sm:self-auto">
        <button class="btn"><span></span>
          <p data-start="good luck!" data-text="ADD!" data-title="new Scholarship"></p>
        </button>
      </div>
    </div>

    <!-- Bulk Update Price Bar -->
    <transition name="fade">
      <div v-if="selectedIds.length > 0" class="mb-6 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <span class="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <CheckSquare class="w-5 h-5" />
          </span>
          <div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white leading-none">
              {{ selectedIds.length }} scholarships selected
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Apply a bulk price update to all selected scholarship plans.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 self-start sm:self-auto">
          <div class="relative">
            <input
              v-model="bulkPriceInput"
              type="number"
              placeholder="Enter new price..."
              class="border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-12 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all w-48"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-gray-550 pointer-events-none">
              EGP
            </span>
          </div>
          <button
            @click="applyBulkPriceUpdate"
            :disabled="bulkUpdating || !bulkPriceInput"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-2"
          >
            <span v-if="bulkUpdating" class="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Update Price
          </button>
          <button
            @click="clearSelection"
            class="px-3 py-2 text-sm font-semibold text-gray-650 dark:text-gray-300 hover:text-gray-850 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </transition>

    <div>
      <DataTable :headers="[
        { label: 'Scholarship Name', key: 'name' },
        { label: 'Price (EGP)', key: 'price' },
        { label: 'Courses', key: 'courses' },
        { label: 'Type', key: 'study_type' }
       
      ]" :badge-keys="['study_type']" :selectable="true" v-model:selected="selectedIds" :items="tableRows" :search="search" resourceType="scholarship" @edit="editScholarship"
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
import { GraduationCap, CheckSquare } from "lucide-vue-next";
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
    abbrev: "",
    desc: "",
    price: "",
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
const selectedIds = ref([]);
const bulkPriceInput = ref("");
const bulkUpdating = ref(false);

const clearSelection = () => {
  selectedIds.value = [];
  bulkPriceInput.value = "";
};

const applyBulkPriceUpdate = async () => {
  const price = Number(bulkPriceInput.value);
  if (isNaN(price) || price < 0) {
    notyf.error("Please enter a valid price.");
    return;
  }
  if (!selectedIds.value.length) {
    notyf.error("No scholarship plans selected.");
    return;
  }

  bulkUpdating.value = true;
  try {
    await scholarshipStore.bulkUpdatePrices(selectedIds.value, price);
    clearSelection();
  } catch (error) {
    console.error(error);
  } finally {
    bulkUpdating.value = false;
  }
};

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
