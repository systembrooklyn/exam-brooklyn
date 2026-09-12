<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-6">
    <!-- Back Button -->
    <button
      @click="$router.back()"
      class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6 cursor-pointer"
    >
      <ArrowLeft class="w-4 h-4" />
      Back to Hires
    </button>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <template v-else-if="hire">
      <!-- Header -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div class="flex items-start justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
              {{ initials }}
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ candidateName }}</h1>
              <p class="text-sm text-gray-500 mt-0.5">{{ applicationObj?.job_post?.title || 'N/A' }}</p>
            </div>
          </div>

            <!-- Status Badge + Actions -->
            <div class="flex items-center gap-3 flex-wrap">
              <span
                class="px-3 py-1.5 rounded-full text-sm font-semibold border"
                :class="store.statusMeta[hire.status]?.cls ?? 'bg-gray-50 text-gray-600 border-gray-200'"
              >
                {{ store.statusMeta[hire.status]?.label ?? hire.status }}
              </span>

              <!-- Mark Onboarded -->
              <button
                v-if="hire.status === 'pending_onboarding' || hire.status === 'cancelled'"
                @click="handleUpdate('onboarded')"
                :disabled="store.submitting"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle class="w-4 h-4" />
                Mark Onboarded
              </button>

              <!-- Revert/Restore to Pending -->
              <button
                v-if="hire.status === 'onboarded' || hire.status === 'cancelled'"
                @click="handleUpdate('pending_onboarding')"
                :disabled="store.submitting"
                class="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold rounded-xl border border-amber-200 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <Clock class="w-4 h-4" />
                Revert to Pending
              </button>

              <!-- Cancel Hire -->
              <button
                v-if="hire.status === 'pending_onboarding' || hire.status === 'onboarded'"
                @click="handleUpdate('cancelled')"
                :disabled="store.submitting"
                class="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-xl border border-red-200 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <XCircle class="w-4 h-4" />
                Cancel Hire
              </button>
            </div>
        </div>
      </div>

      <!-- Grid: Hire Details + Offer Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Hire Info -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserCheck class="w-4 h-4 text-emerald-500" />
            Hire Information
          </h2>
          <dl class="space-y-3">
            <!-- <div class="flex justify-between text-sm">
              <dt class="text-gray-500">Hire ID</dt>
              <dd class="font-medium text-gray-800">#{{ hire.id }}</dd>
            </div> -->
            <div class="flex justify-between text-sm">
              <dt class="text-gray-500">Status</dt>
              <dd>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold border" :class="store.statusMeta[hire.status]?.cls">
                  {{ store.statusMeta[hire.status]?.label ?? hire.status }}
                </span>
              </dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-500">Hired At</dt>
              <dd class="font-medium text-gray-800">{{ hire.created_at ? formatDate(hire.created_at) : '—' }}</dd>
            </div>
            <!-- <div class="flex justify-between text-sm">
              <dt class="text-gray-500">Application ID</dt>
              <dd>
                <button
                  @click="$router.push({ name: 'recruitment-application-details', params: { id: hire.application_id } })"
                  class="text-emerald-600 hover:underline font-medium cursor-pointer"
                >#{{ hire.application_id }}</button>
              </dd>
            </div> -->
          </dl>
        </div>

        <!-- Offer Info -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText class="w-4 h-4 text-indigo-500" />
            Offer Details
          </h2>
          <dl v-if="hire.offer" class="space-y-3">
            <div class="flex justify-between text-sm">
              <dt class="text-gray-500">Offer Number</dt>
              <dd class="font-mono font-medium text-gray-800">{{ hire.offer.offer_number }}</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-500">Salary</dt>
              <dd class="font-medium text-gray-800">{{ hire.offer.currency ?? 'EGP' }} {{ formatNum(hire.offer.salary) }}</dd>
            </div>
            <div class="flex justify-between text-sm" v-if="hire.offer.allowance">
              <dt class="text-gray-500">Allowance</dt>
              <dd class="font-medium text-gray-800">{{ hire.offer.currency ?? 'EGP' }} {{ formatNum(hire.offer.allowance) }}</dd>
            </div>
            <div class="flex justify-between text-sm" v-if="hire.offer.bonus">
              <dt class="text-gray-500">Bonus</dt>
              <dd class="font-medium text-gray-800">{{ hire.offer.currency ?? 'EGP' }} {{ formatNum(hire.offer.bonus) }}</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-500">Start Date</dt>
              <dd class="font-medium text-gray-800">{{ hire.offer.start_date ? formatDate(hire.offer.start_date) : '—' }}</dd>
            </div>
            <div class="flex justify-between text-sm" v-if="hire.offer.probation_months">
              <dt class="text-gray-500">Probation</dt>
              <dd class="font-medium text-gray-800">{{ hire.offer.probation_months }} months</dd>
            </div>
          </dl>
          <p v-else class="text-sm text-gray-400 italic">No offer linked to this hire.</p>
        </div>
      </div>

      <!-- Candidate Info -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User class="w-4 h-4 text-blue-500" />
          Candidate Details
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-4 text-sm" v-if="candidateObj">
          <div>
            <p class="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Email</p>
            <p class="font-medium text-gray-800 break-all">{{ candidateObj.email ?? '—' }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Phone</p>
            <p class="font-medium text-gray-800">{{ candidateObj.phone ?? '—' }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Experience</p>
            <p class="font-medium text-gray-800">{{ candidateObj.experience_years ?? '—' }} yrs</p>
          </div>
          <div>
            <p class="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Location</p>
            <p class="font-medium text-gray-800">
              {{ candidateObj.city ? `${candidateObj.city}, ${candidateObj.country || 'Egypt'}` : '—' }}
            </p>
          </div>
          <div>
            <p class="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Current Company</p>
            <p class="font-medium text-gray-800">{{ candidateObj.current_company ?? '—' }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Education</p>
            <p class="font-medium text-gray-800">{{ candidateObj.highest_education ?? '—' }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Gender / Birthdate</p>
            <p class="font-medium text-gray-800 capitalize">
              {{ candidateObj.gender || '—' }} 
              <span v-if="candidateObj.birth_date" class="text-gray-400 text-xs">({{ candidateObj.birth_date }})</span>
            </p>
          </div>
          <div>
            <p class="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Notice Period</p>
            <p class="font-medium text-gray-800">{{ candidateObj.notice_period ?? '—' }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">LinkedIn Profile</p>
            <a
              v-if="candidateObj.linkedin"
              :href="candidateObj.linkedin"
              target="_blank"
              class="text-indigo-600 hover:underline font-medium break-all flex items-center gap-1"
            >
              View Profile
            </a>
            <p v-else class="text-gray-400">—</p>
          </div>
          <div class="sm:col-span-2 lg:col-span-3 border-t border-gray-50 pt-4" v-if="candidateObj.skills?.length">
            <p class="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Key Skills</p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="skill in candidateObj.skills"
                :key="skill"
                class="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
              >
                {{ skill }}
              </span>
            </div>
          </div>
          <div class="sm:col-span-2 lg:col-span-3 border-t border-gray-50 pt-4" v-if="candidateObj.languages?.length">
            <p class="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Languages</p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="lang in candidateObj.languages"
                :key="lang"
                class="px-2.5 py-0.5 bg-indigo-50/50 text-indigo-700 rounded-lg text-xs font-semibold"
              >
                {{ lang }}
              </span>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 italic">Candidate info not available.</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, UserCheck, CheckCircle, FileText, User, XCircle, Clock } from 'lucide-vue-next';
import { useHiresStore } from '@/stores/recruitment/hiresStore';
import { useApplicationsStore } from '@/stores/recruitment/applicationsStore';
import notyf from '@/components/global/notyf';

const route = useRoute();
const store = useHiresStore();
const appStore = useApplicationsStore();

const hire  = computed(() => store.currentHire);

const applicationObj = computed(() => {
  if (!hire.value) return null;
  return hire.value.application || appStore.applications.find(a => Number(a.id) === Number(hire.value.application_id));
});

const candidateObj = computed(() => {
  return hire.value?.candidate || applicationObj.value?.candidate;
});

const candidateName = computed(() => {
  const c = candidateObj.value;
  if (!c) return '—';
  return c.name || `${c.firstname ?? ''} ${c.lastname ?? ''}`.trim() || '—';
});

const initials = computed(() => {
  const parts = candidateName.value.split(' ');
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
});

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatNum(n) {
  return n ? Number(n).toLocaleString() : '—';
}

async function handleUpdate(status) {
  const label = store.statusMeta[status]?.label || status;
  if (!confirm(`Are you sure you want to change this hire's status to "${label}"?`)) return;
  try {
    await store.updateHire(route.params.id, { status });
    notyf.success(`Hire status updated to "${label}" successfully.`);
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'Failed to update status.';
    notyf.error(msg);
  }
}

onMounted(async () => {
  store.fetchHire(route.params.id);
  appStore.fetchApplications();
});
</script>
