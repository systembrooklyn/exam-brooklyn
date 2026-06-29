<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useReservationStore } from "@/stores/reservations";
import { useScholarshipStore } from "@/stores/scholarships.js";
import ModulesTable from "@/components/Reservation/ModulesTable.vue";
import {
  normalizeCalculationResponse,
  mapStudyPlanToModules,
  mergeInstallmentsIntoModules,
  canGenerateSchedule,
  pickDefaultPaymentMethod,
  flattenPriceSettings,
  getGradeSettingFromResponse,
  gradeNamesMatch,
} from "@/utils/scholarshipPlanResponse";
import { useScholarshipPricing } from "@/composables/useScholarshipPricing";
import { Loader2 } from "lucide-vue-next";
import notyf from "@/components/global/notyf";

const reservationStore = useReservationStore();
const scholarshipStore = useScholarshipStore();

const selectedScholarshipId = ref("");
const selectedGrade = ref("");
const loadingSettings = ref(false);
const calculatingPlan = ref(false);
const calculationPending = ref(false);

const priceSettings = ref([]);
const resolvedGradeSetting = ref(null);
const apiCalculationResult = ref(null);
const priceSettingsSelections = ref({});
const modules = ref([]);

onMounted(async () => {
  try {
    await scholarshipStore.fetchScholarships();
  } catch (err) {
    console.error("Failed to load scholarships list:", err);
    notyf.error("Failed to load scholarship list.");
  }
});

watch(selectedGrade, (newGrade) => {
  if (!newGrade) {
    delete priceSettingsSelections.value["Grade"];
    return;
  }
  const apiName = resolvedGradeSetting.value?.name;
  priceSettingsSelections.value["Grade"] = apiName && gradeNamesMatch(apiName, newGrade)
    ? apiName
    : newGrade;
});

const currentScholarshipObj = computed(() => {
  return scholarshipStore.scholarships.find((s) => s.id === selectedScholarshipId.value) || null;
});

const basePrice = computed(() => currentScholarshipObj.value?.price || 0);

const handleScholarshipOrGradeChange = async () => {
  if (!selectedScholarshipId.value) {
    priceSettings.value = [];
    resolvedGradeSetting.value = null;
    apiCalculationResult.value = null;
    priceSettingsSelections.value = {};
    modules.value = [];
    return;
  }

  loadingSettings.value = true;
  apiCalculationResult.value = null;
  modules.value = [];

  const currentGrade = selectedGrade.value || null;

  try {
    const data = await reservationStore.fetchScholarshipPriceSettings(
      selectedScholarshipId.value,
      currentGrade
    );

    const flattened = flattenPriceSettings(data);
    resolvedGradeSetting.value = getGradeSettingFromResponse(flattened);
    priceSettings.value = flattened;

    const initialSelections = {};
    if (currentGrade && resolvedGradeSetting.value) {
      initialSelections["Grade"] = resolvedGradeSetting.value.name;
    } else if (currentGrade) {
      initialSelections["Grade"] = currentGrade;
    }
    flattened.forEach((ps) => {
      if (ps.type === "Paper" || ps.type === "Fees") {
        if (!initialSelections[ps.type]) initialSelections[ps.type] = [];
      }
    });
    priceSettingsSelections.value = initialSelections;

    await nextTick();
    syncDefaultSelections();
  } catch (err) {
    console.error("Failed to fetch price settings:", err);
    notyf.error("Failed to fetch scholarship price settings.");
  } finally {
    loadingSettings.value = false;
    await nextTick();
    syncDefaultSelections();
    runCalculation();
  }
};

watch([selectedScholarshipId, selectedGrade], () => {
  handleScholarshipOrGradeChange();
});

const { activePriceSettings, calculatedBreakdown, priceSettingTypes, getOptionsForType } =
  useScholarshipPricing({
    priceSettings,
    selections: priceSettingsSelections,
    resolvedGradeSetting,
    apiCalculationResult,
    basePrice,
  });

const applyDefaultPaymentMethod = () => {
  const paymentOptions = getOptionsForType("Payment Method");
  const current = priceSettingsSelections.value["Payment Method"];
  const next = pickDefaultPaymentMethod(paymentOptions, current);
  if (next && next !== current) {
    priceSettingsSelections.value["Payment Method"] = next;
  }
};

const syncDefaultSelections = () => {
  const feesOptions = getOptionsForType("Fees");
  if (feesOptions.length) {
    priceSettingsSelections.value["Fees"] = feesOptions;
  }
  applyDefaultPaymentMethod();
};

