<script setup>
import { computed, ref, onMounted } from "vue";
import { usePriceSettingsStore } from "@/stores/priceSettingsStore";
import { useScholarshipStore } from "@/stores/scholarships.js";

const props = defineProps({
  modelValue: Object,
  studentInfo: Object
});
const emit = defineEmits(["update:modelValue", "save-student", "refresh-data"]);

const isEditing = ref(false);
const editableStudent = ref({});

const toggleEditMode = () => {
  if (isEditing.value) {
    isEditing.value = false;
  } else {
    editableStudent.value = {
      name: props.studentInfo.name || "",
      email: props.studentInfo.email || "",
      phones: Array.isArray(props.studentInfo.phones) ? props.studentInfo.phones.join(", ") : (props.studentInfo.phones || ""),
      scholarship: props.studentInfo.scholarship?.id || props.studentInfo.scholarship || "",
      ID_number: props.studentInfo.ID_number || props.studentInfo.national_id || "",
      grade: props.studentInfo.grade || "",
      birth_date: props.studentInfo.birth_date || "",
      nationality: props.studentInfo.nationality || "",
      governorate: props.studentInfo.governorate || "",
      company: props.studentInfo.company || "",
      careerType: props.studentInfo.careerType || "",
      faculity: props.studentInfo.faculity || props.studentInfo.faculty || "",
      major: props.studentInfo.major || props.studentInfo.majorx || ""
    };
    isEditing.value = true;
  }
};

const saveStudentInfo = () => {
  emit("save-student", { ...editableStudent.value });
  isEditing.value = false;
};

const updateField = (key, value) => {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
};

const ppError = ref(false);
const showAllDetails = ref(false);

const scholarshipStore = useScholarshipStore();
onMounted(() => {
  scholarshipStore.fetchScholarships();
});

const priceSettingsStore = usePriceSettingsStore();

const allSettings = computed(() => priceSettingsStore.priceSettings || []);

// Extract unique active price settings types
const priceSettingTypes = computed(() => {
  const activeTypes = allSettings.value
    .filter(ps => ps.is_active !== false && ps.type !== 'Grade' && ps.type !== 'Sub Payment Method')
    .map(ps => ps.type);
  return [...new Set(activeTypes)];
});

// Dynamic cascade filter for each option type
const getOptionsForType = (type) => {
  let settings = allSettings.value.filter(ps => ps.type === type && ps.is_active !== false);

  // Cascade filter: only show settings where parent ID is selected or no parent constraints exist
  settings = settings.filter(ps => {
    const pids = ps.parent_ids || ps.parent_id || (ps.parents ? ps.parents.map(p => p.id) : []);
    if (pids.length === 0) return true;

    // Check if at least one parent's ID is active in the form selections
    return pids.some(pid => {
      const parentSetting = allSettings.value.find(x => x.id === pid);
      if (!parentSetting) return false;
      const selectedValueForParentType = props.modelValue?.priceSettings?.[parentSetting.type];
      if (Array.isArray(selectedValueForParentType)) {
        return selectedValueForParentType.includes(parentSetting.name);
      }
      return selectedValueForParentType === parentSetting.name;
    });
  });

  const base = settings.map(ps => ps.name);
  const current = props.modelValue?.priceSettings?.[type];
  
  const isValidCurrent = (cName) => {
    const psObj = allSettings.value.find(x => x.type === type && x.name === cName);
    if (!psObj) return true; // If we can't find it, keep it (might be a deleted setting that is currently selected)
    const pids = psObj.parent_ids || psObj.parent_id || (psObj.parents ? psObj.parents.map(p => p.id) : []);
    if (pids.length === 0) return true;
    return pids.some(pid => {
      const parentObj = allSettings.value.find(x => x.id === pid);
      if (!parentObj) return false;
      const parentVal = props.modelValue?.priceSettings?.[parentObj.type];
      if (Array.isArray(parentVal)) return parentVal.includes(parentObj.name);
      return parentVal === parentObj.name;
    });
  };

  if (current) {
    if (Array.isArray(current)) {
      current.forEach(c => {
        if (!base.includes(c) && isValidCurrent(c)) {
          base.unshift(c);
        }
      });
    } else {
      if (!base.includes(current) && isValidCurrent(current)) {
        base.unshift(current);
      }
    }
  }
  return base;
};

