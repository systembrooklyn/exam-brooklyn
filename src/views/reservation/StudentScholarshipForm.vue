<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import notyf from "@/components/global/notyf";
import StudentInfoPanel from "@/components/Reservation/StudentInfoPanel.vue";
import ModulesTable from "@/components/Reservation/ModulesTable.vue";
import FinalCasePanel from "@/components/Reservation/FinalCasePanel.vue";
import ActionButtons from "@/components/Reservation/ActionButtons.vue";
import { useReservationStore } from "@/stores/reservations";
import { useScholarshipPricing } from "@/composables/useScholarshipPricing";
import {
  normalizeCalculationResponse,
  mapStudyPlanToModules,
  mergeInstallmentsIntoModules,
  flattenReservationPriceSettings,
  initSelectionsFromReservation,
  findGradeSetting,
  getGradeSettingFromResponse,
} from "@/utils/scholarshipPlanResponse";
import { Loader2 } from "lucide-vue-next";

const router = useRouter();
const reservationStore = useReservationStore();

const showFinalCase = ref(false);
const loadingDetails = ref(false);
const savingStudent = ref(false);
const reservationDetails = ref(null);

const basePrice = ref(0);
const priceSettings = ref([]);

const form = ref({
  name: "",
  grade: "",
  scholarship: "",
  studentType: "",
  studyType: "",
  paymentMethod: "",
  papers: [],
  nationality: "",
  offers: "",
  finalCase: "",
  finalAmount: "",
  notes: "",
  studyCategory: "",
  paperID: "",
  paperCertificate: "",
  paperHR: "",
  topStudent: "",
  offerMode: "",
  priceSettings: {},
});

watch(
  () => form.value.priceSettings,
  (newVal) => {
    if (newVal) {
      form.value.grade = newVal["Grade"] || "";
      form.value.paymentMethod = newVal["Payment Method"] || "";
    }
  },
  { deep: true }
);

const resolvedGradeSetting = computed(() => {
  const studentGrade = reservationDetails.value?.student?.grade;
  if (studentGrade) {
    return (
      findGradeSetting(studentGrade, priceSettings.value) ||
      getGradeSettingFromResponse(priceSettings.value)
    );
  }
  return getGradeSettingFromResponse(priceSettings.value);
});

const apiCalculationResult = ref(null);
const calculatingDeadlines = ref(false);
const modules = ref([]);

const priceSelections = computed(() => form.value.priceSettings);

const { activePriceSettings, calculatedBreakdown } = useScholarshipPricing({
  priceSettings,
  selections: priceSelections,
  resolvedGradeSetting,
  apiCalculationResult,
  basePrice,
});

let calcTimeout = null;
let calcNonce = 0;

const updateCalculationAndSchedule = async () => {
  if (calcTimeout) clearTimeout(calcTimeout);

  calcTimeout = setTimeout(async () => {
    const scholarshipId = reservationDetails.value?.student?.scholarship?.id;
    if (!scholarshipId) return;

    const priceSettingIds = activePriceSettings.value.map((ps) => ps.id);

    calcNonce++;
    const currentNonce = calcNonce;

    try {
      calculatingDeadlines.value = true;
      const response = await reservationStore.calculateDeadlines(
        scholarshipId,
        priceSettingIds
      );

      if (response && currentNonce === calcNonce) {
        const normalized = normalizeCalculationResponse(response);
        apiCalculationResult.value = normalized;
        modules.value = mergeInstallmentsIntoModules(
          modules.value,
          normalized.schedule
        );
        form.value.finalAmount = normalized.total_price;
      }
    } catch (err) {
      console.error("Error calculating deadlines:", err);
    } finally {
      if (currentNonce === calcNonce) {
        calculatingDeadlines.value = false;
      }
    }
  }, 100);
};

watch(activePriceSettings, () => updateCalculationAndSchedule(), { deep: true });

watch(
  () => calculatedBreakdown.value.suggestedFinalAmount,
  (newAmount) => {
    form.value.finalAmount = newAmount;
  }
);

const populateFromSummary = (summary) => {
  if (summary && summary.student) {
    form.value.name = summary.student.name || "";
    form.value.grade = summary.student.grade || "";
    form.value.scholarship = summary.student.scholarship?.price
      ? `${summary.student.scholarship.name || ''} (${summary.student.scholarship.price.toLocaleString()} EGP)`
      : (summary.student.scholarship?.name || "");
    form.value.studentType = summary.student.careerType || "";
    form.value.studyType = summary.student.scholarship?.study_type || "";
    form.value.nationality = summary.student.nationality || "";
    form.value.notes = summary.student.notes || "";
  }
};

