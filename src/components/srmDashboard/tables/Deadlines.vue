<template>
  <div class="space-y-4 min-w-4xl">
    <div
      class="flex items-center gap-2 text-indigo-800 font-bold text-lg cursor-pointer select-none"
      @click="toggleSort('due_date')"
    >
      Sort by Due Date
      <span>
        <ArrowUpDown v-if="sortOrder === 'asc'" :size="16" />
        <ArrowDownUp v-else :size="16" />
      </span>
    </div>

    <div
      v-for="(row, rowIndex) in sortedData"
      :key="getRowKey(row, rowIndex)"
      class="bg-white p-3 rounded-lg shadow-md border border-gray-200"
    >
      <div class="flex justify-between items-center space-x-4">
        <div>
          <h4 class="text-md font-bold text-gray-800 mb-1">Amount</h4>
          <template v-if="editingPaymentId !== getPaymentId(row)">
            <p class="text-xl font-bold text-indigo-600">
              {{ displayValue(row.amount) }} EGP
            </p>
            <div>
              <span class="font-medium text-gray-800">Due Date:</span>
              {{ formatDate(row.due_date) }}
            </div>
          </template>
          <template v-else>
            <input
              v-model.number="editForm.amount"
              type="number"
              step="0.01"
              min="0"
              class="text-xl font-bold text-indigo-600 w-full max-w-[140px] border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div class="mt-1">
              <span class="font-medium text-gray-800">Due Date:</span>
              <input
                v-model="editForm.due_date"
                type="date"
                class="border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </template>
        </div>
        <div>
          <h4 class="text-md font-bold text-gray-800 mb-1">Paid Amount</h4>
          <p class="text-lg font-semibold text-green-600">
            {{ row.paid_amount }} EGP
          </p>
          <div>
            <span class="font-medium text-gray-800">Paid on:</span>
            {{ formatDate(row.paid_date) }}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium text-white',
              {
                'bg-green-500': row.status === 'paid',
                'bg-red-500': row.status === 'unpaid',
                'bg-yellow-400 text-black': row.status === 'partialPaid',
              },
            ]"
          >
            {{ row.status }}
          </span>
          <template v-if="editingPaymentId !== getPaymentId(row)">
            <button
              v-if="authStore.hasPermission('edit-payments')"
              type="button"
              class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition"
              title="Edit"
              @click="enterEditMode(row)"
            >
              <Edit :size="18" />
            </button>
          </template>
          <template v-else>
            <button
              type="button"
              class="px-2 py-1 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="!hasChanges || paymentUpdateStore.loading"
              @click="saveChanges(row)"
            >
              <span
                v-if="paymentUpdateStore.loadingPaymentId === getPaymentId(row)"
                class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              />
              {{ paymentUpdateStore.loadingPaymentId === getPaymentId(row) ? "Saving..." : "Save" }}
            </button>
            <button
              type="button"
              class="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded"
              :disabled="paymentUpdateStore.loading"
              @click="cancelEdit"
            >
              Cancel
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowDownUp, ArrowUpDown, Edit } from "lucide-vue-next";
import { ref, computed } from "vue";
import formatDate from "../../global/FormDate";
import { useDateSort } from "../../global/useDateSort";
import { usePaymentUpdateStore } from "@/stores/finnance/paymentUpdateStore";
import notyf from "@/components/global/notyf";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

const props = defineProps({
  data: { type: Array, default: () => [] },
  studentId: { type: [String, Number], default: null },
});

const emit = defineEmits(["refresh-payments"]);

const paymentUpdateStore = usePaymentUpdateStore();
const sortOrder = ref("asc");
const sortField = ref("due_date");
const editingPaymentId = ref(null);
const editForm = ref({ amount: "", due_date: "" });
const originalData = ref({ amount: "", due_date: "" });

const { sortByDate } = useDateSort();

function getPaymentId(row) {
  return row.payment_id ?? row.id;
}

function getRowKey(row, index) {
  return getPaymentId(row) ?? index;
}

/** Normalize due_date to YYYY-MM-DD for input[type=date] and API */
function toYYYYMMDD(val) {
  if (!val) return "";
  const s = String(val).trim().split(" ")[0];
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const hasChanges = computed(() => {
  if (editingPaymentId.value == null) return false;
  const a = Number(editForm.value.amount);
  const b = Number(originalData.value.amount);
  const amountChanged = !Number.isNaN(a) && !Number.isNaN(b) && a !== b;
  const dateChanged =
    toYYYYMMDD(editForm.value.due_date) !== toYYYYMMDD(originalData.value.due_date);
  return amountChanged || dateChanged;
});

function enterEditMode(row) {
  const id = getPaymentId(row);
  if (id == null) return;
  editingPaymentId.value = id;
  const amount = row.amount != null ? Number(row.amount) : "";
  const dueDate = toYYYYMMDD(row.due_date);
  editForm.value = { amount, due_date: dueDate };
  originalData.value = { amount, due_date: dueDate };
}

function cancelEdit() {
  editingPaymentId.value = null;
  editForm.value = { amount: "", due_date: "" };
  originalData.value = { amount: "", due_date: "" };
}

async function saveChanges(row) {
  if (!hasChanges.value) {
    notyf.info("No changes to save");
    return;
  }
  const paymentId = getPaymentId(row);
  if (paymentId == null) {
    notyf.error("Cannot update: missing payment id");
    return;
  }
  const dueDate = toYYYYMMDD(editForm.value.due_date);
  const amount =
    editForm.value.amount !== "" && editForm.value.amount != null
      ? Number(editForm.value.amount)
      : row.amount;
  const stId = props.studentId;
  if (stId == null || stId === "") {
    notyf.error("Cannot update: no student selected");
    return;
  }
  const payload = {
    payment_id: paymentId,
    amount,
    due_date: dueDate || undefined,
  };
  try {
    await paymentUpdateStore.updatePayment(stId, payload);
    emit("refresh-payments");
    cancelEdit();
  } catch (e) {
    console.error("Error updating payment:", e);
  }
}

function toggleSort(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "asc";
  }
}

const sortedData = computed(() => {
  return sortByDate(props.data, sortField.value, sortOrder.value);
});

function displayValue(value) {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>