const toggleOption = (opt, type) => {
  const current = Array.isArray(priceSettingsSelections.value[type])
    ? [...priceSettingsSelections.value[type]]
    : priceSettingsSelections.value[type]
      ? [priceSettingsSelections.value[type]]
      : [];

  const index = current.indexOf(opt);
  if (index > -1) current.splice(index, 1);
  else current.push(opt);

  priceSettingsSelections.value[type] = current;
};

watch(
  () => (priceSettingTypes.value.includes("Fees") ? getOptionsForType("Fees") : null),
  (feesOptions) => {
    if (feesOptions !== null) priceSettingsSelections.value["Fees"] = feesOptions;
  },
  { immediate: true, deep: true }
);

watch(
  () => (priceSettingTypes.value.includes("Payment Method") ? getOptionsForType("Payment Method") : null),
  (paymentOptions) => {
    if (!paymentOptions?.length) return;
    const current = priceSettingsSelections.value["Payment Method"];
    const next = pickDefaultPaymentMethod(paymentOptions, current);
    if (next && next !== current) priceSettingsSelections.value["Payment Method"] = next;
  },
  { immediate: true, deep: true }
);

const updatePriceSettingField = (type, value) => {
  priceSettingsSelections.value[type] = value;

  if (type === "Grade") {
    const selectedGradeObj = priceSettings.value.find((ps) => ps.type === "Grade" && ps.name === value);
    const currentPay = priceSettingsSelections.value["Payment Method"];
    if (currentPay && selectedGradeObj) {
      const payObj = priceSettings.value.find((ps) => ps.type === "Payment Method" && ps.name === currentPay);
      if (payObj) {
        const pids = payObj.parent_ids || payObj.parent_id || (payObj.parents ? payObj.parents.map((p) => p.id) : []);
        if (pids.length > 0 && !pids.includes(selectedGradeObj.id)) {
          priceSettingsSelections.value["Payment Method"] = "";
        }
      }
    }
  }
};

let calcTimeout = null;
const runCalculation = () => {
  if (calcTimeout) clearTimeout(calcTimeout);
  calculationPending.value = true;

  calcTimeout = setTimeout(async () => {
    try {
      if (!selectedScholarshipId.value || loadingSettings.value) return;
      if (!canGenerateSchedule(activePriceSettings.value)) {
        apiCalculationResult.value = null;
        modules.value = [];
        return;
      }

      const priceSettingIds = activePriceSettings.value.map((ps) => ps.id);
      calculatingPlan.value = true;

      const response = await reservationStore.calculateScholarshipPlan(
        selectedScholarshipId.value,
        priceSettingIds
      );

      if (response) {
        const normalized = normalizeCalculationResponse(response);
        apiCalculationResult.value = normalized;

        const baseForModules =
          normalized.calculation_breakdown?.base_scholarship_price || basePrice.value;
        const mapped = mapStudyPlanToModules(normalized.study_plan, baseForModules);
        modules.value = mergeInstallmentsIntoModules(mapped, normalized.schedule);
      }
    } catch (err) {
      console.error("Error calculating scholarship plan:", err);
    } finally {
      calculatingPlan.value = false;
      calculationPending.value = false;
    }
  }, 150);
};

watch(activePriceSettings, () => runCalculation(), { deep: true });

const isCalculationActive = computed(() => calculatingPlan.value || calculationPending.value);
</script>