const fetchReservationDetails = async (showFullLoader = false) => {
  const saved = sessionStorage.getItem("selectedReservation");
  if (saved) {
    try {
      const summary = JSON.parse(saved);
      if (summary && summary.id) {
        if (showFullLoader) {
          loadingDetails.value = true;
        }
        const detail = await reservationStore.getReservationById(summary.id);
        if (detail) {
          reservationDetails.value = detail;

          basePrice.value = detail.student?.scholarship?.price || 0;

          const flattenedSettings = flattenReservationPriceSettings(detail.price_settings);
          priceSettings.value = flattenedSettings;

          form.value.name = detail.student?.name || "";
          form.value.scholarship = detail.student?.scholarship?.name
            ? `${detail.student.scholarship.name} (${detail.student.scholarship.price?.toLocaleString()} EGP)`
            : (detail.student?.scholarship?.price || "");
          form.value.studentType = detail.student?.careerType || "";
          form.value.studyType = detail.student?.scholarship?.study_type || "";
          form.value.nationality = detail.student?.nationality || "";
          form.value.notes = detail.student?.notes || "";
          form.value.studyCategory = detail.student?.faculity || "";

          form.value.priceSettings = initSelectionsFromReservation(flattenedSettings);

          form.value.paperID = detail.student?.ID_number ? "ID" : "";
          form.value.paperCertificate = detail.student?.grade ? "Certificate" : "";
          form.value.paperHR = detail.student?.company ? "HR" : "Not HR";

          modules.value = mapStudyPlanToModules(detail.study_plan, basePrice.value);

          form.value.finalAmount = calculatedBreakdown.value.suggestedFinalAmount;
          await updateCalculationAndSchedule();
        } else {
          populateFromSummary(summary);
        }
      } else {
        populateFromSummary(summary);
      }
    } catch (e) {
      console.error("Failed to parse/fetch reservation", e);
      populateFromSummary(JSON.parse(saved));
    } finally {
      loadingDetails.value = false;
    }
  }
};

onMounted(() => {
  fetchReservationDetails(true);
});

const handleSaveStudent = async (updatedStudentFields) => {
  if (!reservationDetails.value?.id) {
    notyf.error("No active reservation details found.");
    return;
  }

  const statusMap = {
    "RESERVATION": "reserve",
    "MANUAL": "manual",
    "MANUAL EXAM": "manual exam",
    "Extend": "extend",
    "CANCELLATION": "cancel"
  };

  const statusKey = statusMap[form.value.finalCase] || form.value.finalCase?.toLowerCase() || reservationDetails.value.status?.key || "reserve";
  const scholarshipId = reservationDetails.value?.student?.scholarship?.id;
  const priceSettingIds = activePriceSettings.value.map(ps => ps.id);

  let formattedPhones = updatedStudentFields.phones;
  if (typeof formattedPhones === "string") {
    formattedPhones = formattedPhones.split(",").map(p => p.trim()).filter(Boolean);
  }

  const payload = {
    name: updatedStudentFields.name,
    email: updatedStudentFields.email,
    phones: formattedPhones,
    ID_number: updatedStudentFields.ID_number || "",
    grade: updatedStudentFields.grade || "",
    birth_date: updatedStudentFields.birth_date || "",
    nationality: updatedStudentFields.nationality || "",
    governorate: updatedStudentFields.governorate || "",
    company: updatedStudentFields.company || "",
    careerType: updatedStudentFields.careerType || "",
    faculity: updatedStudentFields.faculity || "",
    major: updatedStudentFields.major || "",

    // Reservation metadata and settings
    scholarship: updatedStudentFields.scholarship || scholarshipId,
    status: statusKey,
    called_by: reservationDetails.value?.called_by?.id || reservationDetails.value?.called_by,
    called_time: reservationDetails.value?.called_time,
    marketing_code: reservationDetails.value?.student?.marketing_code || "",
    final_amount: parseFloat(form.value.finalAmount) || 0,
    finalAmount: parseFloat(form.value.finalAmount) || 0,
    notes: form.value.notes,
    price_setting_ids: priceSettingIds,
    price_settings: priceSettingIds
  };

  try {
    savingStudent.value = true;
    await reservationStore.updateReservation(reservationDetails.value.id, payload);

    // Call the refresh function directly to sync all components and retrieve updated data
    await fetchReservationDetails(false);
  } catch (err) {
    console.error("Failed to update student profile info:", err);
  } finally {
    savingStudent.value = false;
  }
};

