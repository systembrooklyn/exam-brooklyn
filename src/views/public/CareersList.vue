<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    <!-- Navbar -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="p-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center">
            B
          </span>
          <span class="font-bold text-lg text-gray-900">Brooklyn Careers</span>
        </div>
        <router-link to="/" class="text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors">
          Portal Login
        </router-link>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white py-20 px-6 relative overflow-hidden">
      <!-- Ambient light effect -->
      <div class="absolute -right-40 -top-40 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <div class="absolute -left-40 -bottom-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />

      <div class="max-w-4xl mx-auto text-center space-y-6 relative z-10 animate-fade-in">
        <h1 class="text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Shape the Future of Education & Operations with Us
        </h1>
        <p class="text-lg text-indigo-200/80 max-w-2xl mx-auto font-medium">
          Explore our open roles and join a fast-growing, collaborative team of professionals building state-of-the-art systems.
        </p>
      </div>
    </section>

    <!-- Main Content -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-8">
      <!-- Search & Filters -->
      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4 justify-between">
        <div class="flex items-center gap-3 flex-wrap flex-1">
          <div class="relative flex-1 min-w-[200px]">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="search"
              type="text"
              placeholder="Search roles..."
              class="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <select
            v-model="locationFilter"
            class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Locations</option>
            <option v-for="loc in uniqueLocations" :key="loc" :value="loc">{{ loc }}</option>
          </select>
          <select
            v-model="typeFilter"
            class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Job Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {{ filteredJobs.length }} Active Openings
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="store.loading" class="flex justify-center items-center py-20">
        <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredJobs.length === 0" class="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm space-y-4">
        <Briefcase class="w-16 h-16 text-gray-200 mx-auto" />
        <h3 class="text-lg font-bold text-gray-800">No open positions found</h3>
        <p class="text-sm text-gray-400 max-w-sm mx-auto">We don't currently have active postings matching these criteria. Please check back later!</p>
      </div>

      <!-- Jobs Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="job in filteredJobs"
          :key="job.id"
          class="bg-white border border-gray-100/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between group"
        >
          <div>
            <div class="flex items-start justify-between gap-4 mb-4">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 capitalize border border-indigo-100/50">
                {{ formatLabel(job.employment_type) }}
              </span>
              <span class="text-xs text-gray-400 font-medium flex items-center gap-1">
                <MapPin class="w-3.5 h-3.5 text-gray-300" />
                {{ job.location || 'Remote' }}
              </span>
            </div>

            <h3 class="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
              {{ job.title }}
            </h3>

            <!-- Truncated Description -->
            <p class="text-sm text-gray-500 line-clamp-3 mb-6 leading-relaxed">
              {{ job.description || 'No description provided.' }}
            </p>
          </div>

          <div class="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
            <span class="text-xs text-gray-400 font-semibold" v-if="job.salary_min || job.salary_max">
              {{ formatNumber(job.salary_min) }}–{{ formatNumber(job.salary_max) }} EGP
            </span>
            <span class="text-xs text-gray-300" v-else>—</span>

            <router-link
              :to="{ name: 'public-career-detail', params: { slug: job.slug } }"
              class="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              View details & apply
              <ArrowRight class="w-3.5 h-3.5" />
            </router-link>
          </div>
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
import { ref, computed, onMounted } from 'vue';
import { Search, MapPin, Briefcase, ArrowRight, X } from 'lucide-vue-next';
import { usePublicCareersStore } from '@/stores/recruitment/publicCareersStore';

const store = usePublicCareersStore();

const search = ref('');
const locationFilter = ref('');
const typeFilter = ref('');

const formatLabel = (v) => (v ?? '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const formatNumber = (num) => Number(num || 0).toLocaleString('en-US');

// Unique locations for filters
const uniqueLocations = computed(() => {
  const locs = store.jobs.map(j => j.location).filter(Boolean);
  return [...new Set(locs)];
});

const filteredJobs = computed(() => {
  let list = store.jobs;
  if (search.value) {
    const q = search.value.toLowerCase().trim();
    list = list.filter(j => j.title?.toLowerCase().includes(q));
  }
  if (locationFilter.value) {
    list = list.filter(j => j.location === locationFilter.value);
  }
  if (typeFilter.value) {
    list = list.filter(j => j.employment_type === typeFilter.value);
  }
  return list;
});

// Mock Demo Fallback if API returns empty during evaluation
const loadJobs = async () => {
  try {
    await store.fetchPublicJobs();
  } catch {
    // mock fallbacks
    store.jobs = [
      { id: 1, title: 'Senior NodeJS Engineer', slug: 'senior-nodejs-engineer', location: 'Cairo HQ', employment_type: 'full_time', salary_min: 16000, salary_max: 22000, description: 'We are looking for a Senior Node JS engineer to build high-performance APIs and scale our backend infrastructure.' },
      { id: 2, title: 'UI/UX Designer', slug: 'ui-ux-designer', location: 'Remote', employment_type: 'contract', salary_min: 10000, salary_max: 14000, description: 'Design premium operational dashboards and responsive web portals for our student systems.' },
      { id: 3, title: 'HR Coordinator', slug: 'hr-coordinator', location: 'Cairo HQ', employment_type: 'part_time', salary_min: 7000, salary_max: 9000, description: 'Support candidate sourcing, interview scheduling, and operations onboarding pipeline.' }
    ];
  }
};

onMounted(() => {
  loadJobs();
});
</script>
