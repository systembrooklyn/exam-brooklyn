<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Vacation Details</h1>
        <!-- <p class="text-gray-500 mt-1">List from API with optional year</p> -->
      </div>
      <!-- <button
        type="button"
        @click="openAddModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
      >
        <span class="text-xl">+</span> Add Balance
      </button> -->
    </div>

    <div class="flex flex-wrap gap-4 mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search employee..."
        class="border border-gray-200 rounded-lg px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      />

      <select
        v-model="listYear"
        class="border border-gray-200 rounded-lg px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        <option :value="null">All years</option>
        <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <HrDataTable
      :headers="headers"
      :items="filteredBalances"
      :loading="store.loading"
      emptyMessage="No vacation balances found."
    >
      <template #employee="{ item }">
        <span class="font-medium text-gray-900">{{ getRowEmployeeName(item) }}</span>
      </template>

      <template #year="{ item }">
        <span class="text-gray-700">{{ item.balance.year ?? "—" }}</span>
      </template>

      <template #available_days="{ item, value }">
        <span class="font-bold text-gray-700">{{ displayAvailable(item, value) }}</span>
      </template>

      <template #total_vacations_taken="{ item, value }">
        <span class="text-blue-600 font-medium">{{ displayUsed(item, value) }}</span>
      </template>

      <template #remaining_days="{ item, value }">
        <span class="text-green-600 font-bold">{{ displayRemaining(item, value) }}</span>
      </template>

      <template #start_date="{ item }">
        <span class="text-gray-700">{{ displayStartDate(item) }}</span>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center justify-center gap-2 flex-wrap">
          <button
            v-if="item.contract"
            type="button"
            :disabled="editModalPrefetching"
            @click="openEditModal(item)"
            class="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center min-w-[1.25rem]"
            title="Change vacation link for this contract"
          >
            <Loader2
              v-if="editRowLoadingKey === item.tableRowKey"
              class="w-5 h-5 animate-spin text-blue-600"
            />
            <Edit v-else class="w-5 h-5" />
          </button>
          <button
            v-if="authStore.isAdminUser"
            type="button"
            @click="confirmDelete(pickBalanceId(item.balance))"
            class="cursor-pointer text-red-500 hover:text-red-700 transition-colors"
            title="Delete (admin only)"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </template>
    </HrDataTable>

    <!-- New: simple POST. Edit: PUT contract ↔ vacation (same simple list as My vacations). -->
    <HrModal
      :show="showModal"
      :title="isEditing ? 'Edit Balance' : 'New Balance'"
      :loading="
        isEditing
          ? store.contractLinkUpdating || editModalPrefetching
          : store.loading
      "
      max-width-class="max-w-lg"
      @close="closeModal"
      @save="handleBalanceSubmit"
    >
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
        <template v-if="!isEditing">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Year <span class="text-red-500">*</span></label
              >
              <input
                v-model.number="balanceForm.year"
                type="number"
                class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Available days <span class="text-red-500">*</span></label
              >
              <input
                v-model.number="balanceForm.available_days"
                type="number"
                min="0"
                class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </template>
        <template v-else>
          <p class="text-sm text-gray-600">
            <span class="font-medium text-gray-800">{{ editEmployeeLabel }}</span>
            · Contract
            <span class="font-mono font-semibold">#{{ contractEditForm.contract_id }}</span>
          </p>
          <p class="text-xs text-gray-500">
            Current vacation balance ID:
            <span class="font-mono text-gray-700">{{
              contractEditForm.vacation_balance_id
            }}</span>
          </p>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Vacation balance <span class="text-red-500">*</span></label
            >
            <select
              v-model.number="contractEditForm.new_vacation_balance_id"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
            >
              <option v-if="!simpleVacationSelectOptions.length" disabled :value="0">
                No balances loaded
              </option>
              <option
                v-for="opt in simpleVacationSelectOptions"
                :key="opt.id"
                :value="opt.id"
              >
                {{ opt.label }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              Your vacation balances (simple API — same as My vacations).
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Start date <span class="text-gray-400 font-normal">(optional)</span></label
            >
            <input
              v-model="contractEditForm.start_date"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>
        </template>
      </div>
    </HrModal>

    <SweetAlert2Modal
      v-if="showDeleteConfirm"
      title="Are you sure?"
      text="This balance record will be deleted."
      icon="warning"
      @confirm="handleDeleteConfirm"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { Edit, Trash2, Loader2 } from "lucide-vue-next";
import { useHrVacationBalancesStore } from "@/stores/hr/vacationBalances";
import { useHrEmployeesStore } from "@/stores/hr/employees";
import { useAuthStore } from "@/stores/auth";
import HrModal from "@/components/hr-dashboard/HrModal.vue";
import SweetAlert2Modal from "@/components/global/SweetAlert2Modal.vue";
import HrDataTable from "@/components/hr-dashboard/HrDataTable.vue";
import notyf from "@/components/global/notyf";

const store = useHrVacationBalancesStore();
const empStore = useHrEmployeesStore();
const authStore = useAuthStore();

const vacationBalances = computed(() => store.vacationBalances);
const employees = computed(() => empStore.employees);

const searchQuery = ref("");
const listYear = ref(new Date().getFullYear());

const currentY = new Date().getFullYear();
const yearOptions = computed(() => {
  const ys = [];
  for (let y = currentY + 1; y >= currentY - 10; y--) ys.push(y);
  return ys;
});

const fetchBalances = () => store.getVacationBalances(listYear.value);

watch(listYear, () => {
  fetchBalances();
});

/** API: Vacation_id on list rows; store may copy to id */
const pickBalanceId = (row) =>
  row?.Vacation_id ??
  row?.vacation_id ??
  row?.id ??
  row?.vacation_balance_id ??
  row?.vacationBalanceId ??
  null;

/** First contract row that has nested vacation_balance (API shape). */
const firstVacationSnapshot = (balance) => {
  const list = balance.contracts;
  if (!Array.isArray(list) || !list.length) return null;
  const withVb = list.find((c) => c?.vacation_balance != null);
  return (withVb ?? list[0])?.vacation_balance ?? null;
};

/** Per-contract vacation_balance when API nests it; else shared snapshot from balance. */
const vacationSnapshotForRow = (row) => {
  const vb = row.contract?.vacation_balance;
  if (vb) return vb;
  return firstVacationSnapshot(row.balance);
};

const getBalanceEmployeeName = (balance) => {
  const fromContracts = (balance.contracts || [])
    .map((c) => c.employee?.name)
    .filter(Boolean);
  if (fromContracts.length) {
    return [...new Set(fromContracts)].join(", ");
  }
  if (balance.employee?.name) return balance.employee.name;
  const empId = balance.employee_id || balance.contracts?.[0]?.employee?.id;
  const emp = employees.value.find((e) => e.id === empId || String(e.id) === String(empId));
  if (emp) {
    const info = emp.personal_info || emp;
    return `${info.first_name} ${info.last_name}`;
  }
  return "—";
};

const getRowEmployeeName = (row) => {
  const name = row.contract?.employee?.name;
  if (name) return name;
  return getBalanceEmployeeName(row.balance);
};

/** One table row per linked contract so Employee / dates / numbers align per person. */
const balanceTableRows = computed(() => {
  const rows = [];
  for (const balance of vacationBalances.value) {
    const bid = pickBalanceId(balance);
    const prefix = bid != null ? String(bid) : `row-${rows.length}`;
    const contracts = Array.isArray(balance.contracts) ? balance.contracts : [];
    if (!contracts.length) {
      rows.push({
        balance,
        contract: null,
        tableRowKey: `${prefix}-solo`,
      });
    } else {
      contracts.forEach((c, i) => {
        const cid = c.contract_id ?? c.contractId ?? c.id ?? i;
        rows.push({
          balance,
          contract: c,
          tableRowKey: `${prefix}-c-${cid}`,
        });
      });
    }
  }
  return rows;
});

const hasAvailNumber = (v) =>
  v != null && v !== "" && !(typeof v === "number" && Number.isNaN(v));

const displayAvailable = (row, value) => {
  const item = row.balance;
  const rootFirst = value ?? item.available_days ?? item.availableDays;
  if (hasAvailNumber(rootFirst)) return rootFirst;
  const vb = vacationSnapshotForRow(row);
  const nested = vb?.available_days ?? vb?.availableDays;
  if (hasAvailNumber(nested)) return nested;
  return "—";
};

const displayStartDate = (row) => {
  const item = row.balance;
  const c = row.contract;
  const vb = vacationSnapshotForRow(row);
  const v =
    vb?.start_date ??
    vb?.startDate ??
    item.start_date ??
    item.startDate ??
    c?.start_date ??
    c?.startDate ??
    item.contracts?.[0]?.start_date ??
    item.contracts?.[0]?.startDate;
  if (v == null || v === "") return "—";
  const s = String(v);
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : s;
};

const displayUsed = (row, value) => {
  const item = row.balance;
  const vb = vacationSnapshotForRow(row);
  const v =
    value ??
    vb?.taken_days ??
    item.total_vacations_taken ??
    item.used_days ??
    item.vacations_taken;
  if (v == null || v === "") return "—";
  return v;
};

const displayRemaining = (row, value) => {
  const item = row.balance;
  const vb = vacationSnapshotForRow(row);
  const v =
    value ??
    vb?.remaining_days ??
    vb?.remaining ??
    item.remaining_days ??
    item.remaining;
  if (v == null || v === "") return "—";
  return v;
};

const headers = [
  { label: "Employee", key: "employee" },
  { label: "Year", key: "year" },
  { label: "Start date", key: "start_date" },
  { label: "Available", key: "available_days" },
  { label: "Used", key: "total_vacations_taken" },
  { label: "Remaining", key: "remaining_days" },
];

const rowHasEmployeeName = (row) => {
  const n = String(getRowEmployeeName(row) ?? "").trim();
  return n.length > 0 && n !== "—";
};

const filteredBalances = computed(() => {
  const list = balanceTableRows.value.filter((r) => rowHasEmployeeName(r));
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((r) =>
    getRowEmployeeName(r).toLowerCase().includes(q)
  );
});

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const editModalPrefetching = ref(false);
const editRowLoadingKey = ref(null);
const editEmployeeLabel = ref("");
const balanceForm = ref({
  year: currentY,
  available_days: 21,
});

const contractEditForm = ref({
  vacation_balance_id: null,
  contract_id: null,
  new_vacation_balance_id: null,
  start_date: "",
});

const simpleVacationSelectOptions = computed(() => {
  const list = store.simpleVacations || [];
  let opts = list
    .filter((v) => v.id != null && v.id !== "")
    .map((v) => ({
      id: Number(v.id),
      label: `ID ${v.id} · Year ${v.year ?? "—"} · ${v.days ?? "—"} days`,
    }))
    .filter((o) => Number.isFinite(o.id));
  const cur = contractEditForm.value.vacation_balance_id;
  const curN = Number(cur);
  if (
    showModal.value &&
    isEditing.value &&
    Number.isFinite(curN) &&
    !opts.some((o) => o.id === curN)
  ) {
    opts = [
      {
        id: curN,
        label: `ID ${curN} · (current row)`,
      },
      ...opts,
    ];
  }
  return opts;
});

const pickContractId = (contract) => {
  if (!contract) return null;
  const cid = contract.contract_id ?? contract.contractId ?? contract.id;
  if (cid == null || cid === "") return null;
  const n = Number(cid);
  return Number.isFinite(n) ? n : null;
};

const showDeleteConfirm = ref(false);
const deleteId = ref(null);

onMounted(async () => {
  await Promise.all([empStore.getEmployees(), fetchBalances()]);
});

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  editEmployeeLabel.value = "";
  balanceForm.value = {
    year: currentY,
    available_days: 21,
  };
  showModal.value = true;
};