const submitForm = async () => {
  if (!reservationDetails.value?.id) {
    notyf.error("No active reservation details found.");
    return;
  }

  const statusMap = {
    "RESERVATION": "reserve",
    "MANUAL": "manual",
    "MANUAL EXAM": "manual exam",
    "Extend": "extend",
    "CANCELLATION": "cancel"
  };

  const statusKey = statusMap[form.value.finalCase] || form.value.finalCase?.toLowerCase() || "reserve";
  const scholarshipId = reservationDetails.value?.student?.scholarship?.id;
  const priceSettingIds = activePriceSettings.value.map(ps => ps.id);

  const payload = {
    name: reservationDetails.value?.student?.name,
    email: reservationDetails.value?.student?.email,
    phones: reservationDetails.value?.student?.phones,
    ID_number: reservationDetails.value?.student?.ID_number,
    grade: form.value.grade,
    birth_date: reservationDetails.value?.student?.birth_date,
    company: reservationDetails.value?.student?.company,
    marketing_code: reservationDetails.value?.student?.marketing_code,
    scholarship: scholarshipId,
    status: statusKey,
    called_by: reservationDetails.value?.called_by?.id || reservationDetails.value?.called_by,
    called_time: reservationDetails.value?.called_time,
    careerType: reservationDetails.value?.student?.careerType,
    faculity: reservationDetails.value?.student?.faculity || reservationDetails.value?.student?.faculty,
    major: reservationDetails.value?.student?.major || reservationDetails.value?.student?.majorx,
    final_amount: parseFloat(form.value.finalAmount) || 0,
    finalAmount: parseFloat(form.value.finalAmount) || 0,
    notes: form.value.notes,
    price_setting_ids: priceSettingIds,
    price_settings: priceSettingIds,
  };

  try {
    loadingDetails.value = true;
    await reservationStore.updateReservation(reservationDetails.value.id, payload);
    router.push({ name: "waiting-list" });
  } catch (err) {
    console.error("Failed to submit waitlist handling:", err);
  } finally {
    loadingDetails.value = false;
  }
};
</script>

