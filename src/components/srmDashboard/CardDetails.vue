<script setup>
import { ref, computed, watch } from "vue";
import Pagination from "./Pagination.vue";
import { useRequestStore } from "../../stores/srmStore/requestStore";
import GroupsTable from "./tables/GroupsTable.vue";
import AttendanceTable from "./tables/AttendanceTable.vue";
import InvoicesTable from "./tables/InvoicesTable.vue";
import Deadlines from "./tables/Deadlines.vue";
import RequestsTable from "./tables/RequestsTable.vue";
import PapersTable from "./tables/PapersTable.vue";
import RequestFieldModal from "./RequestFieldModal.vue";

const props = defineProps({
  cardName: String,
  headers: Array,
  data: Array,
  loading: Boolean,
});

const currentPage = ref(1);

console.log("Card Name:", props.cardName);

const pageSize = computed(() => (props.cardName === "Invoices" ? 10 : 5));

const sortOrder = ref("asc");
const sortField = ref("created_at");
const showRequestFieldModal = ref(false);

function openModal() {
  showRequestFieldModal.value = true;
}

console.log("showRequestFieldModal:", showRequestFieldModal.value);

// Sort function for data
function sortData(data) {
  return [...data].sort((a, b) => {
    const dateA = a.type === "online" ? a.student_start : a.start_date;
    const dateB = b.type === "online" ? b.student_start : b.start_date;

    const dA = new Date(dateA);
    const dB = new Date(dateB);

    const invalidA = isNaN(dA.getTime());
    const invalidB = isNaN(dB.getTime());

   
    if (invalidA && !invalidB) return 1;
    if (!invalidA && invalidB) return -1;
    if (invalidA && invalidB) return 0;

    if (sortField.value === "start_date") {
      if (sortOrder.value === "asc") {
        return dA - dB; 
      } else {
        return dB - dA;
      }
    }

    return 0;
  });
}


const totalPages = computed(
  () => Math.ceil(props.data?.length / pageSize.value) || 1
);



function displayValue(val) {
  return val ?? "No Data Available";
}

const paginatedData = computed(() => {
  const sorted = sortData(props.data);

  if (props.cardName === "Groups" || props.cardName === "Attendance") {
    return sorted || [];
  }

  const start = (currentPage.value - 1) * pageSize.value;
  return sorted ? sorted.slice(start, start + pageSize.value) : [];
});

function toggleSort(field) {
  if (sortField.value === field) {
  
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
 
    sortField.value = field;
    sortOrder.value = "asc";
  }
}


const pageNumbers = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages = [];

  if (total <= 2) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1); // Always show first page

    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push("...");

    pages.push(total); // Always show last page
  }

  return pages;
});

const hasData = computed(() => props.data && props.data.length > 0);

function goToPage(page) {
  if (page === "...") return;
  currentPage.value = page;
}

watch(
  () => props.cardName,
  () => {
    currentPage.value = 1;
  }
);
</script>

<template>
  <div class="px-4">
    <!-- Loading Spinner -->
    <div v-if="loading" class="flex justify-center  h-88 items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
    </div>

    <!-- No Data Message -->
    <div v-else-if="!hasData" class="text-center">
      <div v-if="cardName === 'Requests' || cardName === 'Complains'" class="mt-6 text-end p-3">
        <button @click="openModal"
          class="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-200">
          Add New {{ cardName }}
        </button>

      </div>

      <div v-if="!hasData" class="text-center">
        <img class="mx-auto h-80 mt-10" src="@/assets/undraw_empty_4zx0.png" alt="No Data" />
        <p class="mt-4 font-semibold text-gray-800">No Data Found</p>
      </div>
    </div>


    <div v-else class="space-y-6">
  
    <GroupsTable v-if="cardName === 'Groups'" :data="paginatedData" :sortOrder="sortOrder" @toggleSort="toggleSort" />
     
      <AttendanceTable v-if="cardName === 'Attendance'" :data="paginatedData" :sortOrder="sortOrder"
        @toggleSort="toggleSort" />

    
      <InvoicesTable v-if="cardName === 'Invoices'" :data="paginatedData" :sortOrder="sortOrder"
        @toggleSort="toggleSort" />

   
      <div v-if="cardName === 'Requests' || cardName === 'Complains'">

        <RequestsTable :title="cardName" :data="paginatedData" :sortOrder="sortOrder" @toggleSort="toggleSort" />
      </div>
      <Deadlines v-if="cardName === 'Deadlines'" :data="paginatedData" :sortOrder="sortOrder"
        @toggleSort="toggleSort" />

      <PapersTable v-if="cardName === 'Papers'" :data="paginatedData" />
    
      <Pagination v-if="
        totalPages > 1 && cardName !== 'Groups' && cardName !== 'Attendance'
      " :current-page="currentPage" :total-pages="totalPages" :page-numbers="pageNumbers"
        @update:current-page="goToPage" />
    </div>

    <RequestFieldModal v-model="showRequestFieldModal" :type="cardName" />
  </div>
</template>
