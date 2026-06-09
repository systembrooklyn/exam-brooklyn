<script setup>
import { ref, computed, onMounted, watch } from "vue";
import StudentInfoPanel from "@/components/Reservation/StudentInfoPanel.vue";
import ModulesTable from "@/components/Reservation/ModulesTable.vue";
import FinalCasePanel from "@/components/Reservation/FinalCasePanel.vue";
import ActionButtons from "@/components/Reservation/ActionButtons.vue";
import { useReservationStore } from "@/stores/reservations";
import { usePriceSettingsStore } from "@/stores/priceSettingsStore";

const reservationStore = useReservationStore();
const priceSettingsStore = usePriceSettingsStore();

const showFinalCase = ref(false);
const loadingDetails = ref(false);
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
  // Added helper properties to populate StudentInfoPanel
  studyCategory: "",
  paperID: "",
  paperCertificate: "",
  paperHR: "",
  topStudent: "",
  offerMode: "",
  // Dynamic pricing selectors dictionary: type -> name
  priceSettings: {}
});

// Sync dynamic price settings selections with form properties for backward compatibility
watch(() => form.value.priceSettings, (newVal) => {
  if (newVal) {
    form.value.grade = newVal["Grade"] || "";
    form.value.paymentMethod = newVal["Payment Method"] || "";
  }
}, { deep: true });

// Cascading resolver for active price settings based on form selections
const activePriceSettings = computed(() => {
  const list = [];
  const allPs = priceSettingsStore.priceSettings || [];
  
  if (!allPs || allPs.length === 0) {
    // Fallback to static pricing settings if the store hasn't finished loading
    return priceSettings.value;
  }

  const selectedSettings = form.value.priceSettings || {};
  
  // First, add all explicitly selected settings by type
  Object.keys(selectedSettings).forEach(type => {
    const selectedName = selectedSettings[type];
    if (selectedName) {
      const ps = allPs.find(x => x.type === type && x.name === selectedName);
      if (ps) {
        list.push(ps);
      }
    }
  });

  // Second, auto-apply child settings that depend on the selections but don't have their own selectors
  allPs.forEach(ps => {
    // If it's already explicitly added, skip
    if (list.some(x => x.id === ps.id)) return;
    
    if (ps.is_active) {
      const pids = ps.parent_ids || ps.parent_id || (ps.parents ? ps.parents.map(p => p.id) : []);
      if (pids.length > 0) {
        // All parent constraints must be satisfied by selected values
        const allParentsSatisfied = pids.every(pid => {
          const parentObj = allPs.find(x => x.id === pid);
          if (!parentObj) return false;
          return selectedSettings[parentObj.type] === parentObj.name;
        });
        
        if (allParentsSatisfied) {
          // If the setting's type is not explicitly selected in the form, auto-apply it
          if (!selectedSettings[ps.type]) {
            list.push(ps);
          }
        }
      }
    }
  });

  return list;
});

// Dynamic calculation of modifiers impact
const calculatedBreakdown = computed(() => {
  const base = basePrice.value;
  const list = [];
  
  activePriceSettings.value.forEach(item => {
    const amountVal = parseFloat(item.amount) || 0;
    let impact = 0;
    if (item.amount_type === "percentage") {
      impact = (amountVal / 100) * base;
    } else {
      impact = amountVal;
    }
    
    const isDiscount = item.modifier === "discount";
    const impactSigned = isDiscount ? -impact : impact;
    
    list.push({
      id: item.id,
      name: item.name,
      type: item.type,
      description: item.description,
      modifier: item.modifier,
      amount_type: item.amount_type,
      amount: amountVal,
      impact: impact,
      impactSigned: impactSigned,
      displayImpact: (isDiscount ? "-" : "+") + impact.toLocaleString() + " EGP",
      displayRate: item.amount_type === "percentage" ? `${amountVal}%` : `${amountVal.toLocaleString()} EGP`
    });
  });

  const totalAdjustments = list.reduce((sum, item) => sum + item.impactSigned, 0);
  const suggestedFinalAmount = Math.max(0, base + totalAdjustments);

  return {
    basePrice: base,
    modifiers: list,
    totalAdjustments,
    suggestedFinalAmount
  };
});

// Watch suggested amount changes to update finalAmount dynamically
watch(() => calculatedBreakdown.value.suggestedFinalAmount, (newAmount) => {
  form.value.finalAmount = newAmount;
});

const modules = ref([]);

const mapStudyPlanToModules = (studyPlan, baseScholarshipPrice) => {
  if (!studyPlan || studyPlan.length === 0) {
    modules.value = [];
    return;
  }
  
  const avgAmount = Math.round(baseScholarshipPrice / studyPlan.length);
  
  modules.value = studyPlan.map((item) => {
    const startsAt = item.starts_at;
    const dateObj = startsAt ? new Date(startsAt) : null;
    
    let formattedDate = "";
    let dayName = "";
    let deadlineStr = "";
    
    if (dateObj && !isNaN(dateObj.getTime())) {
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const yyyy = dateObj.getFullYear();
      formattedDate = `${dd}/${mm}/${yyyy}`;
      
      dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
      
      const deadlineDate = new Date(dateObj);
      deadlineDate.setDate(deadlineDate.getDate() - 1);
      const dlDay = deadlineDate.getDate();
      const dlMonth = deadlineDate.toLocaleDateString("en-US", { month: "short" });
      const dlYear = deadlineDate.getFullYear();
      deadlineStr = `${dlDay} ${dlMonth} ${dlYear}`;
    } else {
      formattedDate = startsAt || "N/A";
      dayName = "TBD";
      deadlineStr = "TBD";
    }
    
    return {
      name: item.course_name,
      code: String(item.course_code),
      startDate: formattedDate,
      day: dayName,
      time: "10 to 3",
      amount: avgAmount,
      deadline: deadlineStr
    };
  });
};

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

