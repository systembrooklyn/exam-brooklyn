<template>
  <HrModal
    :show="show"
    :title="isUpdate ? 'Update Position Requirements' : 'Add Position Requirements'"
    :loading="saving"
    @close="closeModal"
    @save="handleSave"
  >
    <div class="space-y-6">
      <div v-if="loading" class="flex justify-center p-6">
        <Loader2 class="w-8 h-8 animate-spin text-indigo-600" />
      </div>
      
      <div v-else class="space-y-6">
        <!-- Basic Info -->
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Basic Info
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select v-model="form.gender" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white">
                <option value="both">Both</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select v-model="form.job_type" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white">
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Qualifications -->
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            Qualifications & Experience
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
              <input v-model="form.education_level" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. Bachelor's Degree" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">English Level</label>
              <input v-model="form.english_level" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. Fluent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Min Experience (Years)</label>
              <input v-model="form.experience_min" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="0" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Max Experience (Years)</label>
              <input v-model="form.experience_max" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="10" />
            </div>
          </div>
        </div>

        <!-- Compensation & Demographics -->
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Compensation & Demographics
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
              <input v-model="form.salary_min" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. 5000" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
              <input v-model="form.salary_max" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. 15000" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
              <input v-model="form.age_min" type="number" min="18" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="18" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Max Age</label>
              <input v-model="form.age_max" type="number" min="18" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="60" />
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Additional Details
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Shifts</label>
              <MultiSelect
                v-model="form.shift_ids"
                :options="shiftOptions"
                labelKey="shift_name"
                subLabelKey="timing"
                valueKey="id"
                placeholder="Select Shifts"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
              <div class="w-full border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all bg-white flex flex-wrap gap-2 min-h-[46px]">
                <span v-for="(kw, idx) in form.keywords" :key="idx" class="bg-indigo-50 text-indigo-700 text-sm py-1 px-2.5 rounded-full inline-flex items-center gap-1 border border-indigo-100">
                  {{ kw }}
                  <button type="button" @click="removeKeyword(idx)" class="hover:text-indigo-900 focus:outline-none">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </span>
                <input 
                  v-model="keywordInput" 
                  @keydown.enter.prevent="addKeyword" 
                  @keydown.comma.prevent="addKeyword" 
                  type="text" 
                  class="flex-1 min-w-[120px] outline-none bg-transparent" 
                  placeholder="Type keyword and press Enter..." 
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </HrModal>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import HrModal from '@/components/hr-dashboard/HrModal.vue';
import MultiSelect from '@/components/global/MultiSelect.vue';
import { Loader2 } from 'lucide-vue-next';
import { useHrPositionRequirementsStore } from '@/stores/hr/positionRequirements';
import { useHrShiftsStore } from '@/stores/hr/shifts';
import notyf from '@/components/global/notyf';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  positionId: {
    type: [Number, String],
    default: null
  }
});

const emit = defineEmits(['close']);

const requirementsStore = useHrPositionRequirementsStore();
const shiftsStore = useHrShiftsStore();

const loading = ref(false);
const saving = ref(false);
const isUpdate = ref(false);
const requirementId = ref(null);
const keywordInput = ref('');

const form = ref({
  gender: 'both',
  job_type: 'full_time',
  education_level: '',
  english_level: '',
  salary_min: null,
  salary_max: null,
  age_min: null,
  age_max: null,
  experience_min: null,
  experience_max: null,
  keywords: [],
  shift_ids: []
});

const shiftOptions = computed(() => {
  return shiftsStore.shifts.map(s => {
    const start = s.start_time ? s.start_time.slice(0, 5) : '';
    const end = s.end_time ? s.end_time.slice(0, 5) : '';
    return {
      id: s.id,
      shift_name: s.shift_name || s.name || `Shift ${s.id}`,
      timing: start && end ? `${start} - ${end}` : ''
    };
  });
});

const resetForm = () => {
  form.value = {
    gender: 'both',
    job_type: 'full_time',
    education_level: '',
    english_level: '',
    salary_min: null,
    salary_max: null,
    age_min: null,
    age_max: null,
    experience_min: null,
    experience_max: null,
    keywords: [],
    shift_ids: []
  };
  keywordInput.value = '';
  isUpdate.value = false;
  requirementId.value = null;
};

const loadRequirement = async () => {
  if (!props.positionId) return;
  loading.value = true;
  try {
    const res = await requirementsStore.getRequirements(props.positionId);
    const existing = res.data && res.data.length > 0 ? res.data[0] : null;
    
    if (existing) {
      isUpdate.value = true;
      requirementId.value = existing.id;
      
      let parsedKeywords = [];
      if (Array.isArray(existing.keywords)) {
        parsedKeywords = [...existing.keywords];
      } else if (typeof existing.keywords === 'string') {
        try {
          parsedKeywords = JSON.parse(existing.keywords);
        } catch (e) {
          parsedKeywords = existing.keywords.split(',').map(k => k.trim()).filter(Boolean);
        }
      }

      form.value = {
        gender: existing.gender || 'both',
        job_type: existing.job_type || 'full_time',
        education_level: existing.education_level || '',
        english_level: existing.english_level || '',
        salary_min: existing.salary_min,
        salary_max: existing.salary_max,
        age_min: existing.age_min,
        age_max: existing.age_max,
        experience_min: existing.experience_min,
        experience_max: existing.experience_max,
        keywords: parsedKeywords,
        shift_ids: Array.isArray(existing.shifts) ? existing.shifts.map(s => s.id || s) : (existing.shift_ids || [])
      };
    } else {
      resetForm();
    }
  } catch (error) {
    console.error('Failed to load position requirements', error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (shiftsStore.shifts.length === 0) {
    await shiftsStore.getShifts();
  }
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    loadRequirement();
  } else {
    resetForm();
  }
});

const addKeyword = () => {
  const kw = keywordInput.value.trim();
  if (kw && !form.value.keywords.includes(kw)) {
    form.value.keywords.push(kw);
  }
  keywordInput.value = '';
};

const removeKeyword = (idx) => {
  form.value.keywords.splice(idx, 1);
};

const closeModal = () => {
  emit('close');
};

const handleSave = async () => {
  if (keywordInput.value.trim()) {
    addKeyword();
  }
  
  const payload = {
    position_id: Number(props.positionId),
    gender: form.value.gender,
    job_type: form.value.job_type,
    education_level: form.value.education_level || undefined,
    english_level: form.value.english_level || undefined,
    salary_min: form.value.salary_min ? Number(form.value.salary_min) : undefined,
    salary_max: form.value.salary_max ? Number(form.value.salary_max) : undefined,
    age_min: form.value.age_min ? Number(form.value.age_min) : undefined,
    age_max: form.value.age_max ? Number(form.value.age_max) : undefined,
    experience_min: form.value.experience_min ? Number(form.value.experience_min) : undefined,
    experience_max: form.value.experience_max ? Number(form.value.experience_max) : undefined,
    keywords: form.value.keywords.length > 0 ? form.value.keywords : undefined,
    shift_ids: form.value.shift_ids.length > 0 ? form.value.shift_ids : undefined,
  };

  saving.value = true;
  try {
    if (isUpdate.value && requirementId.value) {
      await requirementsStore.updateRequirement(requirementId.value, payload);
    } else {
      await requirementsStore.createRequirement(payload);
    }
    closeModal();
  } catch (error) {
    console.error('Failed to save requirements:', error);
  } finally {
    saving.value = false;
  }
};
</script>
