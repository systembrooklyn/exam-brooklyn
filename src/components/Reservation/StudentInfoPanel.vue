<script setup>
import { computed, ref } from "vue";
import { usePriceSettingsStore } from "@/stores/priceSettingsStore";

const props = defineProps({
  modelValue: Object,
  studentInfo: Object
});
const emit = defineEmits(["update:modelValue"]);

const updateField = (key, value) => {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
};

const ppError = ref(false);
const showAllDetails = ref(false);

const priceSettingsStore = usePriceSettingsStore();

const allSettings = computed(() => priceSettingsStore.priceSettings || []);

// Extract unique active price settings types
const priceSettingTypes = computed(() => {
  const activeTypes = allSettings.value.filter(ps => ps.is_active).map(ps => ps.type);
  return [...new Set(activeTypes)];
});

// Dynamic cascade filter for each option type
const getOptionsForType = (type) => {
  let settings = allSettings.value.filter(ps => ps.type === type && ps.is_active);
  
  // Cascade filter: only show settings where parent ID is selected or no parent constraints exist
  settings = settings.filter(ps => {
    const pids = ps.parent_ids || ps.parent_id || (ps.parents ? ps.parents.map(p => p.id) : []);
    if (pids.length === 0) return true;
    
    // Check if at least one parent's ID is active in the form selections
    return pids.some(pid => {
      const parentSetting = allSettings.value.find(x => x.id === pid);
      if (!parentSetting) return false;
      const selectedValueForParentType = props.modelValue?.priceSettings?.[parentSetting.type];
      return selectedValueForParentType === parentSetting.name;
    });
  });

  const base = settings.map(ps => ps.name);
  const current = props.modelValue?.priceSettings?.[type];
  if (current && !base.includes(current)) {
    base.unshift(current);
  }
  return base;
};

// Handle changing dynamic selectors and perform automatic dependency clearing
const updatePriceSettingField = (type, value) => {
  const updatedSettings = { ...props.modelValue.priceSettings, [type]: value };
  
  // Cascading clear: if Grade changes, verify if Payment Method is still valid
  if (type === "Grade") {
    const selectedGradeObj = allSettings.value.find(ps => ps.type === "Grade" && ps.name === value);
    const currentPay = updatedSettings["Payment Method"];
    if (currentPay && selectedGradeObj) {
      const payObj = allSettings.value.find(ps => ps.type === "Payment Method" && ps.name === currentPay);
      if (payObj) {
        const pids = payObj.parent_ids || payObj.parent_id || (payObj.parents ? payObj.parents.map(p => p.id) : []);
        if (pids.length > 0 && !pids.includes(selectedGradeObj.id)) {
          updatedSettings["Payment Method"] = "";
        }
      }
    }
  }

  emit("update:modelValue", {
    ...props.modelValue,
    priceSettings: updatedSettings
  });
};
</script>