<template>
  <div class="p-4 relative">
    <!-- Skeleton Loading State -->
    <div v-if="loadingDetails"
      class="w-full p-8 flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-slate-100 shadow-sm gap-4">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
      <div class="text-center space-y-1.5">
        <h3 class="font-extrabold text-slate-800 text-lg">Retrieving Reservation Details</h3>
        <p class="text-xs text-slate-400">Please wait while we fetch the latest scholarship plan and pricing
          modifiers...</p>
      </div>
    </div>

    <!-- Main Content Panel (show when not loading) -->
    <div v-else class="grid grid-cols-12 gap-4">
      <div class="col-span-3">
        <StudentInfoPanel
          v-model="form"
          :student-info="reservationDetails?.student"
          :price-settings="priceSettings"
          :is-saving="savingStudent"
          :is-calculating="calculatingDeadlines"
          @save-student="handleSaveStudent"
          @refresh-data="fetchReservationDetails"
        />
      </div>
      <div class="col-span-9 flex flex-col h-full gap-4">
        <!-- Academic Modules Schedule -->
        <div class="relative">
          <ModulesTable :modules="modules" @refresh-data="fetchReservationDetails" />
          <div v-if="calculatingDeadlines" class="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
             <Loader2 class="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        </div>

        <!-- Applied Pricing & Adjustments Table -->
        <div v-if="reservationDetails" class="card p-5 overflow-hidden border-indigo-50 bg-white relative">
          <!-- Localized Loader Overlay -->
          <div v-if="calculatingDeadlines" class="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
             <Loader2 class="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 class="text-md font-bold text-indigo-950 flex items-center gap-2">
              <span class="p-1 bg-indigo-50 text-indigo-600 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 11h.01M12 7h.01M12 14h.01M15 11h.01M15 7h.01M5 12a7 7 0 1014 0 7 7 0 00-14 0z" />
                </svg>
              </span>
              Applied Pricing & Adjustments
            </h3>
            <span
              class="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
              Calculated dynamically
            </span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <!-- Left: Table of Modifiers -->
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
                  <!-- Base Price row -->
                  <tr class="text-slate-600 font-medium">
                    <td class="py-2.5 flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
                      Scholarship Program Price (Base)
                    </td>
                    <td class="py-2.5">
                      <span
                        class="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">Base</span>
                    </td>
                    <td class="py-2.5 text-right font-medium text-slate-400">-</td>
                    <td class="py-2.5 text-right font-bold text-slate-800">
                      {{ calculatedBreakdown.basePrice.toLocaleString() }} EGP
                    </td>
                  </tr>

                  <!-- Modifiers rows -->
                  <tr v-for="item in calculatedBreakdown.modifiers" :key="item.id"
                    class="text-slate-600 hover:bg-slate-50/50 transition">
                    <td class="py-2.5">
                      <div class="font-bold text-slate-700">{{ item.name }}</div>
                      <div v-if="item.description" class="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">
                        {{ item.description }}</div>
                    </td>
                    <td class="py-2.5">
                      <span
                        class="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                        {{ item.type }}
                      </span>
                    </td>
                    <td class="py-2.5 text-right font-semibold text-slate-600">
                      {{ item.displayRate }}
                    </td>
                    <td class="py-2.5 text-right font-extrabold"
                      :class="item.modifier === 'discount' ? 'text-emerald-600' : 'text-rose-600'">
                      {{ item.displayImpact }}
                    </td>
                  </tr>

                  <!-- No Modifiers empty state -->
                  <tr v-if="calculatedBreakdown.modifiers.length === 0">
                    <td colspan="4" class="py-4 text-center text-slate-400 italic">
                      No additional pricing modifiers apply for this reservation.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Right Column: Final Summary Details -->
            <div
              class="bg-gradient-to-br from-indigo-50/20 to-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 flex flex-col justify-between">
              <div>
                <h4
                  class="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-2.5 border-b border-indigo-100/60 pb-1.5 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-indigo-600" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Summary Calculations
                </h4>
                <div class="space-y-2 text-xs">
                  <div class="flex justify-between text-slate-500">
                    <span>Base Program:</span>
                    <span class="font-medium text-slate-700">{{ calculatedBreakdown.basePrice.toLocaleString() }}
                      EGP</span>
                  </div>
                  <div class="flex justify-between text-slate-500">
                    <span>Total Adjustments:</span>
                    <span class="font-bold"
                      :class="calculatedBreakdown.totalAdjustments < 0 ? 'text-emerald-600' : (calculatedBreakdown.totalAdjustments > 0 ? 'text-rose-600' : 'text-slate-700')">
                      {{ calculatedBreakdown.totalAdjustments < 0 ? '' : '+' }}{{
                        calculatedBreakdown.totalAdjustments.toLocaleString() }} EGP </span>
                  </div>
                  <div
                    v-if="calculatedBreakdown.firstInstallment !== null && calculatedBreakdown.firstInstallment !== undefined"
                    class="flex justify-between text-slate-500 border-t border-indigo-100/40 pt-1.5 mt-1.5">
                    <span>First Installment:</span>
                    <span class="font-bold text-slate-700">{{ calculatedBreakdown.firstInstallment.toLocaleString() }}
                      EGP</span>
                  </div>
                  <div
                    v-if="calculatedBreakdown.remainingBalance !== null && calculatedBreakdown.remainingBalance !== undefined"
                    class="flex justify-between text-slate-500">
                    <span>Remaining Balance:</span>
                    <span class="font-medium text-slate-700">{{ calculatedBreakdown.remainingBalance.toLocaleString() }}
                      EGP</span>
                  </div>
                  <div
                    v-if="calculatedBreakdown.installmentsCount !== null && calculatedBreakdown.installmentsCount !== undefined"
                    class="flex justify-between text-slate-500">
                    <span>Installments Count:</span>
                    <span class="font-medium text-slate-700">{{ calculatedBreakdown.installmentsCount }}</span>
                  </div>
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-indigo-100/60">
                <span class="block text-[10px] font-extrabold uppercase tracking-wider text-indigo-800">Suggested Final
                  Amount</span>
                <div class="flex items-baseline gap-1 mt-1">
                  <span class="text-2xl font-black text-indigo-950 tracking-tight">
                    {{ calculatedBreakdown.suggestedFinalAmount.toLocaleString() }}
                  </span>
                  <span class="text-[10px] font-bold text-indigo-700">EGP</span>
                </div>
                <p class="text-[9px] text-slate-400 mt-1.5 italic leading-normal">
                  * Calculated dynamically using the student's academic/personal modifiers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-2 flex justify-end">
          <button @click="showFinalCase = true"
            class="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg text-lg flex items-center gap-2">
            <span>Next Step</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showFinalCase"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
    @click.self="showFinalCase = false">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all scale-100 p-6 relative">
      <div class="flex justify-between items-center mb-6 border-b pb-4">
        <h2 class="text-2xl font-bold text-gray-800">Final Case Details</h2>
        <button @click="showFinalCase = false"
          class="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-6">
        <FinalCasePanel v-model="form" />

        <div class="pt-4 border-t">
          <ActionButtons @submit="submitForm" />
        </div>
      </div>
    </div>
  </div>
  <!-- </div> -->
</template>
