<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 animate-fade-in min-h-[400px]">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800"> Vacation Balances</h1>
        <!-- <p class="text-gray-500 mt-1">Your vacation balances — link contracts to a balance when needed</p> -->
      </div>
      <button v-if="authStore.can(HR_PERMISSION.CREATE_VACATION_BALANCE)" type="button" @click="openAddModal"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer w-fit">
        <span class="text-xl">+</span> Add Balance
      </button>
    </div>

    <HrDataTable :headers="headers" :items="rows" :loading="tableLoading" :has-actions="hasVacationRowActions"
      emptyMessage="No vacation records found.">
      <template #employee="{ item }">
        <span class="font-medium text-gray-900">{{ getBalanceEmployeeName(item) }}</span>
      </template>

      <template #days="{ value }">
        <span class="font-semibold text-gray-800">{{ value ?? "—" }}</span>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center justify-center gap-2 flex-wrap">
          <button v-if="
            authStore.can(HR_PERMISSION.UPDATE_VACATION_BALANCE) ||
            authStore.can(HR_PERMISSION.ASSIGN_VACATION_BALANCE)
          " type="button" :disabled="isRowActionsLocked(item)" @click="openEditModal(item)"
            class="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Edit">
            <Edit class="w-5 h-5" />
          </button>
          <button v-if="authStore.can(HR_PERMISSION.ASSIGN_VACATION_BALANCE)" type="button"
            :disabled="isRowActionsLocked(item)" @click="openAssignModal(item)"
            class="cursor-pointer text-emerald-600 hover:text-emerald-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center min-w-[1.25rem]"
            title="Assign contracts">
            <Loader2 v-if="isAssignActionLoading(item)" class="w-5 h-5 animate-spin text-emerald-600" />
            <Link2 v-else class="w-5 h-5" />
          </button>
          <button v-if="authStore.can(HR_PERMISSION.DELETE_VACATION_BALANCE)" type="button"
            :disabled="isRowActionsLocked(item)" @click="confirmDelete(pickBalanceId(item))"
            class="cursor-pointer text-red-500 hover:text-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center min-w-[1.25rem]"
            title="Delete">
            <Loader2 v-if="isDeleteActionLoading(item)" class="w-5 h-5 animate-spin text-red-500" />
            <Trash2 v-else class="w-5 h-5" />
          </button>
        </div>
      </template>
    </HrDataTable>

    <HrModal :show="showModal" :title="isEditing ? 'Edit Balance' : 'New Balance'"
      :loading="store.loading || store.contractLinkUpdating" max-width-class="max-w-lg" @close="closeModal"
      @save="handleSubmit">
      <div class="space-y-6">
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Balance</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Year <span v-if="!isEditing"
                  class="text-red-500">*</span></label>
              <input v-model.number="simpleForm.year" type="number"
                class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                placeholder="2026" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Available days <span v-if="!isEditing"
                  class="text-red-500">*</span></label>
              <input v-model.number="simpleForm.available_days" type="number" min="0"
                class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
            </div>
            <!-- <div v-if="isEditing" class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Start date <span class="text-gray-400 font-normal">(linked contracts)</span></label
              >
              <input
                v-model="simpleForm.start_date"
                type="date"
                class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
              <p class="text-xs text-gray-500 mt-1">
                Same source as Assign contracts; saved to each linked contract via API.
              </p>
            </div> -->
          </div>
        </div>
      </div>
    </HrModal>

    <HrModal :show="showAssignModal" title="Assign contracts" :loading="store.loading || assignModalLoading"
      max-width-class="max-w-lg" @close="closeAssignModal" @save="handleAssignSubmit">
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          Vacation balance ID:
          <span class="font-mono font-semibold">{{ assignForm.vacation_balance_id }}</span>
        </p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Start date <span
              class="text-red-500">*</span></label>
          <input v-model="assignForm.start_date" type="date"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Contracts</label>
          <div class="max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
            <label v-for="contract in contractsToPickInAssignModal" :key="contract.id"
              class="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/80 rounded px-1 py-0.5">
              <input v-model="assignForm.contract_ids" type="checkbox" :value="Number(contract.id)"
                class="rounded border-gray-300" />
              <span class="text-gray-800">#{{ assignContractFingerprintLabel(contract) }} —
                {{ assignContractDisplayName(contract) }}</span>
            </label>
            <p v-if="!contracts.length" class="text-gray-500 text-sm">No contracts loaded.</p>
            <p v-else-if="!activeContractsForAssign.length" class="text-gray-500 text-sm">
              No active contracts.
            </p>
            <p v-else-if="
              showAssignModal &&
              !contractsToPickInAssignModal.length &&
              activeContractsForAssign.length
            " class="text-gray-500 text-sm">
              No contracts left to assign. Every active contract is already linked to this
              vacation balance or another one shown in the list.
            </p>
          </div>
        </div>
      </div>
    </HrModal>

    <SweetAlert2Modal v-if="showDeleteConfirm" title="Are you sure?" text="This balance record will be deleted."
      icon="warning" @confirm="handleDeleteConfirm" @cancel="cancelDelete" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { Edit, Trash2, Link2, Loader2 } from "lucide-vue-next";
