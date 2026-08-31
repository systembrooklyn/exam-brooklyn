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
              <p class="text-sm text-gray-500 mt-0.5">{{ hire.application?.job_post?.title ?? 'N/A' }}</p>
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
              v-if="hire.status === 'pending_onboarding'"
              @click="handleUpdate('onboarded')"
              :disabled="store.submitting"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle class="w-4 h-4" />
              Mark Onboarded
            </button>

            <!-- Cancel -->
            <button
              v-if="hire.status !== 'cancelled'"
              @click="handleUpdate('cancelled')"
              :disabled="store.submitting"
              class="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-xl border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
            >
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
            <div class="flex justify-between text-sm">
              <dt class="text-gray-500">Hire ID</dt>
              <dd class="font-medium text-gray-800">#{{ hire.id }}</dd>
            </div>
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
            <div class="flex justify-between text-sm">
              <dt class="text-gray-500">Application ID</dt>
              <dd>
                <button
                  @click="$router.push({ name: 'recruitment-application-detail', params: { id: hire.application_id } })"
                  class="text-emerald-600 hover:underline font-medium cursor-pointer"
                >#{{ hire.application_id }}</button>
              </dd>
            </div>
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm" v-if="hire.application?.candidate">
          <div>
            <p class="text-gray-400 text-xs mb-1">Email</p>
            <p class="font-medium text-gray-800">{{ hire.application.candidate.email ?? '—' }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-1">Phone</p>
            <p class="font-medium text-gray-800">{{ hire.application.candidate.phone ?? '—' }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-1">Experience</p>
            <p class="font-medium text-gray-800">{{ hire.application.candidate.experience_years ?? '—' }} yrs</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-1">City</p>
            <p class="font-medium text-gray-800">{{ hire.application.candidate.city ?? '—' }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-1">Current Company</p>
            <p class="font-medium text-gray-800">{{ hire.application.candidate.current_company ?? '—' }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-1">Education</p>
            <p class="font-medium text-gray-800">{{ hire.application.candidate.highest_education ?? '—' }}</p>
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
import { ArrowLeft, UserCheck, CheckCircle, FileText, User } from 'lucide-vue-next';
import { useHiresStore } from '@/stores/recruitment/hiresStore';

const route = useRoute();
const store = useHiresStore();
const hire  = computed(() => store.currentHire);

const candidateName = computed(() => {
  const c = hire.value?.application?.candidate;
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
  if (!confirm(`Mark this hire as "${status}"?`)) return;
  await store.updateHire(route.params.id, { status });
}

onMounted(() => store.fetchHire(route.params.id));
</script>