<template>
  <div class="space-y-4">
    <!-- STUDENT PROFILE CARD -->
    <div v-if="studentInfo" class="card p-4.5 bg-white border border-slate-100 shadow-sm">
      <div class="flex flex-col items-center text-center pb-3 border-b border-slate-100 mb-3.5">
        <!-- Avatar -->
        <div class="w-18 h-18 rounded-full shadow-md border-2 border-white ring-4 ring-indigo-50/50 bg-indigo-50 flex items-center justify-center text-indigo-500 overflow-hidden shrink-0 mb-3">
          <img 
            v-if="studentInfo.ppUrl && !ppError"
            :src="studentInfo.ppUrl" 
            class="w-full h-full object-cover" 
            alt="Student Avatar" 
            @error="ppError = true"
          />
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </div>
        
        <h3 class="font-extrabold text-slate-800 text-base leading-tight">{{ studentInfo.name }}</h3>
        <p class="text-xs text-slate-400 mt-0.5">{{ studentInfo.email }}</p>
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 mt-2.5 border border-indigo-100/50">
          ID: {{ studentInfo.st_num || 'not set yet' }}
        </span>
      </div>

      <!-- Quick Details Grid -->
      <div class="space-y-2.5 text-xs">
        <!-- Phone numbers -->
        <div v-if="studentInfo.phones && studentInfo.phones.length > 0">
          <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Phones</span>
          <span class="font-semibold text-slate-700 mt-0.5 block">{{ studentInfo.phones.join(', ') }}</span>
        </div>

        <!-- Grade & Nationality -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Grade</span>
            <span class="font-semibold text-slate-700 mt-0.5 block">{{ studentInfo.grade || 'N/A' }}</span>
          </div>
          <div>
            <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Nationality</span>
            <span class="font-semibold text-slate-700 mt-0.5 block">{{ studentInfo.nationality || 'N/A' }}</span>
          </div>
        </div>

        <!-- Career & Major -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Career</span>
            <span class="font-semibold text-slate-700 mt-0.5 block">{{ studentInfo.careerType || 'N/A' }}</span>
          </div>
          <div>
            <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Major</span>
            <span class="font-semibold text-slate-700 mt-0.5 block">{{ studentInfo.major || studentInfo.majorx || 'N/A' }}</span>
          </div>
        </div>

        <!-- Scholarship details -->
        <div v-if="studentInfo.scholarship" class="bg-indigo-50/20 p-2.5 rounded-xl border border-indigo-100/30">
          <span class="block text-[9px] font-extrabold uppercase tracking-wider text-indigo-700">Scholarship Program</span>
          <span class="font-bold text-slate-800 text-xs mt-1 block leading-tight">{{ studentInfo.scholarship.name }}</span>
          <div class="flex justify-between items-center mt-2 pt-1.5 border-t border-indigo-100/30 text-[10px]">
            <span class="text-slate-400">Base Price:</span>
            <span class="font-extrabold text-indigo-900">{{ studentInfo.scholarship.price?.toLocaleString() }} EGP</span>
          </div>
        </div>

        <!-- Toggle More Details Button -->
        <button 
          type="button" 
          @click="showAllDetails = !showAllDetails" 
          class="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition mt-1"
        >
          <span>{{ showAllDetails ? 'Hide Student Profile Details' : 'Show Full Student Profile' }}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-3 w-3 transform transition-transform duration-200" 
            :class="{ 'rotate-180': showAllDetails }"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Expandable Student Details Panel -->
        <div v-if="showAllDetails" class="space-y-3 pt-3 border-t border-slate-100 mt-2 transition-all">
          <!-- Contact & Social Details -->
          <!-- <div class="space-y-2">
            <h4 class="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600">Contact & Social</h4>
            <div class="grid grid-cols-1 gap-2 text-xs">
              <div v-if="studentInfo.whatsapp">
                <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">WhatsApp</span>
                <span class="font-semibold text-slate-700 block mt-0.5">{{ studentInfo.whatsapp }}</span>
              </div>
              <div v-if="studentInfo.facebook">
                <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Facebook</span>
                <a 
                  :href="studentInfo.facebook.startsWith('http') ? studentInfo.facebook : 'https://' + studentInfo.facebook" 
                  target="_blank" 
                  class="font-bold text-indigo-600 hover:underline block mt-0.5 text-xs truncate"
                >
                  {{ studentInfo.facebook }}
                </a>
              </div>
            </div>
          </div> -->

          <!-- Academic Details -->
          <div class="space-y-2">
            <h4 class="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600">Academic Details</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div v-if="studentInfo.university" class="col-span-2">
                <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">University</span>
                <span class="font-semibold text-slate-700 block mt-0.5">{{ studentInfo.university }}</span>
              </div>
              <div v-if="studentInfo.faculity || studentInfo.faculty" class="col-span-2">
                <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Faculty</span>
                <span class="font-semibold text-slate-700 block mt-0.5">{{ studentInfo.faculity || studentInfo.faculty }}</span>
              </div>
              <div v-if="studentInfo.graduation_year">
                <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Graduation Year</span>
                <span class="font-semibold text-slate-700 block mt-0.5">{{ studentInfo.graduation_year }}</span>
              </div>
            </div>
          </div>

          <!-- Career & Professional Details -->
          <div class="space-y-2" v-if="studentInfo.work_position || studentInfo.company">
            <h4 class="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600">Professional Details</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div v-if="studentInfo.work_position" class="col-span-2">
                <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Job Title</span>
                <span class="font-semibold text-slate-700 block mt-0.5">{{ studentInfo.work_position }}</span>
              </div>
              <div v-if="studentInfo.company" class="col-span-2">
                <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Company</span>
                <span class="font-semibold text-slate-700 block mt-0.5">{{ studentInfo.company }}</span>
              </div>
            </div>
          </div>

          <!-- Personal Details -->
          <div class="space-y-2">
            <h4 class="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600">Personal Details</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div v-if="studentInfo.national_id" class="col-span-2">
                <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">National ID</span>
                <span class="font-semibold text-slate-700 block mt-0.5">{{ studentInfo.national_id }}</span>
              </div>
              <div v-if="studentInfo.gender">
                <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Gender</span>
                <span class="font-semibold text-slate-700 block mt-0.5 capitalize">{{ studentInfo.gender }}</span>
              </div>
              <div v-if="studentInfo.birth_date">
                <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Birth Date</span>
                <span class="font-semibold text-slate-700 block mt-0.5">{{ studentInfo.birth_date }}</span>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="space-y-1" v-if="studentInfo.notes">
            <h4 class="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600">Notes</h4>
            <p class="text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 leading-normal">{{ studentInfo.notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PRICING OPTIONS CARD -->
    <div class="card p-5 bg-white border border-slate-100 shadow-sm">
      <div class="space-y-6">
        <!-- SECTION: PRICING SETTINGS (DYNAMIC BY TYPE) -->
        <div v-if="priceSettingTypes.length > 0" class="space-y-3">
          <h2
            class="text-sm font-bold text-indigo-655 uppercase tracking-wide border-b pb-1 mb-2 flex items-center gap-1.5"
          >
            <span class="p-1 bg-indigo-50 text-indigo-600 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </span>
            Pricing Options
          </h2>

          <div class="grid grid-cols-12 gap-3">
            <div v-for="type in priceSettingTypes" :key="type" class="col-span-12">
              <label
                class="block text-xs font-semibold text-gray-750 dark:text-gray-300 mb-1"
                >{{ type }}</label
              >
              <div class="relative">
                <select
                  class="select-field text-sm font-semibold"
                  :value="modelValue.priceSettings?.[type] || ''"
                  @change="updatePriceSettingField(type, $event.target.value)"
                >
                  <option value="" disabled selected>Select {{ type }}</option>
                  <option v-for="opt in getOptionsForType(type)" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State if no types loaded -->
        <div v-else class="text-center py-6 text-slate-400 italic text-sm">
          Loading price settings options...
        </div>
      </div>
    </div>
  </div>
</template>
