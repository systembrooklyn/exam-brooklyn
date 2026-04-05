import { defineStore } from "pinia";
import apiClient from "@/api/axiosInstance";
import notyf from "@/components/global/notyf";
import { handleError } from "@/stores/handleError";
import { ref } from "vue";
import {
  PAYROLL_VACATION_BALANCES,
  PAYROLL_VACATION_BALANCES_SIMPLE,
  PAYROLL_VACATION_BALANCES_ASSIGN_CONTRACTS,
  PAYROLL_VACATION_BALANCE_CONTRACT,
} from "@/api/Api";

/** Normalize simple vacation API row (vacID / Year / Days or snake_case variants). */
function normalizeSimpleVacationRow(raw) {
  if (!raw || typeof raw !== "object") {
    return { id: null, year: null, days: null };
  }
  const id =
    raw.vacID ??
    raw.vac_id ??
    raw.vacation_id ??
    raw.id ??
    null;
  const year = raw.Year ?? raw.year ?? null;
  const days =
    raw.Days ?? raw.days ?? raw.available_days ?? raw.remaining_days ?? null;
  const contracts = Array.isArray(raw.contracts) ? raw.contracts : [];
  return { id, year, days, contracts };
}

export const useHrVacationBalancesStore = defineStore(
  "hr-vacation-balances",
  () => {
    const vacationBalances = ref([]);
    const simpleVacations = ref([]);
    const loading = ref(false);
    const loadingSimple = ref(false);

    /** GET list; optional `year` query (omit for all years per API). */
    const getVacationBalances = async (year = null) => {
      loading.value = true;
      try {
        const params =
          year !== null && year !== undefined && year !== ""
            ? { year }
            : {};
        const response = await apiClient.get(PAYROLL_VACATION_BALANCES, {
          params,
        });
        const raw = response.data?.data;
        const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
        // API returns Vacation_id; normalize id for table keys and CRUD URLs
        vacationBalances.value = list.map((row) => ({
          ...row,
          id:
            row.Vacation_id ??
            row.vacation_id ??
            row.id ??
            row.vacation_balance_id ??
            null,
        }));
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const getSimpleVacationBalances = async (year) => {
      loadingSimple.value = true;
      try {
        const response = await apiClient.get(PAYROLL_VACATION_BALANCES_SIMPLE, {
          params: { year },
        });
        let payload = response.data?.data;
        if (payload == null) {
          simpleVacations.value = [];
          return response.data;
        }
        const list = Array.isArray(payload) ? payload : [payload];
        simpleVacations.value = list.map((row) => normalizeSimpleVacationRow(row));
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loadingSimple.value = false;
      }
    };

    /** Fetch simple balances for a year range and merge (dedupe by balance id). */
    const getSimpleVacationBalancesAll = async () => {
      loadingSimple.value = true;
      try {
        const current = new Date().getFullYear();
        const fromYear = current - 10;
        const toYear = current + 1;
        const years = [];
        for (let y = fromYear; y <= toYear; y++) years.push(y);

        const settled = await Promise.allSettled(
          years.map((y) =>
            apiClient.get(PAYROLL_VACATION_BALANCES_SIMPLE, {
              params: { year: y },
            })
          )
        );

        // Preserve API order: years ascending, rows in each response as returned (no sort).
        const merged = [];
        const seen = new Set();
        for (let i = 0; i < settled.length; i++) {
          const res = settled[i];
          if (res.status !== "fulfilled") continue;
          let payload = res.value.data?.data;
          if (payload == null) continue;
          const list = Array.isArray(payload) ? payload : [payload];
          for (const row of list) {
            const n = normalizeSimpleVacationRow(row);
            const key =
              n.id != null
                ? String(n.id)
                : `anon-${merged.length}-${n.year}-${n.days}`;
            if (seen.has(key)) continue;
            seen.add(key);
            merged.push(n);
          }
        }

        simpleVacations.value = merged;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loadingSimple.value = false;
      }
    };

    const getVacationBalance = async (id) => {
      try {
        const response = await apiClient.get(
          `${PAYROLL_VACATION_BALANCES}/${id}`
        );
        return response.data.data;
      } catch (err) {
        handleError(err);
        throw err;
      }
    };

    /** Same as getVacationBalance but no toast / throw — for batch UI merge only. */
    const peekVacationBalance = async (id) => {
      if (id == null || id === "") return null;
      try {
        const response = await apiClient.get(
          `${PAYROLL_VACATION_BALANCES}/${id}`
        );
        return response.data?.data ?? null;
      } catch {
        return null;
      }
    };

    const createVacationBalance = async (payload) => {
      loading.value = true;
      try {
        const response = await apiClient.post(
          PAYROLL_VACATION_BALANCES,
          payload
        );
        notyf.success(
          response.data.message || "Vacation Balance created successfully"
        );
        await getVacationBalances(null);
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    /** POST body: { year, available_days } only (current user via bearer). */
    const createVacationBalanceSimple = async ({ year, available_days }) => {
      loading.value = true;
      try {
        const response = await apiClient.post(PAYROLL_VACATION_BALANCES, {
          year: parseInt(year, 10),
          available_days: parseInt(available_days, 10),
        });
        notyf.success(
          response.data.message || "Vacation Balance created successfully"
        );
        await getSimpleVacationBalancesAll();
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    /** POST assign contracts to a vacation balance. Caller should refresh list. */
    const assignContractsToVacationBalance = async ({
      vacation_balance_id,
      contract_ids,
      start_date,
    }) => {
      loading.value = true;
      try {
        const response = await apiClient.post(
          PAYROLL_VACATION_BALANCES_ASSIGN_CONTRACTS,
          {
            vacation_balance_id: parseInt(vacation_balance_id, 10),
            contract_ids: (contract_ids || []).map((id) => parseInt(id, 10)),
            start_date,
          }
        );
        notyf.success(
          response.data.message || "Contracts assigned successfully"
        );
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const contractLinkUpdating = ref(false);

    /** PUT move/update contract link: same source as My vacations simple list for target id. */
    const updateContractVacationRelationship = async ({
      vacation_balance_id,
      contract_id,
      new_vacation_balance_id,
      start_date,
    }) => {
      const vb = parseInt(vacation_balance_id, 10);
      const cid = parseInt(contract_id, 10);
      const nb = parseInt(new_vacation_balance_id, 10);
      if (!Number.isFinite(vb) || !Number.isFinite(cid) || !Number.isFinite(nb)) {
        const msg = "Invalid vacation balance or contract id";
        notyf.error(msg);
        throw new Error(msg);
      }
      contractLinkUpdating.value = true;
      try {
        const body = { new_vacation_balance_id: nb };
        if (start_date != null && String(start_date).trim() !== "") {
          body.start_date = String(start_date).trim().slice(0, 10);
        }
        const response = await apiClient.put(
          PAYROLL_VACATION_BALANCE_CONTRACT(vb, cid),
          body
        );
        notyf.success(
          response.data.message || "Contract vacation link updated successfully"
        );
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        contractLinkUpdating.value = false;
      }
    };

    const updateVacationBalance = async (id, payload) => {
      loading.value = true;
      try {
        const response = await apiClient.put(
          `${PAYROLL_VACATION_BALANCES}/${id}`,
          payload
        );
        notyf.success(
          response.data.message || "Vacation Balance updated successfully"
        );
        await getVacationBalances(null);
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    /** PUT body: optional { year, available_days } (only sent keys are included). */
    const updateVacationBalanceSimple = async (id, partial) => {
      loading.value = true;
      try {
        const body = {};
        if (
          partial.year !== undefined &&
          partial.year !== null &&
          partial.year !== ""
        ) {
          const y = parseInt(partial.year, 10);
          if (Number.isFinite(y)) body.year = y;
        }
        if (
          partial.available_days !== undefined &&
          partial.available_days !== null &&
          partial.available_days !== ""
        ) {
          const d = parseInt(partial.available_days, 10);
          if (Number.isFinite(d)) body.available_days = d;
        }
        if (
          partial.start_date !== undefined &&
          partial.start_date !== null &&
          String(partial.start_date).trim() !== ""
        ) {
          body.start_date = String(partial.start_date).trim().slice(0, 10);
        }
        if (Object.keys(body).length === 0) {
          notyf.error(
            "Provide at least year, available days, or start date to update"
          );
          return;
        }
        const response = await apiClient.put(
          `${PAYROLL_VACATION_BALANCES}/${id}`,
          body
        );
        notyf.success(
          response.data.message || "Vacation Balance updated successfully"
        );
        return response.data;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const deleteVacationBalance = async (id) => {
      loading.value = true;
      try {
        const response = await apiClient.delete(
          `${PAYROLL_VACATION_BALANCES}/${id}`
        );
        notyf.success(
          response.data.message || "Vacation Balance deleted successfully"
        );
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    return {
      vacationBalances,
      simpleVacations,
      loading,
      loadingSimple,
      contractLinkUpdating,
      getVacationBalances,
      getSimpleVacationBalances,
      getSimpleVacationBalancesAll,
      getVacationBalance,
      peekVacationBalance,
      createVacationBalance,
      createVacationBalanceSimple,
      assignContractsToVacationBalance,
      updateContractVacationRelationship,
      updateVacationBalance,
      updateVacationBalanceSimple,
      deleteVacationBalance,
    };
  }
);