import { useHrVacationBalancesStore } from "@/stores/hr/vacationBalances";
import { useHrContractsStore } from "@/stores/hr/contracts";
import { useHrEmployeesStore } from "@/stores/hr/employees";
import { useAuthStore } from "@/stores/auth";
import { HR_PERMISSION } from "@/constants/hrPermissions";
import HrModal from "@/components/hr-dashboard/HrModal.vue";
import SweetAlert2Modal from "@/components/global/SweetAlert2Modal.vue";
import HrDataTable from "@/components/hr-dashboard/HrDataTable.vue";
import notyf from "@/components/global/notyf";

const store = useHrVacationBalancesStore();
const contractStore = useHrContractsStore();
const empStore = useHrEmployeesStore();
const authStore = useAuthStore();

const hasVacationRowActions = computed(
  () =>
    authStore.can(HR_PERMISSION.UPDATE_VACATION_BALANCE) ||
    authStore.can(HR_PERMISSION.ASSIGN_VACATION_BALANCE) ||
    authStore.can(HR_PERMISSION.DELETE_VACATION_BALANCE),
);

const contracts = computed(() => contractStore.contracts);
/** Same rules as Contracts.vue: API uses is_active (0/1/boolean), not status === 'active'. */
const activeContractsForAssign = computed(() => {
  const list = contracts.value;
  if (!Array.isArray(list)) return [];
  return list.filter((contract) => {
    if (contract.is_active === 0 || contract.is_active === false) return false;
    if (contract.is_active == 1 || contract.is_active === true) return true;
    const st = String(contract.status ?? "").toLowerCase();
    if (st === "inactive" || st === "terminated") return false;
    return st === "active" || st === "";
  });
});

const employees = computed(() => empStore.employees);

/** Simple list + per-row GET detail so Employee names match full balances API. */
const displayRows = ref([]);
const detailsLoading = ref(false);

const rows = computed(() => displayRows.value);

const tableLoading = computed(
  () => store.loadingSimple || store.loading || detailsLoading.value
);

const headers = [
  { label: "Employee", key: "employee" },
  { label: "Year", key: "year" },
  { label: "Days", key: "days" },
];

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

function pickFingerprintFromEmployeeLike(emp) {
  if (!emp || typeof emp !== "object") return null;
  const v =
    emp.fingerprint ??
    emp.user?.fingerPrint ??
    emp.user?.finger_print ??
    emp.personal_info?.fingerPrint ??
    emp.personal_info?.finger_print ??
    emp.fingerPrint;
  if (v === null || v === undefined || v === "") return null;
  const s = String(v).trim();
  return s || null;
}

function resolveEmployeeRecordForAssignContract(contract) {
  if (!contract) return null;
  const eid = contract.employee_id ?? contract.employee?.id;
  if (eid != null && eid !== "") {
    const fromStore = employees.value.find(
      (e) => Number(e.id) === Number(eid),
    );
    if (fromStore) return fromStore;
  }
  const nested = contract.employee;
  if (nested && typeof nested === "object") return nested;
  return null;
}

function assignContractFingerprintLabel(contract) {
  return (
    pickFingerprintFromEmployeeLike(
      resolveEmployeeRecordForAssignContract(contract),
    ) ?? "—"
  );
}

function assignContractDisplayName(contract) {
  const emp = resolveEmployeeRecordForAssignContract(contract);
  if (emp?.name) return String(emp.name).trim();
  const info = emp?.personal_info || emp;
  if (info?.first_name || info?.last_name) {
    const n = `${info.first_name ?? ""} ${info.last_name ?? ""}`.trim();
    if (n) return n;
  }
  const eid = contract.employee_id;
  if (eid != null && eid !== "") return `Employee ${eid}`;
  return "—";
}

const pickBalanceId = (row) =>
  row?.Vacation_id ??
  row?.vacation_id ??
  row?.id ??
  row?.vacation_balance_id ??
  null;

const rowIdEquals = (row, loadingId) => {
  if (loadingId == null || row == null) return false;
  const bid = pickBalanceId(row);
  if (bid == null) return false;
  return String(bid) === String(loadingId);
};