const openEditModal = async (row) => {
  if (!row.contract) {
    notyf.error("Edit is only available on rows with a contract.");
    return;
  }
  const balance = row.balance;
  const vid = pickBalanceId(balance);
  const cid = pickContractId(row.contract);
  if (vid == null || cid == null) {
    notyf.error("Missing vacation balance or contract id.");
    return;
  }
  editRowLoadingKey.value = row.tableRowKey;
  editModalPrefetching.value = true;
  try {
    await store.getSimpleVacationBalancesAll();
    isEditing.value = true;
    editingId.value = vid;
    editEmployeeLabel.value = getRowEmployeeName(row);
    contractEditForm.value = {
      vacation_balance_id: vid,
      contract_id: cid,
      new_vacation_balance_id: Number(vid),
      start_date: startDateForInput(row),
    };
    showModal.value = true;
  } catch (e) {
    console.error(e);
  } finally {
    editModalPrefetching.value = false;
    editRowLoadingKey.value = null;
  }
};

const closeModal = () => {
  showModal.value = false;
  editEmployeeLabel.value = "";
};

const handleBalanceSubmit = async () => {
  try {
    if (isEditing.value) {
      const nb = Number(contractEditForm.value.new_vacation_balance_id);
      if (!Number.isFinite(nb)) {
        notyf.error("Select a vacation balance");
        return;
      }
      await store.updateContractVacationRelationship({
        vacation_balance_id: contractEditForm.value.vacation_balance_id,
        contract_id: contractEditForm.value.contract_id,
        new_vacation_balance_id: nb,
        start_date: contractEditForm.value.start_date?.trim() || undefined,
      });
    } else {
      const y = Number(balanceForm.value.year);
      const days = Number(balanceForm.value.available_days);
      if (!Number.isFinite(y) || !Number.isFinite(days)) {
        notyf.error("Year and available days are required");
        return;
      }
      await store.createVacationBalanceSimple({
        year: y,
        available_days: days,
      });
    }
    closeModal();
    await fetchBalances();
  } catch (e) {
    console.error(e);
  }
};

const confirmDelete = (id) => {
  if (id == null) {
    notyf.error("Missing balance id.");
    return;
  }
  deleteId.value = id;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  if (!deleteId.value) return;
  try {
    await store.deleteVacationBalance(deleteId.value);
    await fetchBalances();
  } catch (e) {
    console.error(e);
  } finally {
    showDeleteConfirm.value = false;
    deleteId.value = null;
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  deleteId.value = null;
};

const startDateForInput = (row) => {
  const s = displayStartDate(row);
  return s === "—" ? "" : s;
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