<template>
  <div class="p-4 relative">
    <div class="grid grid-cols-12 gap-4">
      <!-- Left: Program + Pricing (no student) -->
      <div class="col-span-3 space-y-4">
        <!-- Scholarship program selection -->
        <div class="card p-4.5 bg-white border border-slate-100 shadow-sm">
          <h2 class="text-sm font-bold text-indigo-650 uppercase tracking-wide border-b pb-2 mb-3">
            Program & Eligibility
          </h2>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Scholarship Program</label>
              <select
                v-model="selectedScholarshipId"
                class="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-semibold text-slate-700 bg-slate-50/50"
              >
                <option value="" disabled>Select Scholarship</option>
                <option v-for="s in scholarshipStore.scholarships" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Grade (Optional)</label>
              <select
                v-model="selectedGrade"
                class="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-semibold text-slate-700 bg-slate-50/50"
              >
                <option value="">No specific grade</option>
                <option value="Pass">Pass</option>
                <option value="Good">Good</option>
                <option value="V.Good">V.Good</option>
                <option value="Excellent">Excellent</option>
                <option value="5 Years Ex">5 Years Ex</option>
                <option value=">45">&gt;45</option>
              </select>
            </div>

            <div v-if="currentScholarshipObj" class="bg-indigo-50/20 p-2.5 rounded-xl border border-indigo-100/30">
              <span class="block text-[9px] font-extrabold uppercase tracking-wider text-indigo-700">Selected Program</span>
              <span class="font-bold text-slate-800 text-xs mt-1 block leading-tight">{{ currentScholarshipObj.name }}</span>
              <div class="flex justify-between items-center mt-2 pt-1.5 border-t border-indigo-100/30 text-[10px]">
                <span class="text-slate-400">Base Price:</span>
                <span class="font-extrabold text-indigo-900">{{ basePrice.toLocaleString() }} EGP</span>
              </div>
              <div v-if="selectedGrade" class="flex justify-between items-center mt-1 text-[10px]">
                <span class="text-slate-400">Grade:</span>
                <span class="font-bold text-slate-700">{{ resolvedGradeSetting?.name || selectedGrade }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pricing options (from scholarship-price-settings API) -->
        <div v-if="selectedScholarshipId" class="card p-5 bg-white border border-slate-100 shadow-sm relative">
          <div
            v-if="loadingSettings"
            class="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center rounded-2xl gap-2"
          >
            <Loader2 class="w-7 h-7 text-indigo-600 animate-spin" />
            <span class="text-[10px] font-bold text-slate-500">Loading pricing settings...</span>
          </div>

          <div v-if="priceSettingTypes.length > 0" class="space-y-3">
            <h2 class="text-sm font-bold text-indigo-650 uppercase tracking-wide border-b pb-1 mb-2 flex items-center gap-1.5">
              <span class="p-1 bg-indigo-50 text-indigo-600 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </span>
              Pricing Options
            </h2>

            <div v-for="type in priceSettingTypes" :key="type">
              <label class="block text-xs font-semibold text-gray-750 mb-1">{{ type }}</label>

              <div
                v-if="type === 'Paper' || type === 'Fees'"
                class="space-y-1 bg-slate-50/50 p-2 rounded-xl border border-slate-100/60 max-h-36 overflow-y-auto"
              >
                <label
                  v-for="opt in getOptionsForType(type)"
                  :key="opt"
                  class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer select-none"
                  :class="type === 'Fees' ? 'opacity-80 cursor-not-allowed' : 'hover:bg-white hover:border-slate-100'"
                >
                  <input
                    type="checkbox"
                    :checked="type === 'Fees' || priceSettingsSelections[type]?.includes(opt)"
                    :disabled="type === 'Fees'"
                    @change="type !== 'Fees' && toggleOption(opt, type)"
                    class="rounded text-indigo-600 w-3.5 h-3.5"
                  />
                  <span class="text-xs font-medium" :class="type === 'Fees' ? 'text-indigo-600' : 'text-slate-600'">{{ opt }}</span>
                </label>
                <div v-if="getOptionsForType(type).length === 0" class="text-xs text-slate-400 italic py-2 text-center">
                  No options available
                </div>
              </div>

              <select
                v-else
                :value="priceSettingsSelections[type] || ''"
                @change="updatePriceSettingField(type, $event.target.value)"
                class="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-700 bg-slate-50/50"
              >
                <option value="" disabled>Select {{ type }}</option>
                <option v-for="opt in getOptionsForType(type)" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
          </div>

          <div v-else-if="!loadingSettings" class="text-center py-6 text-slate-400 italic text-xs">
            Select a scholarship and grade to load pricing options.
          </div>
        </div>
      </div>

      <!-- Right: Modules + breakdown (same as Scholarship tab) -->
      <div class="col-span-9 flex flex-col gap-4">
        <div v-if="!selectedScholarshipId" class="card p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
          <h3 class="font-extrabold text-slate-800 text-lg">Scholarship Calculator</h3>
          <p class="text-xs text-slate-400 mt-2 max-w-sm">
            Select a scholarship program and grade on the left, then configure pricing options to calculate the study plan and payment schedule.
          </p>
        </div>

        <template v-else>
          <div class="relative">
            <ModulesTable :modules="modules" @refresh-data="runCalculation" />
            <div
              v-if="isCalculationActive"
              class="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-2xl gap-2"
            >
              <Loader2 class="w-8 h-8 text-indigo-600 animate-spin" />
              <span class="text-xs font-bold text-indigo-600">Calculating plan...</span>
            </div>
          </div>

          <div class="card p-5 overflow-hidden border-indigo-50 bg-white relative">
            <div
              v-if="isCalculationActive"
              class="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl"
            >
              <Loader2 class="w-8 h-8 text-indigo-600 animate-spin" />
            </div>

            <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 class="text-md font-bold text-indigo-950 flex items-center gap-2">
                <span class="p-1 bg-indigo-50 text-indigo-600 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 11h.01M12 7h.01M12 14h.01M15 11h.01M15 7h.01M5 12a7 7 0 1014 0 7 7 0 00-14 0z" />
                  </svg>
                </span>
                Applied Pricing & Adjustments
              </h3>
              <span class="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                Calculated dynamically
              </span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div class="lg:col-span-2 overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th class="pb-2">Adjustment / Modifier</th>
                      <th class="pb-2">Type</th>
                      <th class="pb-2 text-right">Rate / Value</th>
                      <th class="pb-2 text-right">Financial Impact</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-xs">
                    <tr class="text-slate-600 font-medium">
                      <td class="py-2.5 flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
                        Scholarship Program Price (Base)
                      </td>
                      <td class="py-2.5">
                        <span class="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">Base</span>
                      </td>
                      <td class="py-2.5 text-right font-medium text-slate-400">-</td>
                      <td class="py-2.5 text-right font-bold text-slate-800">
                        {{ calculatedBreakdown.basePrice.toLocaleString() }} EGP
                      </td>
                    </tr>

                    <tr v-for="item in calculatedBreakdown.modifiers" :key="item.id" class="text-slate-600 hover:bg-slate-50/50 transition">
                      <td class="py-2.5">
                        <div class="font-bold text-slate-700">{{ item.name }}</div>
                        <div v-if="item.description" class="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">{{ item.description }}</div>
                      </td>
                      <td class="py-2.5">
                        <span class="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50">{{ item.type }}</span>
                      </td>
                      <td class="py-2.5 text-right font-semibold text-slate-600">{{ item.displayRate }}</td>
                      <td class="py-2.5 text-right font-extrabold" :class="item.modifier === 'discount' ? 'text-emerald-600' : 'text-rose-600'">
                        {{ item.displayImpact }}
                      </td>
                    </tr>

                    <tr v-if="calculatedBreakdown.modifiers.length === 0">
                      <td colspan="4" class="py-4 text-center text-slate-400 italic">
                        Configure pricing options to see the calculation breakdown.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="bg-gradient-to-br from-indigo-50/20 to-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 flex flex-col justify-between">
                <div>
                  <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-2.5 border-b border-indigo-100/60 pb-1.5">
                    Summary Calculations
                  </h4>
                  <div class="space-y-2 text-xs">
                    <div class="flex justify-between text-slate-500">
                      <span>Base Program:</span>
                      <span class="font-medium text-slate-700">{{ calculatedBreakdown.basePrice.toLocaleString() }} EGP</span>
                    </div>
                    <div class="flex justify-between text-slate-500">
                      <span>Total Adjustments:</span>
                      <span class="font-bold" :class="calculatedBreakdown.totalAdjustments < 0 ? 'text-emerald-600' : (calculatedBreakdown.totalAdjustments > 0 ? 'text-rose-600' : 'text-slate-700')">
                        {{ calculatedBreakdown.totalAdjustments < 0 ? '' : '+' }}{{ calculatedBreakdown.totalAdjustments.toLocaleString() }} EGP
                      </span>
                    </div>
                    <div
                      v-if="calculatedBreakdown.firstInstallment !== null && calculatedBreakdown.firstInstallment !== undefined"
                      class="flex justify-between text-slate-500 border-t border-indigo-100/40 pt-1.5 mt-1.5"
                    >
                      <span>First Installment:</span>
                      <span class="font-bold text-slate-700">{{ calculatedBreakdown.firstInstallment.toLocaleString() }} EGP</span>
                    </div>
                    <div
                      v-if="calculatedBreakdown.remainingBalance !== null && calculatedBreakdown.remainingBalance !== undefined"
                      class="flex justify-between text-slate-500"
                    >
                      <span>Remaining Balance:</span>
                      <span class="font-medium text-slate-700">{{ calculatedBreakdown.remainingBalance.toLocaleString() }} EGP</span>
                    </div>
                    <div
                      v-if="calculatedBreakdown.installmentsCount !== null && calculatedBreakdown.installmentsCount !== undefined"
                      class="flex justify-between text-slate-500"
                    >
                      <span>Installments Count:</span>
                      <span class="font-medium text-slate-700">{{ calculatedBreakdown.installmentsCount }}</span>
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-indigo-100/60">
                  <span class="block text-[10px] font-extrabold uppercase tracking-wider text-indigo-800">Suggested Final Amount</span>
                  <div class="flex items-baseline gap-1 mt-1">
                    <span class="text-2xl font-black text-indigo-950 tracking-tight">
                      {{ calculatedBreakdown.suggestedFinalAmount.toLocaleString() }}
                    </span>
                    <span class="text-[10px] font-bold text-indigo-700">EGP</span>
                  </div>
                  <p class="text-[9px] text-slate-400 mt-1.5 italic leading-normal">
                    * Simulated using selected scholarship, grade, and pricing modifiers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