/** Spinner on Assign while opening modal (fetch) or saving assign API */
const assignRowLoadingId = ref(null);
/** Spinner on Delete while delete API runs */
const deleteRowLoadingId = ref(null);

const isAssignActionLoading = (item) => rowIdEquals(item, assignRowLoadingId.value);
const isDeleteActionLoading = (item) => rowIdEquals(item, deleteRowLoadingId.value);
const isRowActionsLocked = (item) =>
  isAssignActionLoading(item) || isDeleteActionLoading(item);

const toDateInputValue = (v) => {
  if (v == null || v === "") return "";
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

/** contract rows from list/detail API: contract_id + optional vacation_balance.start_date */
const linkedContractIdsFromApi = (contractRows) => {
  const ids = [];
  for (const row of contractRows || []) {
    const cid = row.contract_id ?? row.contractId ?? row.id;
    if (cid == null || cid === "") continue;
    const n = Number(cid);
    ids.push(Number.isFinite(n) ? n : cid);
  }
  return ids;
};

/** Contract IDs linked on any vacation balance row other than `currentVacationBalanceId` (from loaded `displayRows`). */
function contractIdsLinkedOnOtherBalances(currentVacationBalanceId) {
  const out = new Set();
  if (currentVacationBalanceId == null || currentVacationBalanceId === "") {
    return out;
  }
  const cur = String(currentVacationBalanceId);
  for (const row of displayRows.value || []) {
    console.log(displayRows);
    console.log(row);
    const bid = pickBalanceId(row);
    if (bid == null) continue;
    if (String(bid) === cur) continue;
    for (const raw of linkedContractIdsFromApi(row.contracts)) {
      const n = Number(raw);
      if (Number.isFinite(n)) out.add(n);
    }
  }
  return out;
}

const defaultStartDateFromLinkedContracts = (contractRows) => {
  for (const row of contractRows || []) {
    const sd =
      row.vacation_balance?.start_date ?? row.vacation_balance?.startDate;
    if (sd) {
      const formatted = toDateInputValue(sd);
      if (formatted) return formatted;
    }
  }
  return "";
};

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const showAssignModal = ref(false);
const assignModalLoading = ref(false);
/** Contract IDs already linked when Assign opens — hidden from picker, kept in assignForm.contract_ids. */
const assignModalAlreadyLinkedIds = ref(new Set());
const assignForm = ref({
  vacation_balance_id: null,
  contract_ids: [],
  start_date: "",
});

/**
 * Active contracts pickable in Assign modal: not linked to this balance, and not linked to any
 * other loaded vacation balance (avoids duplicate links across balances).
 */
const contractsToPickInAssignModal = computed(() => {
  if (!showAssignModal.value) return activeContractsForAssign.value;
  const skip = assignModalAlreadyLinkedIds.value;
  const elsewhere = contractIdsLinkedOnOtherBalances(
    assignForm.value.vacation_balance_id,
  );
  return activeContractsForAssign.value.filter((c) => {
    const id = Number(c.id);
    if (!Number.isFinite(id)) return false;
    return !skip.has(id) && !elsewhere.has(id);
  });
});

const simpleForm = ref({
  year: new Date().getFullYear(),
  available_days: 21,
  start_date: "",
});

/** Contracts linked to the row being edited — used to PUT pivot start_date. */
const editingLinkedContractRows = ref([]);

const mergeSimpleRowWithDetail = (base, detail) => {
  const contractsFromSimple =
    Array.isArray(base.contracts) && base.contracts.length
      ? base.contracts
      : [];
  const contractsFromDetail =
    Array.isArray(detail?.contracts) && detail.contracts.length
      ? detail.contracts
      : [];
  const contracts = contractsFromSimple.length
    ? contractsFromSimple
    : contractsFromDetail;
  const employee = base.employee ?? detail?.employee ?? null;
  return { ...base, contracts, employee };
};

const refreshList = async () => {
  await store.getSimpleVacationBalancesAll();
  const base = [...store.simpleVacations];
  detailsLoading.value = true;
  try {
    const merged = await Promise.all(
      base.map(async (b) => {
        const id = pickBalanceId(b);
        const detail =
          id != null ? await store.peekVacationBalance(id) : null;
        return mergeSimpleRowWithDetail(b, detail);
      })
    );
    displayRows.value = merged;
  } finally {
    detailsLoading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([
    empStore.getEmployees(),
    contractStore.getContracts(),
    refreshList(),
  ]);
});

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  editingLinkedContractRows.value = [];
  simpleForm.value = {
    year: new Date().getFullYear(),
    available_days: 21,
    start_date: "",
  };
  showModal.value = true;
};

