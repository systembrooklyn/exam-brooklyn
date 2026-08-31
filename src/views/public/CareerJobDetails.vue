<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans" v-if="job">
    <!-- Navbar -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button @click="$router.push({ name: 'public-careers' })" class="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer mr-2">
            <ArrowLeft class="w-5 h-5 text-gray-500" />
          </button>
          <span class="p-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center">B</span>
          <span class="font-bold text-lg text-gray-900">Brooklyn Careers</span>
        </div>
        <router-link to="/" class="text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors">
          Portal Login
        </router-link>
      </div>
    </header>

    <!-- Main Content Grid -->
    <main class="flex-1 max-w-5xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Column: Job Description details -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div class="space-y-3">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 capitalize border border-indigo-100/50">
              {{ formatLabel(job.employment_type) }}
            </span>
            <h1 class="text-3xl font-extrabold text-gray-900 leading-tight">{{ job.title }}</h1>
            <p class="text-sm text-gray-400 flex items-center gap-1.5 pt-1">
              <MapPin class="w-4 h-4 text-gray-300" />
              {{ job.location || 'Remote' }}
              &nbsp;·&nbsp;
              <Calendar class="w-4 h-4 text-gray-300" />
              Deadline: {{ job.deadline ? formatDate(job.deadline) : 'No Deadline' }}
            </p>
          </div>

          <div class="border-t border-gray-50 pt-6 space-y-4">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider">Job Description</h3>
            <div class="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
              {{ job.description || 'No description provided.' }}
            </div>
          </div>

          <div class="border-t border-gray-50 pt-6 space-y-4" v-if="job.requirements_snapshot && job.requirements_snapshot.length">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider">Requirements</h3>
            <ul class="list-disc pl-5 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li v-for="(req, idx) in job.requirements_snapshot" :key="idx">{{ req }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Right Column: Form Submission -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 sticky top-24">
          <h3 class="font-extrabold text-gray-900 text-lg flex items-center gap-2 border-b border-gray-50 pb-3">
            <FileEdit class="w-5 h-5 text-indigo-500" />
            Apply For This Position
          </h3>

          <form @submit.prevent="handleSubmit" class="space-y-4 text-xs">
            <!-- First Name -->
            <div>
              <label class="block font-bold text-gray-500 uppercase mb-1">First Name *</label>
              <input
                v-model="form.firstname"
                required
                type="text"
                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <!-- Last Name -->
            <div>
              <label class="block font-bold text-gray-500 uppercase mb-1">Last Name *</label>
              <input
                v-model="form.lastname"
                required
                type="text"
                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block font-bold text-gray-500 uppercase mb-1">Email Address *</label>
              <input
                v-model="form.email"
                required
                type="email"
                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block font-bold text-gray-500 uppercase mb-1">Phone Number *</label>
              <input
                v-model="form.phone"
                required
                type="tel"
                placeholder="+20..."
                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <!-- CV Upload -->
            <div>
              <label class="block font-bold text-gray-500 uppercase mb-1">Upload CV / Resume (PDF/DOC) *</label>
              <input
                type="file"
                required
                @change="handleFileUpload"
                accept=".pdf,.doc,.docx"
                class="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <span class="text-[10px] text-gray-400 block mt-1">Maximum size 5 MB</span>
            </div>

            <!-- Optional parameters toggler -->
            <button
              type="button"
              @click="showOptionalFields = !showOptionalFields"
              class="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 py-1.5 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
            >
              <span>{{ showOptionalFields ? 'Hide optional details' : 'Add optional details (Salary, LinkedIn...)' }}</span>
              <ChevronDown class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-180': showOptionalFields }" />
            </button>

            <!-- Optional Fields Container -->
            <div v-show="showOptionalFields" class="space-y-4 pt-2 border-t border-gray-50 animate-fade-in">
              <!-- Birth Date -->
              <div>
                <label class="block font-bold text-gray-400 uppercase mb-1">Birth Date</label>
                <input
                  v-model="form.birth_date"
                  type="date"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <!-- Gender -->
              <div>
                <label class="block font-bold text-gray-400 uppercase mb-1">Gender</label>
                <select
                  v-model="form.gender"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select gender...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <!-- City & Country -->
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block font-bold text-gray-400 uppercase mb-1">City</label>
                  <input
                    v-model="form.city"
                    type="text"
                    class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label class="block font-bold text-gray-400 uppercase mb-1">Country</label>
                  <input
                    v-model="form.country"
                    type="text"
                    class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <!-- LinkedIn -->
              <div>
                <label class="block font-bold text-gray-400 uppercase mb-1">LinkedIn profile url</label>
                <input
                  v-model="form.linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <!-- Experience Years -->
              <div>
                <label class="block font-bold text-gray-400 uppercase mb-1">Years of Experience</label>
                <input
                  v-model.number="form.experience_years"
                  type="number"
                  min="0"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <!-- Salary (Current / Expected) -->
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block font-bold text-gray-400 uppercase mb-1">Current Salary</label>
                  <input
                    v-model.number="form.current_salary"
                    type="number"
                    min="0"
                    placeholder="EGP"
                    class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label class="block font-bold text-gray-400 uppercase mb-1">Expected Salary</label>
                  <input
                    v-model.number="form.expected_salary"
                    type="number"
                    min="0"
                    placeholder="EGP"
                    class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <!-- Notice Period -->
              <div>
                <label class="block font-bold text-gray-400 uppercase mb-1">Notice Period</label>
                <input
                  v-model="form.notice_period"
                  type="text"
                  placeholder="e.g. 1 month, Immediate"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <!-- Sourcing Referral -->
              <div>
                <label class="block font-bold text-gray-400 uppercase mb-1">How did you hear about us?</label>
                <select
                  v-model="form.source"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select source...</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Indeed">Indeed</option>
                  <option value="Company Website">Company Website</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>

              <!-- Skills & Languages (Comma-separated) -->
              <div>
                <label class="block font-bold text-gray-400 uppercase mb-1">Skills (comma-separated)</label>
                <input
                  v-model="skillsInput"
                  type="text"
                  placeholder="PHP, Vue, SQL..."
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="store.submitting"
              class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <span v-if="store.submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-100 py-8 text-center text-sm text-gray-400 mt-20">
      <div class="max-w-6xl mx-auto px-6">
        <p>&copy; 2026 Brooklyn Operations. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MapPin, Calendar, ArrowLeft, ChevronDown, FileEdit } from 'lucide-vue-next';
