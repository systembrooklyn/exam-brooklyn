<template>
  <div class="w-full">
    <div class="flex flex-col lg:flex-row gap-5">
       <!-- LEFT: Selected Student Display -->
      <div class="w-full lg:w-3/5 border-r pr-0 lg:pr-5 border-slate-100">
        <h3 class="font-bold text-lg text-indigo-900 mb-3 pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          Selected Student Information
        </h3>
        
        <div v-if="selectedStudents.length > 0" class="bg-gradient-to-br from-slate-50 to-indigo-50/20 border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 mb-4">
            <!-- Profile Image -->
            <div class="w-18 h-18 rounded-2xl shadow-md border-2 border-white ring-4 ring-indigo-50/50 bg-indigo-100 flex items-center justify-center text-indigo-500 overflow-hidden shrink-0">
              <img 
                v-if="selectedStudents[0].student?.ppUrl && !imageError"
                :src="selectedStudents[0].student.ppUrl" 
                class="w-full h-full object-cover" 
                alt="Student Avatar" 
                @error="imageError = true"
              />
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
            
            <div class="text-center sm:text-left flex-1">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 mb-1.5">
                {{ selectedStudents[0].status?.label || 'Waiting List' }}
              </span>
              <h4 class="font-extrabold text-xl text-slate-800 leading-tight">{{ selectedStudents[0].student?.name }}</h4>
              <p class="text-slate-500 text-xs mt-0.5">{{ selectedStudents[0].student?.email }}</p>
              <p class="text-slate-400 text-[10px] mt-1">
                Student No: <span class="font-semibold text-slate-600">{{ selectedStudents[0].student?.st_num || 'Not Set Yet' }}</span>
              </p>
            </div>
          </div>

          <!-- Quick Details Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-5 border-t border-slate-100 pt-3.5">
            <div>
              <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Phones</p>
              <p class="text-slate-700 font-semibold text-xs mt-0.5">
                {{ selectedStudents[0].student?.phones?.join(', ') || 'N/A' }}
              </p>
            </div>

            <div>
              <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Scholarship</p>
              <p class="text-slate-700 font-semibold text-xs mt-0.5">
                {{ selectedStudents[0].student?.scholarship?.name || 'N/A' }}
                <span class="text-[10px] text-slate-400" v-if="selectedStudents[0].student?.scholarship?.study_type">
                  ({{ selectedStudents[0].student?.scholarship?.study_type }})
                </span>
              </p>
            </div>

            <div>
              <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Grade & Career</p>
              <p class="text-slate-700 font-semibold text-xs mt-0.5">
                {{ selectedStudents[0].student?.grade || 'N/A' }} <span class="text-slate-300 mx-1">|</span> {{ selectedStudents[0].student?.careerType || 'N/A' }}
              </p>
            </div>

            <div>
              <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Faculty & Major</p>
              <p class="text-slate-700 font-semibold text-xs mt-0.5">
                {{ selectedStudents[0].student?.faculity || 'N/A' }} <span class="text-slate-300 mx-1">|</span> {{ selectedStudents[0].student?.major || 'N/A' }}
              </p>
            </div>

            <div>
              <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Branch & Code</p>
              <p class="text-slate-700 font-semibold text-xs mt-0.5 flex items-center gap-1">
                {{ selectedStudents[0].branch?.name || 'N/A' }} 
                <span class="text-[9px] text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-bold" v-if="selectedStudents[0].student?.marketing_code">
                  {{ selectedStudents[0].student?.marketing_code }}
                </span>
              </p>
            </div>

            <div>
              <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Registered By</p>
              <p class="text-slate-700 font-semibold text-xs mt-0.5">
                {{ selectedStudents[0].registered_by?.name || 'N/A' }}
              </p>
            </div>

            <div class="sm:col-span-2 bg-white/60 p-2.5 rounded-lg border border-slate-100 mt-1">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Reserved By</p>
                  <p class="text-slate-600 font-medium text-[11px] mt-0.5">
                    {{ selectedStudents[0].reserved_by?.name || 'N/A' }}
                  </p>
                </div>
                <div>
                  <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Called By</p>
                  <p class="text-slate-600 font-medium text-[11px] mt-0.5">
                    {{ selectedStudents[0].called_by?.name || 'N/A' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="h-48 flex flex-col items-center justify-center text-slate-400 italic bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-slate-300 mb-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="text-sm">No Student Selected</span>
          <span class="text-[11px] text-slate-400 not-italic mt-0.5">Select a student from the dropdown to continue</span>
        </div>
      </div>
      
      <!-- RIGHT: Inputs & Controls -->
      <div class="w-full lg:w-2/5 flex flex-col justify-between">
        <!-- Student Dropdown -->
        <div>
          <h3 class="font-bold text-lg text-indigo-900 mb-3 pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
            </svg>
            Select Action
          </h3>
          <div class="mb-3">
            <label class="block mb-1 font-semibold text-slate-700 text-xs">Add Student To Handle</label>
            <multiselect
              v-model="selectedStudentVal"
              :options="studentOptions"
              :searchable="true"
              :loading="loading"
              :close-on-select="true"
              :show-labels="false"
              placeholder="Select Student to Add"
              label="displayName"
              track-by="id"
            >
              <template #noResult>No students found</template>
            </multiselect>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-2.5 mt-4">
          <button
            @click="handleScholarship"
            class="group flex items-center justify-between gap-1.5 px-4.5 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none text-sm"
            :disabled="selectedStudents.length === 0"
          >
            <span class="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Scholarship Handle
            </span>
            <span class="bg-white text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded group-hover:scale-105 transition-transform">GO</span>
          </button>

          <button
            @click="handleOther"
            class="group flex items-center justify-between gap-1.5 px-4.5 py-3 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-700 active:bg-rose-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none text-sm"
            :disabled="selectedStudents.length === 0"
          >
            <span class="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Other Handle
            </span>
            <span class="bg-white text-rose-600 text-[10px] font-black px-2 py-0.5 rounded group-hover:scale-105 transition-transform">GO</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";

const props = defineProps({
  selectedStudents: {
    type: Array,
    default: () => []
  },
  students: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();

const imageError = ref(false);

watch(() => props.selectedStudents, () => {
  imageError.value = false;
}, { deep: true });

const emit = defineEmits(["studentChanged"]);

// Computed list of options with names and statuses
const studentOptions = computed(() => {
  return props.students.map(res => {
    return {
      ...res,
      displayName: `${res.student?.name || 'N/A'} (${res.status?.label || 'Waiting'})`
    };
  });
});

// Computed v-model binding for single-select dropdown object
const selectedStudentVal = computed({
  get: () => studentOptions.value.find(s => s.id === (props.selectedStudents[0]?.id)) || null,
  set: (val) => {
    if (val) {
      emit("studentChanged", val);
    }
  }
});

const handleScholarship = () => {
  if (props.selectedStudents.length === 0) return;
  sessionStorage.setItem("selectedReservation", JSON.stringify(props.selectedStudents[0]));
  router.push({ name: "waiting-list-table", query: { handleType: "scholarship" } });
};

const handleOther = () => {
  if (props.selectedStudents.length === 0) return;
  sessionStorage.setItem("selectedReservation", JSON.stringify(props.selectedStudents[0]));
  router.push({ name: "waiting-list-table", query: { handleType: "other" } });
};
</script>

