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
            {{ activeTab === 'active' ? scholarshipStore.scholarshipPlans.length : scholarshipStore.inactiveScholarshipPlans.length }} plans
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

    <!-- Custom Card Wrapper for Integrated Header and DataTable -->
    <div class="rounded-2xl border border-gray-150 dark:border-gray-700/60 bg-white dark:bg-gray-800 shadow-sm overflow-hidden mt-4">
      <!-- Card Header with Tabs on Left and Search on Right -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-b border-gray-150 dark:border-gray-700/60 bg-white dark:bg-gray-800">
        <!-- Tab Switcher (Left side) -->
        <div class="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl max-w-xs w-full sm:w-auto">
          <button
            @click="activeTab = 'active'"
            :class="activeTab === 'active' 
              ? 'bg-white dark:bg-gray-650 text-indigo-650 dark:text-indigo-400 shadow-sm font-bold' 
              : 'text-gray-500 hover:text-gray-750 dark:hover:text-gray-300 font-medium'"
            class="flex-1 sm:flex-initial px-4 py-1.5 text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            Active
            <span 
              :class="activeTab === 'active' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800/80'"
              class="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full"
            >
              {{ scholarshipStore.scholarshipPlans.length }}
            </span>
          </button>
          <button
            @click="activeTab = 'inactive'"
            :class="activeTab === 'inactive' 
              ? 'bg-white dark:bg-gray-650 text-rose-650 dark:text-rose-400 shadow-sm font-bold' 
              : 'text-gray-500 hover:text-gray-750 dark:hover:text-gray-300 font-medium'"
            class="flex-1 sm:flex-initial px-4 py-1.5 text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            Inactive
            <span 
              :class="activeTab === 'inactive' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800/80'"
              class="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full"
            >
              {{ scholarshipStore.inactiveScholarshipPlans.length }}
            </span>
          </button>
        </div>

        <!-- Search input (Right side) -->
        <div class="relative w-full sm:max-w-sm">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400 dark:text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            v-model="search"
            placeholder="Search by name..."
            class="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      <!-- Embedded DataTable -->
      <DataTable 
        :headers="[
          { label: 'Scholarship Name', key: 'name' },
          { label: 'Price (EGP)', key: 'price' },
          { label: 'Courses', key: 'courses' },
          { label: 'Type', key: 'study_type' }
        ]" 
        :badge-keys="['study_type']" 
        :selectable="true" 
        v-model:selected="selectedIds" 
        :items="tableRows" 
        :search="search" 
        resourceType="scholarship" 
        :showSearch="false"
        :embedded="true"
        @edit="editScholarship"
        @delete="confirmDelete" 
        @open-scholarship-detail="openScholarshipPlanDetail" 
        @restore="confirmRestore"
        :loading="scholarshipStore.loading" 
        :loading-edit-id="scholarshipEditLoadingId" 
        :loading-restore-id="scholarshipRestoreLoadingId" 
      />
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

    <!-- SweetAlert2 Modal for Restore Confirmation -->
    <SweetAlert2Modal v-if="showRestoreAlert" :title="'Are you sure?'" :text="'This scholarship plan will be restored to active.'"
      :confirmButtonText="'Yes, restore it!'" confirmButtonClass="bg-emerald-600 hover:bg-emerald-700" :cancelButtonText="'Cancel'" @confirm="executeRestoreScholarship"
      @cancel="cancelRestore" />
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
const showRestoreAlert = ref(false);
const scholarshipIdToRestore = ref(null);
const scholarshipRestoreLoadingId = ref(null);
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

const activeTab = ref("active");

watch(activeTab, () => {
  clearSelection();
});

watch(showPlanDetail, (open) => {
  if (!open) planDetail.value = null;
});

const filteredScholarships = computed(() => {
  const source = activeTab.value === "active"
    ? scholarshipStore.scholarshipPlans
    : scholarshipStore.inactiveScholarshipPlans;
  return source.filter((scholarship) => {
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
    await Promise.all([
      scholarshipStore.fetchScholarshipPlans({ is_deleted: 0 }),
      scholarshipStore.fetchScholarshipPlans({ is_deleted: 1 })
    ]);
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
  await Promise.all([
    scholarshipStore.fetchScholarshipPlans({ is_deleted: 0 }),
    scholarshipStore.fetchScholarshipPlans({ is_deleted: 1 })
  ]);
};

const cancelDelete = () => {
  showDeleteAlert.value = false;
  scholarshipIdToDelete.value = null;
};

const confirmRestore = (id) => {
  showRestoreAlert.value = true;
  scholarshipIdToRestore.value = id;
};

const cancelRestore = () => {
  showRestoreAlert.value = false;
  scholarshipIdToRestore.value = null;
};

const executeRestoreScholarship = async () => {
  const id = scholarshipIdToRestore.value;
  if (!id) return;
  showRestoreAlert.value = false;
  scholarshipRestoreLoadingId.value = id;
  try {
    await scholarshipStore.restoreScholarship(id);
    await Promise.all([
      scholarshipStore.fetchScholarshipPlans({ is_deleted: 0 }),
      scholarshipStore.fetchScholarshipPlans({ is_deleted: 1 })
    ]);
  } catch (error) {
    console.error(error);
  } finally {
    scholarshipRestoreLoadingId.value = null;
    scholarshipIdToRestore.value = null;
  }
};

onMounted(() => {
  scholarshipStore.fetchScholarshipPlans({ is_deleted: 0 });
  scholarshipStore.fetchScholarshipPlans({ is_deleted: 1 });
});
</script>
