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
          <button
            type="button"
            :class="[
              'px-3 py-1 rounded-full text-sm font-medium transition',
              {
                'bg-green-500 text-white cursor-not-allowed opacity-70':
                  row.status === 'paid',
                'bg-red-500 text-white hover:bg-red-600 cursor-pointer':
                  row.status === 'unpaid',
                'bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer':
                  row.status === 'partialPaid',
              },
            ]"
            :disabled="row.status === 'paid'"
            @click="openPaymentModal(row)"
          >
            {{ getStatusLabel(row.status) }}
          </button>
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

    <div
      v-if="showPaymentModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="closePaymentModal"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div class="mb-5">
          <h3 class="text-xl font-bold text-gray-900">Add Payment</h3>
          <p class="mt-1 text-sm text-gray-500">
            Enter amount and choose payment method. API will be connected later.
          </p>
        </div>

        <div class="space-y-4">
          <div>
            <label
              for="payment-amount"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              Amount
            </label>
            <input
              id="payment-amount"
              v-model.number="paymentForm.amount"
              type="number"
              min="0"
              step="0.01"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label
              for="payment-method"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              Cash Type
            </label>
            <select
              id="payment-method"
              v-model="paymentForm.cashType"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option
                v-for="option in cashTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div
            v-if="selectedPaymentRow"
            class="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600"
          >
            Remaining amount:
            <span class="font-semibold text-gray-800">
              {{ displayValue(getRemainingAmount(selectedPaymentRow)) }} EGP
            </span>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
            @click="closePaymentModal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!isPaymentFormValid"
            @click="submitPayment"
          >
            Save
          </button>
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
const showPaymentModal = ref(false);
const selectedPaymentRow = ref(null);
const paymentForm = ref({ amount: "", cashType: "cash" });

const cashTypeOptions = [
  { label: "Cash", value: "cash" },
  { label: "Vodafone Cash", value: "vodafone_cash" },
  { label: "Bank Account", value: "bank_account" },
  { label: "Online Payment", value: "online_payment" },
];

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

const isPaymentFormValid = computed(() => Number(paymentForm.value.amount) > 0);

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

function getStatusLabel(status) {
  if (status === "partialPaid") return "Partial Paid";
  if (status === "unpaid") return "Unpaid";
  if (status === "paid") return "Paid";
  return status;
}

function getRemainingAmount(row) {
  const amount = Number(row?.amount) || 0;
  const paidAmount = Number(row?.paid_amount) || 0;
  return Math.max(amount - paidAmount, 0);
}

function openPaymentModal(row) {
  if (!row || row.status === "paid") return;
  selectedPaymentRow.value = row;
  paymentForm.value = {
    amount: getRemainingAmount(row) || "",
    cashType: "cash",
  };
  showPaymentModal.value = true;
}

function closePaymentModal() {
  showPaymentModal.value = false;
  selectedPaymentRow.value = null;
  paymentForm.value = { amount: "", cashType: "cash" };
}

function submitPayment() {
  if (!isPaymentFormValid.value) {
    notyf.error("Please enter a valid amount");
    return;
  }

  console.log("Pending local payment payload:", {
    payment_id: getPaymentId(selectedPaymentRow.value),
    amount: Number(paymentForm.value.amount),
    cash_type: paymentForm.value.cashType,
  });

  notyf.success("Payment data saved locally until API is ready");
  closePaymentModal();
}

function displayValue(value) {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>