import { usePublicCareersStore } from '@/stores/recruitment/publicCareersStore';

const route = useRoute();
const router = useRouter();
const slug = route.params.slug;

const store = usePublicCareersStore();
const job = computed(() => store.currentJob);

const showOptionalFields = ref(false);
const skillsInput = ref('');
const cvFile = ref(null);

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
  source: '',
});

const formatLabel = (v) => (v ?? '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const handleFileUpload = (e) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    cvFile.value = files[0];
  }
};

const handleSubmit = async () => {
  if (!cvFile.value) return alert('Resume CV file upload is required.');

  // Create form data
  const payload = new FormData();
  payload.append('firstname', form.firstname);
  payload.append('lastname', form.lastname);
  payload.append('email', form.email);
  payload.append('phone', form.phone);
  payload.append('cv_file', cvFile.value);

  // Optional fields
  if (form.birth_date) payload.append('birth_date', form.birth_date);
  if (form.gender) payload.append('gender', form.gender);
  if (form.city) payload.append('city', form.city);
  if (form.country) payload.append('country', form.country);
  if (form.linkedin) payload.append('linkedin', form.linkedin);
  if (form.experience_years !== '') payload.append('experience_years', form.experience_years);
  if (form.current_salary !== '') payload.append('current_salary', form.current_salary);
  if (form.expected_salary !== '') payload.append('expected_salary', form.expected_salary);
  if (form.notice_period) payload.append('notice_period', form.notice_period);
  if (form.source) payload.append('source', form.source);

  // Parse skills
  if (skillsInput.value) {
    const list = skillsInput.value.split(',').map(s => s.trim()).filter(Boolean);
    list.forEach(skill => {
      payload.append('skills[]', skill);
    });
  }

  await store.submitPublicApplication(slug, payload);
  router.push({ name: 'public-careers' });
};

// Mock Demo Fallback
const loadJobDetails = async () => {
  try {
    await store.fetchPublicJobDetails(slug);
  } catch {
    // mock fallbacks
    const mockJobs = [
      { id: 1, title: 'Senior NodeJS Engineer', slug: 'senior-nodejs-engineer', location: 'Cairo HQ', employment_type: 'full_time', salary_min: 16000, salary_max: 22000, deadline: '2026-09-10', description: 'We are looking for a Senior Node JS engineer to build high-performance APIs and scale our backend infrastructure.', requirements_snapshot: ['Strong Node.js knowledge & async coding paradigms', 'Experience with relational databases (MySQL/PostgreSQL)', 'Familiarity with cloud hosting services (Firebase/AWS)'] },
      { id: 2, title: 'UI/UX Designer', slug: 'ui-ux-designer', location: 'Remote', employment_type: 'contract', salary_min: 10000, salary_max: 14000, deadline: '2026-09-30', description: 'Design premium operational dashboards and responsive web portals for our student systems.', requirements_snapshot: ['3+ years Figma experience', 'Strong portfolio demonstrating responsive SaaS dashboards', 'Basic knowledge of HTML/CSS is a plus'] },
      { id: 3, title: 'HR Coordinator', slug: 'hr-coordinator', location: 'Cairo HQ', employment_type: 'part_time', salary_min: 7000, salary_max: 9000, deadline: '2026-09-20', description: 'Support candidate sourcing, interview scheduling, and operations onboarding pipeline.', requirements_snapshot: ['Excellent communication in English & Arabic', 'Prior experience using applicant tracking systems (ATS)', 'Highly organized with good scheduling habits'] }
    ];
    store.currentJob = mockJobs.find(j => j.slug === slug) || mockJobs[0];
  }
};

onMounted(() => {
  loadJobDetails();
});
</script>