onMounted(async () => {
  // Fetch global price settings
  priceSettingsStore.fetchPriceSettings();

  const saved = sessionStorage.getItem("selectedReservation");
  if (saved) {
    try {
      const summary = JSON.parse(saved);
      if (summary && summary.id) {
        loadingDetails.value = true;
        const detail = await reservationStore.getReservationById(summary.id);
        if (detail) {
          reservationDetails.value = detail;
          
          basePrice.value = detail.student?.scholarship?.price || 0;
          priceSettings.value = detail.price_settings || [];
          
          form.value.name = detail.student?.name || "";
          form.value.scholarship = detail.student?.scholarship?.name 
            ? `${detail.student.scholarship.name} (${detail.student.scholarship.price?.toLocaleString()} EGP)` 
            : (detail.student?.scholarship?.price || "");
          form.value.studentType = detail.student?.careerType || "";
          form.value.studyType = detail.student?.scholarship?.study_type || "";
          form.value.nationality = detail.student?.nationality || "";
          form.value.notes = detail.student?.notes || "";
          form.value.studyCategory = detail.student?.faculity || "";
          
          // Initialize dynamic pricing selectors dictionary from initially applied settings
          const selectedSettings = {};
          detail.price_settings?.forEach(ps => {
            selectedSettings[ps.type] = ps.name;
          });
          form.value.priceSettings = selectedSettings;
          
          form.value.paperID = detail.student?.ID_number ? "ID" : "";
          form.value.paperCertificate = detail.student?.grade ? "Certificate" : "";
          form.value.paperHR = detail.student?.company ? "HR" : "Not HR";
          
          mapStudyPlanToModules(detail.study_plan, basePrice.value);
          
          form.value.finalAmount = calculatedBreakdown.value.suggestedFinalAmount;
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
});

const submitForm = () => {
  console.log("Submitted scholarship form:", form.value);
};
</script>

<template>
  <div class="p-4 relative">
    <!-- Skeleton Loading State -->
    <div v-if="loadingDetails" class="w-full p-8 flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-slate-100 shadow-sm gap-4">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
      <div class="text-center space-y-1.5">
        <h3 class="font-extrabold text-slate-800 text-lg">Retrieving Reservation Details</h3>
        <p class="text-xs text-slate-400">Please wait while we fetch the latest scholarship plan and pricing modifiers...</p>
      </div>
    </div>

    <!-- Main Content Panel (show when not loading) -->
    <div v-else class="grid grid-cols-12 gap-4">
      <div class="col-span-3">
        <StudentInfoPanel v-model="form" :student-info="reservationDetails?.student" />
      </div>
      <div class="col-span-9 flex flex-col h-full gap-4">
        <ModulesTable :modules="modules" />

        <!-- Applied Pricing & Adjustments Table -->
        <div v-if="reservationDetails" class="card p-5 overflow-hidden border-indigo-50 bg-white">
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
                      <span class="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">Base</span>
                    </td>
                    <td class="py-2.5 text-right font-medium text-slate-400">-</td>
                    <td class="py-2.5 text-right font-bold text-slate-800">
                      {{ calculatedBreakdown.basePrice.toLocaleString() }} EGP
                    </td>
                  </tr>

                  <!-- Modifiers rows -->
                  <tr v-for="item in calculatedBreakdown.modifiers" :key="item.id" class="text-slate-600 hover:bg-slate-50/50 transition">
                    <td class="py-2.5">
                      <div class="font-bold text-slate-700">{{ item.name }}</div>
                      <div v-if="item.description" class="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">{{ item.description }}</div>
                    </td>
                    <td class="py-2.5">
                      <span class="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                        {{ item.type }}
                      </span>
                    </td>
                    <td class="py-2.5 text-right font-semibold text-slate-600">
                      {{ item.displayRate }}
                    </td>
                    <td class="py-2.5 text-right font-extrabold" :class="item.modifier === 'discount' ? 'text-emerald-600' : 'text-rose-600'">
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
            <div class="bg-gradient-to-br from-indigo-50/20 to-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 flex flex-col justify-between">
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-2.5 border-b border-indigo-100/60 pb-1.5 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
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
                  * Calculated dynamically using the student's academic/personal modifiers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-2 flex justify-end">
          <button
            @click="showFinalCase = true"
            class="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg text-lg flex items-center gap-2"
          >
            <span>Next Step</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showFinalCase"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
      @click.self="showFinalCase = false"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all scale-100 p-6 relative"
      >
        <div class="flex justify-between items-center mb-6 border-b pb-4">
          <h2 class="text-2xl font-bold text-gray-800">Final Case Details</h2>
          <button
            @click="showFinalCase = false"
            class="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-red-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
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
  </div>
</template>