const openEditModal = (balance) => {
  const id = pickBalanceId(balance);
  if (id == null) {
    notyf.error("Cannot edit: missing balance id from server.");
    return;
  }
  isEditing.value = true;
  editingId.value = id;
  const linked = Array.isArray(balance.contracts) ? [...balance.contracts] : [];
  editingLinkedContractRows.value = linked;
  const startFromLinks =
    defaultStartDateFromLinkedContracts(linked) ||
    "";
  simpleForm.value = {
    year: balance.year ?? new Date().getFullYear(),
    available_days: balance.days ?? 0,
    start_date: startFromLinks,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingLinkedContractRows.value = [];
};

const openAssignModal = async (item) => {
  const id = pickBalanceId(item);
  if (id == null) {
    notyf.error("Missing vacation balance id.");
    return;
  }
  assignModalLoading.value = true;
  assignRowLoadingId.value = id;
  try {
    let linkedRows = Array.isArray(item.contracts) ? [...item.contracts] : [];
    if (!linkedRows.length) {
      try {
        const full = await store.getVacationBalance(id);
        linkedRows = Array.isArray(full?.contracts) ? full.contracts : [];
      } catch (e) {
        console.error(e);
        linkedRows = [];
      }
    }
    const preChecked = linkedContractIdsFromApi(linkedRows);
    assignModalAlreadyLinkedIds.value = new Set(
      preChecked.map((x) => Number(x)).filter((n) => Number.isFinite(n))
    );
    const start =
      defaultStartDateFromLinkedContracts(linkedRows) ||
      new Date().toISOString().slice(0, 10);
    assignForm.value = {
      vacation_balance_id: id,
      contract_ids: [...preChecked],
      start_date: start,
    };
    showAssignModal.value = true;
  } finally {
    assignModalLoading.value = false;
    assignRowLoadingId.value = null;
  }
};

const closeAssignModal = () => {
  showAssignModal.value = false;
  assignModalAlreadyLinkedIds.value = new Set();
};

const handleAssignSubmit = async () => {
  if (!assignForm.value.start_date) {
    notyf.error("Start date is required");
    return;
  }
  const selected = (assignForm.value.contract_ids || []).map((id) => Number(id));
  const linked = assignModalAlreadyLinkedIds.value;
  const newContractIdsOnly = selected.filter(
    (id) => Number.isFinite(id) && !linked.has(id)
  );
  if (!newContractIdsOnly.length) {
    notyf.error("Select at least one new contract to assign");
    return;
  }
  const vbId = assignForm.value.vacation_balance_id;
  assignRowLoadingId.value = vbId;
  try {
    await store.assignContractsToVacationBalance({
      vacation_balance_id: vbId,
      contract_ids: newContractIdsOnly,
      start_date: assignForm.value.start_date,
    });
    closeAssignModal();
    await refreshList();
  } catch (e) {
    console.error(e);
  } finally {
    assignRowLoadingId.value = null;
  }
};

const handleSubmit = async () => {
  const y = Number(simpleForm.value.year);
  const days = Number(simpleForm.value.available_days);

  if (!isEditing.value) {
    if (!Number.isFinite(y) || !Number.isFinite(days)) {
      notyf.error("Year and available days are required");
      return;
    }
    try {
      await store.createVacationBalanceSimple({
        year: y,
        available_days: days,
      });
      closeModal();
      await refreshList();
    } catch (error) {
      console.error(error);
    }
    return;
  }

  try {
    await store.updateVacationBalanceSimple(editingId.value, {
      year: Number.isFinite(y) ? y : undefined,
      available_days: Number.isFinite(days) ? days : undefined,
      start_date: simpleForm.value.start_date?.trim() || undefined,
    });
    const vid = Number(editingId.value);
    const sd = String(simpleForm.value.start_date || "").trim();
    if (
      Number.isFinite(vid) &&
      sd &&
      editingLinkedContractRows.value.length
    ) {
      for (const row of editingLinkedContractRows.value) {
        const cid = row.contract_id ?? row.contractId ?? row.id;
        const cnum = Number(cid);
        if (!Number.isFinite(cnum)) continue;
        await store.updateContractVacationRelationship({
          vacation_balance_id: vid,
          contract_id: cnum,
          new_vacation_balance_id: vid,
          start_date: sd,
        });
      }
    }
    closeModal();
    await refreshList();
  } catch (error) {
    console.error(error);
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
  const id = deleteId.value;
  deleteRowLoadingId.value = id;
  try {
    await store.deleteVacationBalance(id);
    await refreshList();
  } catch (error) {
    console.error(error);
  } finally {
    deleteRowLoadingId.value = null;
    showDeleteConfirm.value = false;
    deleteId.value = null;
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  deleteId.value = null;
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
