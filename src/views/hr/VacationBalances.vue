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
        <button
          @click="viewVacationHistory(item)"
          class="font-medium text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition-colors text-left"
        >
          {{ getRowEmployeeName(item) }}
        </button>
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
            v-if="
              item.contract &&
              (authStore.can(HR_PERMISSION.UPDATE_VACATION_BALANCE) ||
                authStore.can(HR_PERMISSION.ASSIGN_VACATION_BALANCE))
            "
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
          <!-- <button
            v-if="authStore.can(HR_PERMISSION.DELETE_VACATION_BALANCE)"
            type="button"
            @click="confirmDelete(pickBalanceId(item.balance))"
            class="cursor-pointer text-red-500 hover:text-red-700 transition-colors"
            title="Delete balance"
          >
            <Trash2 class="w-5 h-5" />
          </button> -->
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

    <!-- Vacation History Modal -->
    <HrModal
      :show="showHistoryModal"
      :title="`Vacation History`"
      :hasSave="false"
      max-width-class="max-w-2xl"
      @close="showHistoryModal = false"
    >
      <div v-if="historyLoading" class="flex flex-col items-center justify-center py-12">
        <Loader2 class="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p class="text-gray-500 font-medium animate-pulse">Fetching history...</p>
      </div>

      <div v-else-if="!vacationHistory.length" class="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <History class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 class="text-lg font-bold text-gray-700">No History Found</h3>
        <p class="text-gray-500 mt-1 max-w-xs mx-auto">This employee doesn't have any approved vacations on record.</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Top Info Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <User class="w-6 h-6" />
            </div>
            <div>
              <p class="text-xs text-indigo-600 font-bold uppercase tracking-wider">Employee</p>
              <p class="text-gray-900 font-bold truncate">{{ selectedEmployeeName }}</p>
            </div>
          </div>
          <div class="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <ShieldCheck class="w-6 h-6" />
            </div>
            <div>
              <p class="text-xs text-emerald-600 font-bold uppercase tracking-wider">Approved Total</p>
              <p class="text-gray-900 font-extrabold text-xl">{{ totalVacationDays }} <span class="text-xs font-normal text-gray-500">Days</span></p>
            </div>
          </div>
        </div>

        <!-- History Table -->
        <div class="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
          <table class="w-full text-left text-sm border-collapse">
            <thead class="bg-gray-50/80 backdrop-blur-sm text-gray-600 font-bold uppercase text-lg tracking-widest">
              <tr>
                <th class="px-6 py-4 border-b">
                  <div class="flex items-center gap-2">
                    <Calendar class="w-3 h-3" /> Day
                  </div>
                </th>
                <th class="px-6 py-4 border-b text-center">
                  <div class="flex items-center justify-center gap-2">
                    <Clock class="w-3 h-3" /> Duration
                  </div>
                </th>
                <th class="px-6 py-4 border-b text-right">
                  <div class="flex items-center justify-end gap-2">
                    <CheckCircle class="w-3 h-3" /> Approved At
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="(vac, idx) in vacationHistory" :key="idx" class="hover:bg-indigo-50/30 transition-colors group">
                <td class="px-6 py-4 text-gray-900 font-semibold">
                  {{ vac.day || '-' }}
                </td>
                <td class="px-6 py-4 text-center">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-tighter"
                    :class="vac.duration_type === 'full' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'"
                  >
                    {{ vac.duration_type || '-' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-gray-500 font-mono text-xs">
                  {{ formatApprovedDate(vac.approved_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </HrModal>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { 
  Edit, 
  Trash2, 
  Loader2, 
  Calendar, 
  Clock, 
  CheckCircle,
  History,
  User,
  ShieldCheck
} from "lucide-vue-next";
import { useHrVacationBalancesStore } from "@/stores/hr/vacationBalances";
import { useHrEmployeesStore } from "@/stores/hr/employees";
import { useHrRequestsStore } from "@/stores/hr/requests";
import { useAuthStore } from "@/stores/auth";
import { HR_PERMISSION } from "@/constants/hrPermissions";
import HrModal from "@/components/hr-dashboard/HrModal.vue";
import SweetAlert2Modal from "@/components/global/SweetAlert2Modal.vue";
import HrDataTable from "@/components/hr-dashboard/HrDataTable.vue";
import notyf from "@/components/global/notyf";

const store = useHrVacationBalancesStore();
const empStore = useHrEmployeesStore();
const requestsStore = useHrRequestsStore();
const authStore = useAuthStore();

const vacationBalances = computed(() => store.vacationBalances);
const employees = computed(() => empStore.employees);

const searchQuery = ref("");
const listYear = ref(new Date().getFullYear());

const showHistoryModal = ref(false);
const historyLoading = ref(false);
const vacationHistory = ref([]);
const totalVacationDays = ref(0);
const selectedEmployeeName = ref("");

const viewVacationHistory = async (item) => {
  const empId = item.contract?.employee?.id || item.balance.employee_id;
  if (!empId) {
    notyf.error("Employee ID not found for this record.");
    return;
  }
  selectedEmployeeName.value = getRowEmployeeName(item);
  showHistoryModal.value = true;
  historyLoading.value = true;
  vacationHistory.value = [];
  totalVacationDays.value = 0;
  try {
    const res = await requestsStore.getApprovedVacations(empId);
    // Based on API response: res.data.vacations is the list, res.data.total_days is the count
    vacationHistory.value = res.data?.vacations || [];
    totalVacationDays.value = res.data?.total_days || 0;
  } catch (e) {
    console.error("Failed to fetch vacation history", e);
    vacationHistory.value = [];
  } finally {
    historyLoading.value = false;
  }
};

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

const formatApprovedDate = (val) => {
  if (!val || val === "-") return "-";
  // Remove " 00:00:00" if present
  return val.replace(" 00:00:00", "");
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
