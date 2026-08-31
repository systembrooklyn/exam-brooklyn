<template>
  <div class="space-y-6 animate-fade-in max-w-5xl mx-auto">

    <!-- Header / Navigation -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button @click="$router.back()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
          <ArrowLeft class="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Candidate Profile</h1>
          <p class="text-gray-500 text-sm mt-0.5">Comprehensive view of candidate credentials, resume, and history</p>
        </div>
      </div>
      <div class="flex items-center gap-2" v-if="cand">
        <button
          v-if="authStore.can('update-candidates')"
          @click="$router.push({ name: 'recruitment-candidate-edit', params: { id: cand.id } })"
          class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-semibold cursor-pointer"
        >
          <Edit class="w-4 h-4 text-blue-500" /> Edit Profile
        </button>
      </div>
    </div>

    <div v-if="store.loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Candidate details grid -->
    <div v-else-if="cand" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Left Column: Quick Profile Card & Resume -->
      <div class="space-y-6 lg:col-span-1">

        <!-- Info Card -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center space-y-4">
          <div class="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-3xl flex items-center justify-center mx-auto shadow-inner">
            {{ initials }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ candidateName }}</h2>
            <p class="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
              <MapPin class="w-3.5 h-3.5 text-gray-400" />
              {{ cand.city }}, {{ cand.country }}
            </p>
          </div>

          <div class="flex justify-center">
            <span
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border"
              :class="store.statusMeta(cand.status).cls"
            >
              {{ store.statusMeta(cand.status).label }}
            </span>
          </div>

          <!-- Contact details block -->
          <div class="border-t border-gray-50 pt-4 text-left space-y-3 text-sm">
            <div class="flex items-center gap-3 text-gray-600">
              <Mail class="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span class="truncate" :title="cand.email">{{ cand.email }}</span>
            </div>
            <div class="flex items-center gap-3 text-gray-600">
              <Phone class="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{{ cand.phone }}</span>
            </div>
            <div v-if="cand.linkedin" class="flex items-center gap-3 text-gray-600">
              <Linkedin class="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <a :href="cand.linkedin" target="_blank" class="text-indigo-600 hover:underline truncate">
                LinkedIn Profile
              </a>
            </div>
          </div>
        </div>

        <!-- CV Document Card -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
            <FileText class="w-4 h-4 text-indigo-500" /> Resume / CV
          </h3>
          <div v-if="cand.cv_file" class="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <FileText class="w-8 h-8 text-red-500 flex-shrink-0" />
              <div class="min-w-0">
                <p class="text-xs font-semibold text-gray-700 truncate">CV_Resume.pdf</p>
                <p class="text-[10px] text-gray-400">PDF Document</p>
              </div>
            </div>
            <a
              :href="cand.cv_file"
              target="_blank"
              class="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
            >
              <Download class="w-4 h-4" />
            </a>
          </div>
          <p v-else class="text-xs text-gray-400">No CV document has been uploaded for this candidate.</p>
        </div>

      </div>

      <!-- Right Column: Professional Details, Skills & Notes -->
      <div class="space-y-6 lg:col-span-2">

        <!-- Professional Background -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-50 pb-2">
            Professional Overview
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <p class="text-xs text-gray-400">Experience Years</p>
              <p class="font-semibold text-gray-800 mt-0.5">
                {{ cand.experience_years != null ? `${cand.experience_years} years` : '—' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-400">Highest Education</p>
              <p class="font-semibold text-gray-800 mt-0.5">{{ cand.highest_education || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">Current Company</p>
              <p class="font-semibold text-gray-800 mt-0.5">{{ cand.current_company || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">Notice Period</p>
              <p class="font-semibold text-gray-800 mt-0.5">{{ cand.notice_period || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">English Language Level</p>
              <p class="font-semibold text-gray-800 mt-0.5">{{ cand.english_level || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400">Source of Application</p>
              <p class="font-semibold text-gray-800 mt-0.5">{{ cand.source || 'Website' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm border-t border-gray-50 pt-4">
            <div>
              <p class="text-xs text-gray-400">Current Salary</p>
              <p class="font-bold text-gray-700 mt-0.5">
                {{ cand.current_salary ? `${formatNumber(cand.current_salary)} EGP` : '—' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-400">Expected Salary</p>
              <p class="font-bold text-indigo-600 mt-0.5">
                {{ cand.expected_salary ? `${formatNumber(cand.expected_salary)} EGP` : '—' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Skills & Languages tags -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2.5">Skills / Tags</h4>
            <div v-if="cand.skills && cand.skills.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="sk in cand.skills"
                :key="sk"
                class="px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-xs font-medium"
              >
                {{ sk }}
              </span>
            </div>
            <p v-else class="text-xs text-gray-400">No skills registered.</p>
          </div>

          <div class="border-t border-gray-50 pt-4">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2.5">Languages</h4>
            <div v-if="cand.languages && cand.languages.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="lang in cand.languages"
                :key="lang"
                class="px-2.5 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs font-medium"
              >
                {{ lang }}
              </span>
            </div>
            <p v-else class="text-xs text-gray-400">No languages registered.</p>
          </div>
        </div>

        <!-- Notes Section -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-50 pb-2">
            Recruitment Comments
          </h3>
          <p class="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
            {{ cand.notes || 'No general comments or feedback registered.' }}
          </p>
        </div>

      </div>

    </div>

    <!-- Error State -->
    <div v-else class="bg-red-50 text-red-600 p-4 rounded-xl text-center">
      Failed to load candidate information.
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, Edit, MapPin, Mail, Phone, Linkedin, FileText, Download } from 'lucide-vue-next';
import { useCandidatesStore } from '@/stores/recruitment/candidatesStore';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const store = useCandidatesStore();
const authStore = useAuthStore();

const cand = computed(() => store.currentCandidate);

const candidateName = computed(() => {
  const c = cand.value;
  if (!c) return '—';
  return c.name || `${c.firstname || ''} ${c.lastname || ''}`.trim() || '—';
});

const initials = computed(() => {
  const name = candidateName.value;
  if (name === '—') return '?';
  const parts = name.split(' ');
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
});

const formatNumber = (num) => Number(num).toLocaleString('en-US');

onMounted(() => store.fetchCandidate(route.params.id));
</script>
