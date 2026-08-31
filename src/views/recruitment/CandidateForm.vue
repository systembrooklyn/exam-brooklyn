<template>
  <div class="space-y-6 animate-fade-in max-w-4xl mx-auto">

    <!-- Header -->
    <div class="flex items-center gap-3">
      <button @click="$router.back()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
        <ArrowLeft class="w-5 h-5 text-gray-500" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit ? 'Edit Candidate Profile' : 'New Candidate Profile' }}
        </h1>
        <p class="text-gray-500 text-sm mt-0.5">
          {{ isEdit ? 'Update info and resume files for this candidate' : 'Register a candidate profile manually' }}
        </p>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSave" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

      <!-- Group 1: Personal Details -->
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2">
        1. Personal Details
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">First Name <span class="text-red-500">*</span></label>
          <input
            v-model="form.firstname"
            type="text"
            required
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Last Name <span class="text-red-500">*</span></label>
          <input
            v-model="form.lastname"
            type="text"
            required
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span class="text-red-500">*</span></label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number <span class="text-red-500">*</span></label>
          <input
            v-model="form.phone"
            type="text"
            required
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Birth Date <span class="text-red-500">*</span></label>
          <input
            v-model="form.birth_date"
            type="date"
            required
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Gender <span class="text-red-500">*</span></label>
          <select
            v-model="form.gender"
            required
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">Select gender...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">City <span class="text-red-500">*</span></label>
          <input
            v-model="form.city"
            type="text"
            required
            placeholder="e.g. Cairo"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Country <span class="text-red-500">*</span></label>
          <input
            v-model="form.country"
            type="text"
            required
            placeholder="e.g. Egypt"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <!-- Group 2: Professional Details -->
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2 pt-4">
        2. Professional Details
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">LinkedIn Profile URL</label>
          <input
            v-model="form.linkedin"
            type="url"
            placeholder="https://linkedin.com/in/username"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Years of Experience</label>
          <input
            v-model.number="form.experience_years"
            type="number"
            min="0"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Current Salary (EGP)</label>
          <input
            v-model.number="form.current_salary"
            type="number"
            min="0"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Expected Salary (EGP)</label>
          <input
            v-model.number="form.expected_salary"
            type="number"
            min="0"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Notice Period</label>
          <input
            v-model="form.notice_period"
            type="text"
            placeholder="e.g. 1 month, Immediate"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Current Company</label>
          <input
            v-model="form.current_company"
            type="text"
            placeholder="Company Name"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Highest Education</label>
          <input
            v-model="form.highest_education"
            type="text"
            placeholder="e.g. Bachelor's Degree in CS"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">English Level</label>
          <input
            v-model="form.english_level"
            type="text"
            placeholder="e.g. Fluent, Intermediate"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <!-- Skills and Languages -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Skills <span class="text-xs text-gray-400">(separated by commas)</span></label>
          <input
            v-model="skillsInput"
            type="text"
            placeholder="e.g. PHP, Laravel, VueJS"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Languages <span class="text-xs text-gray-400">(separated by commas)</span></label>
          <input
            v-model="languagesInput"
            type="text"
            placeholder="e.g. Arabic, English"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <!-- Group 3: File & Notes -->
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2 pt-4">
        3. Resume & Status
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            CV Resume File <span v-if="!isEdit" class="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            @change="onFileSelected"
            :required="!isEdit"
            class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          <p class="text-[10px] text-gray-400 mt-1">PDF, DOC, DOCX files up to 5 MB.</p>
          <div v-if="existingCvUrl && isEdit" class="text-xs text-indigo-600 mt-1 flex items-center gap-1">
            <FileText class="w-3.5 h-3.5" />
            <a :href="existingCvUrl" target="_blank" class="hover:underline">View current CV document</a>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Source</label>
          <input
            v-model="form.source"
            type="text"
            placeholder="e.g. LinkedIn, Job Fair, Website"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
          <select
            v-model="form.status"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            <option value="active">Active</option>
            <option value="blacklisted">Blacklisted</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
        <textarea
          v-model="form.notes"
          rows="3"
          placeholder="Recruiter comments..."
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
        />
      </div>

      <!-- Submit buttons -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          @click="$router.back()"
          class="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="store.submitting"
          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          <span v-if="store.submitting" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          {{ isEdit ? 'Save Profile' : 'Create Profile' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, FileText } from 'lucide-vue-next';
import { useCandidatesStore } from '@/stores/recruitment/candidatesStore';
import notyf from '@/components/global/notyf';

const route = useRoute();
const router = useRouter();
const store = useCandidatesStore();

const isEdit = computed(() => !!route.params.id);

// ── Skills & Languages Inputs ─────────────────────────────────────────────
const skillsInput = ref('');
const languagesInput = ref('');

// ── File Selection ────────────────────────────────────────────────────────
const selectedFile = ref(null);
const existingCvUrl = ref('');

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      notyf.error('CV file size exceeds 5MB limit.');
      event.target.value = null;
      selectedFile.value = null;
      return;
    }
    selectedFile.value = file;
  }
};

// ── Form State ────────────────────────────────────────────────────────────
const form = reactive({
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  birth_date: '',
  gender: '',
  city: '',
  country: '',
  linkedin: '',
  experience_years: '',
  current_salary: '',
  expected_salary: '',
  notice_period: '',
  current_company: '',
  highest_education: '',
  english_level: '',
  source: '',
  notes: '',
  status: 'active',
});

// ── Save Action ───────────────────────────────────────────────────────────
const handleSave = async () => {
  // Construct FormData
  const payload = new FormData();
  
  // Append all text inputs
  Object.keys(form).forEach(key => {
    if (form[key] != null && form[key] !== '') {
      payload.append(key, form[key]);
    }
  });

  // Append arrays
  const skills = skillsInput.value.split(',').map(s => s.trim()).filter(Boolean);
  if (skills.length) {
    skills.forEach(s => payload.append('skills[]', s));
  }

  const languages = languagesInput.value.split(',').map(l => l.trim()).filter(Boolean);
  if (languages.length) {
    languages.forEach(l => payload.append('languages[]', l));
  }

  // Append file
  if (selectedFile.value) {
    payload.append('cv_file', selectedFile.value);
  }

  if (isEdit.value) {
    await store.updateCandidate(route.params.id, payload);
  } else {
    await store.createCandidate(payload);
  }

  router.push({ name: 'recruitment-candidates' });
};

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  if (isEdit.value) {
    const cand = await store.fetchCandidate(route.params.id);
    if (cand) {
      Object.assign(form, {
        firstname: cand.firstname || '',
        lastname: cand.lastname || '',
        email: cand.email || '',
        phone: cand.phone || '',
        birth_date: cand.birth_date || '',
        gender: cand.gender || '',
        city: cand.city || '',
        country: cand.country || '',
        linkedin: cand.linkedin || '',
        experience_years: cand.experience_years ?? '',
        current_salary: cand.current_salary ?? '',
        expected_salary: cand.expected_salary ?? '',
        notice_period: cand.notice_period || '',
        current_company: cand.current_company || '',
        highest_education: cand.highest_education || '',
        english_level: cand.english_level || '',
        source: cand.source || '',
        notes: cand.notes || '',
        status: cand.status || 'active',
      });

      // Populate text comma inputs
      if (Array.isArray(cand.skills)) {
        skillsInput.value = cand.skills.join(', ');
      }
      if (Array.isArray(cand.languages)) {
        languagesInput.value = cand.languages.join(', ');
      }

      existingCvUrl.value = cand.cv_file || '';
    }
  }
});
</script>
