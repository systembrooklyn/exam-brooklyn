<script setup lang="ts">
import { ref, computed } from "vue";
import InvoicesTable from "../../components/srmDashboard/tables/InvoicesTable.vue";
import { Filter } from "lucide-vue-next";


const cardName = "Invoices";
const sortOrder = ref<"asc" | "desc">("asc");

const activeFilter = ref<"all" | "reservation" | "payment">("all");
const filters = [
  { label: "All", value: "all" },
  { label: "Reservations", value: "reservation" },
  { label: "Payments", value: "payment" },
];


const paginatedData = ref([
  {
    serial: "R-001",
    notes: "Student reservation payment for September",
    created_at: "2025-09-01",
    amount: 2500,
    pay_method: "Cash",
    type: "Income",
    pay_cat: "Reservation",
    employee: { name: "Ahmed Ali" },
  },
  {
    serial: "E-014",
    notes: "Office electricity bill",
    created_at: "2025-09-02",
    amount: 430.75,
    pay_method: "Visa",
    type: "Expense",
    pay_cat: "Bills",
    employee: { name: "Mona Hassan" },
  },
  {
    serial: "P-020",
    notes: "Student course payment",
    created_at: "2025-09-03",
    amount: 1800,
    pay_method: "Transfer",
    type: "Income",
    pay_cat: "Course",
    employee: { name: "Omar Samy" },
  },
  {
    serial: "R-001",
    notes: "Student reservation payment for September",
    created_at: "2025-09-01",
    amount: 2500,
    pay_method: "Cash",
    type: "Income",
    pay_cat: "Reservation",
    employee: { name: "Ahmed Ali" },
  },
  {
    serial: "E-014",
    notes: "Office electricity bill",
    created_at: "2025-09-02",
    amount: 430.75,
    pay_method: "Visa",
    type: "Expense",
    pay_cat: "Bills",
    employee: { name: "Mona Hassan" },
  },
  {
    serial: "P-020",
    notes: "Student course payment",
    created_at: "2025-09-03",
    amount: 1800,
    pay_method: "Transfer",
    type: "Income",
    pay_cat: "Course",
    employee: { name: "Omar Samy" },
  },
]);

/* ========= Computed Filtered Data ========= */
const filteredData = computed(() => {
  if (activeFilter.value === "all") return paginatedData.value;

  return paginatedData.value.filter((item) => {
    const serial = item.serial?.toLowerCase();

    if (activeFilter.value === "reservation") {
      return serial.startsWith("r");
    }

    if (activeFilter.value === "payment") {
      return serial.startsWith("e") || serial.startsWith("p");
    }

    return true;
  });
});


function toggleSort(field: string) {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
}
</script>

<template>
  <div class="max-w-[90%] mx-auto">
    <div class="relative mb-4 w-fit">
      <Filter
        class="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none"
        :size="18"
      />

   
      <select
        v-model="activeFilter"
        class="pl-10 pr-4 py-2 rounded-lg border border-indigo-300 text-sm font-semibold text-indigo-700 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option v-for="item in filters" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
    </div>

 
    <InvoicesTable
      v-if="cardName === 'Invoices'"
      :data="filteredData"
      :sortOrder="sortOrder"
      @toggleSort="toggleSort"
    />
  </div>
</template>