// Handle toggling multiple options for list types (e.g. Paper)
const toggleOption = (opt, type) => {
  const currentOptions = Array.isArray(props.modelValue.priceSettings?.[type])
    ? [...props.modelValue.priceSettings[type]]
    : (props.modelValue.priceSettings?.[type] ? [props.modelValue.priceSettings[type]] : []);

  const index = currentOptions.indexOf(opt);
  if (index > -1) {
    currentOptions.splice(index, 1);
  } else {
    currentOptions.push(opt);
  }

  updatePriceSettingField(type, currentOptions);
};

// Automatically pre-select all Fees options so they are applied
import { watch } from "vue";
watch(
  () => {
    // If Fees type is active, return its exact dynamic options
    if (priceSettingTypes.value.includes("Fees")) {
      return getOptionsForType("Fees");
    }
    return null;
  },
  (feesOptions) => {
    if (feesOptions !== null) {
      let currentVal = props.modelValue.priceSettings?.["Fees"];
      let currentFees = [];
      if (currentVal) {
        currentFees = Array.isArray(currentVal) ? currentVal : [currentVal];
      }
      const missing = feesOptions.filter(f => !currentFees.includes(f));
      const extra = currentFees.filter(f => !feesOptions.includes(f));
      if (missing.length > 0 || extra.length > 0) {
        // Avoid mutating props directly, emit the update
        // Sync Fees exactly to the valid feesOptions
        emit("update:modelValue", {
          ...props.modelValue,
          priceSettings: {
            ...props.modelValue.priceSettings,
            "Fees": feesOptions
          }
        });
      }
    }
  },
  { immediate: true, deep: true }
);

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
    <div v-if="studentInfo" class="card p-4.5 bg-white border border-slate-100 shadow-sm relative">
      <!-- Actions container -->
      <div class="absolute top-4 right-4 flex items-center gap-2 z-10">
        <!-- Edit toggle button -->
        <button type="button" @click="toggleEditMode"
          class="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span>{{ isEditing ? 'Cancel' : 'Edit Info' }}</span>
        </button>
      </div>

      <!-- READ-ONLY MODE -->
      <div v-if="!isEditing">
        <div class="flex flex-col items-center text-center pb-3 border-b border-slate-100 mb-3.5">
          <!-- Avatar -->
          <div
            class="w-18 h-18 rounded-full shadow-md border-2 border-white ring-4 ring-indigo-50/50 bg-indigo-50 flex items-center justify-center text-indigo-500 overflow-hidden shrink-0 mb-3">
            <img v-if="studentInfo.ppUrl && !ppError" :src="studentInfo.ppUrl" class="w-full h-full object-cover"
              alt="Student Avatar" @error="ppError = true" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 text-indigo-400" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>

          <h3 class="font-extrabold text-slate-800 text-base leading-tight">{{ studentInfo.name }}</h3>
          <p class="text-xs text-slate-400 mt-0.5">{{ studentInfo.email }}</p>
          <span
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 mt-2.5 border border-indigo-100/50">
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
              <span class="font-semibold text-slate-700 mt-0.5 block">{{ studentInfo.major || studentInfo.majorx ||
                'N/A' }}</span>
            </div>
          </div>

          <!-- Scholarship details -->
          <div v-if="studentInfo.scholarship" class="bg-indigo-50/20 p-2.5 rounded-xl border border-indigo-100/30">
            <span class="block text-[9px] font-extrabold uppercase tracking-wider text-indigo-700">Scholarship
              Program</span>
            <span class="font-bold text-slate-800 text-xs mt-1 block leading-tight">{{ studentInfo.scholarship.name
              }}</span>
            <div class="flex justify-between items-center mt-2 pt-1.5 border-t border-indigo-100/30 text-[10px]">
              <span class="text-slate-400">Base Price:</span>
              <span class="font-extrabold text-indigo-900">{{ studentInfo.scholarship.price?.toLocaleString() }}
                EGP</span>
            </div>
          </div>

          <!-- Toggle More Details Button -->
          <button type="button" @click="showAllDetails = !showAllDetails"
            class="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition mt-1">
            <span>{{ showAllDetails ? 'Hide Student Profile Details' : 'Show Full Student Profile' }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 transform transition-transform duration-200"
              :class="{ 'rotate-180': showAllDetails }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Expandable Student Details Panel -->
          <div v-if="showAllDetails" class="space-y-3 pt-3 border-t border-slate-100 mt-2 transition-all">
            <!-- Academic Details -->
            <div class="space-y-2">
              <h4 class="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600">Academic Details</h4>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div v-if="studentInfo.university" class="col-span-2">
                  <span
                    class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">University</span>
                  <span class="font-semibold text-slate-700 block mt-0.5">{{ studentInfo.university }}</span>
                </div>
                <div v-if="studentInfo.faculity || studentInfo.faculty" class="col-span-2">
                  <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Faculty</span>
                  <span class="font-semibold text-slate-700 block mt-0.5">{{ studentInfo.faculity || studentInfo.faculty
                    }}</span>
                </div>
                <div v-if="studentInfo.graduation_year">
                  <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Graduation
                    Year</span>
                  <span class="font-semibold text-slate-700 block mt-0.5">{{ studentInfo.graduation_year }}</span>
                </div>
              </div>
            </div>

            <!-- Professional Details -->
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
                <div v-if="studentInfo.national_id || studentInfo.ID_number" class="col-span-2">
                  <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">National
                    ID</span>
                  <span class="font-semibold text-slate-700 block mt-0.5">{{ studentInfo.national_id ||
                    studentInfo.ID_number }}</span>
                </div>
                <div v-if="studentInfo.gender">
                  <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Gender</span>
                  <span class="font-semibold text-slate-700 block mt-0.5 capitalize">{{ studentInfo.gender }}</span>
                </div>
                <div v-if="studentInfo.birth_date">
                  <span class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Birth
                    Date</span>
                  <span class="font-semibold text-slate-700 block mt-0.5">{{ studentInfo.birth_date }}</span>
                </div>
                <div v-if="studentInfo.governorate">
                  <span
                    class="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Governorate</span>
                  <span class="font-semibold text-slate-700 block mt-0.5">{{ studentInfo.governorate }}</span>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="space-y-1" v-if="studentInfo.notes">
              <h4 class="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600">Notes</h4>
              <p
                class="text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 leading-normal">
                {{ studentInfo.notes }}</p>
            </div>
          </div>
        </div>
      </div>

    <!-- EDIT MODE FORM -->
    <div v-else class="space-y-3 pt-7 pb-3 text-xs">
      <h4 class="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 mb-2 border-b pb-1">Edit Student
        Profile</h4>

      <div class="space-y-2.5">
        <div>
          <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Full Name</label>
          <input type="text" v-model="editableStudent.name"
            class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-750 bg-slate-50/50" />
        </div>

        <div>
          <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Email</label>
          <input type="email" v-model="editableStudent.email"
            class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-750 bg-slate-50/50" />
        </div>

        <div>
          <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Phones (comma separated)</label>
          <input type="text" v-model="editableStudent.phones"
            class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-750 bg-slate-50/50" />
        </div>

        <div>
          <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Scholarship Program</label>
          <select v-model="editableStudent.scholarship"
            class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-750 bg-slate-50/50">
            <option disabled value="">Select Scholarship</option>
            <option v-for="scholarship in scholarshipStore.scholarships" :key="scholarship.id" :value="scholarship.id">
              {{ scholarship.name }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Grade</label>
            <select v-model="editableStudent.grade"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-750 bg-slate-50/50">
              <option disabled value="">Select Grade</option>
              <option>Pass</option>
              <option>Good</option>
              <option>V.Good</option>
              <option>Excellent</option>
              <option>5 Years Ex</option>
              <option>>45</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Nationality</label>
            <select v-model="editableStudent.nationality"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-750 bg-slate-50/50">
              <option disabled value="">Select Nationality</option>
              <option value="Egyptian">Egyptian</option>
              <option value="Sudanese">Sudanese</option>
              <option value="KSA">KSA</option>
              <option value="UAE">UAE</option>
              <option value="Bahrain">Bahrain</option>
              <option value="Syrian">Syrian</option>
              <option value="Iraq">Iraq</option>
              <option value="Palestinian">Palestinian</option>
              <option value="Yemeni">Yemeni</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Career</label>
            <select v-model="editableStudent.careerType"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-750 bg-slate-50/50">
              <option disabled value="">Select Career Type</option>
              <option value="Engineer">Engineer</option>
              <option value="healthcare">Healthcare</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Science graduates">Science graduates</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Major</label>
            <input type="text" v-model="editableStudent.major"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-750 bg-slate-50/50" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Faculty</label>
            <input type="text" v-model="editableStudent.faculity"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-750 bg-slate-50/50" />
          </div>
          <div>
            <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Company</label>
            <input type="text" v-model="editableStudent.company"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-750 bg-slate-50/50" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Birth Date</label>
            <input type="date" v-model="editableStudent.birth_date"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-750 bg-slate-50/50" />
          </div>
          <div>
            <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">National ID</label>
            <input type="text" v-model="editableStudent.ID_number"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-750 bg-slate-50/50" />
          </div>
        </div>

        <div v-if="editableStudent.nationality === 'Egyptian'">
          <label class="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Governorate</label>
          <select v-model="editableStudent.governorate"
            class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-slate-750 bg-slate-50/50">
            <option disabled value="">Select Governorate</option>
            <option value="Cairo">Cairo</option>
            <option value="Giza">Giza</option>
            <option value="Alexandria">Alexandria</option>
            <option value="Dakahlia">Dakahlia</option>
            <option value="Red Sea">Red Sea</option>
            <option value="Beheira">Beheira</option>
            <option value="Fayoum">Fayoum</option>
            <option value="Gharbia">Gharbia</option>
            <option value="Ismailia">Ismailia</option>
            <option value="Menoufia">Menoufia</option>
            <option value="Minya">Minya</option>
            <option value="Qalyubia">Qalyubia</option>
            <option value="New Valley">New Valley</option>
            <option value="Suez">Suez</option>
            <option value="Aswan">Aswan</option>
            <option value="Assiut">Assiut</option>
            <option value="Beni Suef">Beni Suef</option>
            <option value="Port Said">Port Said</option>
            <option value="Damietta">Damietta</option>
            <option value="Sharqia">Sharqia</option>
            <option value="South Sinai">South Sinai</option>
            <option value="Kafr El Sheikh">Kafr El Sheikh</option>
            <option value="Matrouh">Matrouh</option>
            <option value="Luxor">Luxor</option>
            <option value="Qena">Qena</option>
            <option value="North Sinai">North Sinai</option>
            <option value="Sohag">Sohag</option>
          </select>
        </div>
      </div>

      <div class="flex gap-2 pt-3 mt-3 border-t">
        <button type="button" @click="saveStudentInfo"
          class="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-sm text-center">
          Save Info
        </button>
        <button type="button" @click="toggleEditMode"
          class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition text-center">
          Cancel
        </button>
      </div>
    </div>
  </div>

  <!-- PRICING OPTIONS CARD -->
  <div class="card p-5 bg-white border border-slate-100 shadow-sm">
    <div class="space-y-6">
      <!-- SECTION: PRICING SETTINGS (DYNAMIC BY TYPE) -->
      <div v-if="priceSettingTypes.length > 0" class="space-y-3">
        <h2
          class="text-sm font-bold text-indigo-655 uppercase tracking-wide border-b pb-1 mb-2 flex items-center gap-1.5">
          <span class="p-1 bg-indigo-50 text-indigo-600 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </span>
          Pricing Options
        </h2>

        <div class="grid grid-cols-12 gap-3">
          <div v-for="type in priceSettingTypes" :key="type" class="col-span-12">
            <label class="block text-xs font-semibold text-gray-750 dark:text-gray-300 mb-1">{{ type }}</label>

            <!-- Multi-select checkable list for Paper and Fees -->
            <div v-if="type === 'Paper' || type === 'Fees'"
              class="space-y-1 bg-slate-50/50 p-2 rounded-xl border border-slate-100/60 max-h-36 overflow-y-auto">
              <label v-for="opt in getOptionsForType(type)" :key="opt"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-transparent transition cursor-pointer select-none"
                :class="{
                  'hover:bg-white hover:border-slate-100': type !== 'Fees',
                  'opacity-80 cursor-not-allowed': type === 'Fees'
                }">
                <input type="checkbox" 
                  :checked="type === 'Fees' || props.modelValue.priceSettings?.[type]?.includes(opt)"
                  :disabled="type === 'Fees'"
                  @change="type !== 'Fees' && toggleOption(opt, type)"
                  class="rounded focus:ring-indigo-500 w-3.5 h-3.5"
                  :class="{
                     'text-indigo-600 border-slate-300': type !== 'Fees',
                     'text-indigo-400 bg-indigo-50 border-indigo-200': type === 'Fees'
                  }" />
                <span class="text-xs font-bold leading-none"
                      :class="type === 'Fees' ? 'text-indigo-600' : 'text-slate-700'">
                  {{ opt }}
                </span>
              </label>
              <div v-if="getOptionsForType(type).length === 0" class="text-xs text-slate-400 italic py-1 text-center">
                No options available
              </div>
            </div>

            <!-- Standard Dropdown for other types -->
            <div v-else class="relative">
              <select class="select-field text-sm font-semibold" :value="modelValue.priceSettings?.[type] || ''"
                @change="updatePriceSettingField(type, $event.target.value)">
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
