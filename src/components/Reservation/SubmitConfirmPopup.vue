<script setup>
import { computed, ref } from "vue";
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  User,
  BookOpen,
  CreditCard,
  X,
  Loader2,
} from "lucide-vue-next";

const props = defineProps({
  reservationId: { type: [Number, String], required: true },
  studentInfo: { type: Object, default: () => ({}) },
  studyPlan: { type: Array, default: () => [] },
  installments: { type: Object, default: () => ({ schedule: [] }) },
  finalCase: { type: String, default: "" },
  finalAmount: { type: [Number, String], default: 0 },
  notes: { type: String, default: "" },
  isSubmitting: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "submitted"]);

const activeAction = ref(null); // 'reserve' | 'cancel' | 'ask'

const formattedFinalAmount = computed(() =>
  Number(props.finalAmount).toLocaleString("en-EG")
);

const installmentSchedule = computed(
  () => props.installments?.schedule || []
);

const totalInstallments = computed(() =>
  installmentSchedule.value.reduce((sum, i) => sum + Number(i.amount || 0), 0)
);

const handleAction = (status) => {
  activeAction.value = status;
  emit("submitted", status);
};
</script>

<template>
  <div
    class="fixed inset-0 z-[60] flex items-center justify-center p-4"
    style="background: rgba(15, 23, 42, 0.72); backdrop-filter: blur(6px)"
  >
    <div
      class="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
      style="background: #fff"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-7 py-5 border-b border-slate-100"
        style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 rounded-xl">
            <CheckCircle class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-white font-bold text-xl leading-tight">
              Confirm Reservation Submission
            </h2>
            <p class="text-indigo-200 text-xs mt-0.5">
              Review all details before proceeding — Reservation #{{ reservationId }}
            </p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="p-2 rounded-full bg-white/10 hover:bg-white/25 transition text-white"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="flex-1 overflow-y-auto px-7 py-6 space-y-6">

        <!-- Student Info -->
        <section>
          <div class="flex items-center gap-2 mb-3">
            <User class="w-4 h-4 text-indigo-600" />
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-indigo-700">
              Student Information
            </h3>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="(val, label) in {
                Name: studentInfo?.name,
                Email: studentInfo?.email,
                'Phone(s)': Array.isArray(studentInfo?.phones) ? studentInfo.phones.join(', ') : studentInfo?.phones,
                Nationality: studentInfo?.nationality,
                Grade: studentInfo?.grade,
                Scholarship: studentInfo?.scholarship?.name,
              }"
              :key="label"
              class="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
            >
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                {{ label }}
              </div>
              <div class="text-sm font-semibold text-slate-800 truncate">
                {{ val || '—' }}
              </div>
            </div>

            <!-- Final Case -->
            <div class="bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-100">
              <div class="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-0.5">Final Case</div>
              <div class="text-sm font-bold text-indigo-800">{{ finalCase || '—' }}</div>
            </div>

            <!-- Final Amount -->
            <div class="bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
              <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-0.5">Final Amount</div>
              <div class="text-sm font-black text-emerald-700">{{ formattedFinalAmount }} EGP</div>
            </div>

            <!-- Notes -->
            <div v-if="notes" class="col-span-2 md:col-span-3 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
              <div class="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-0.5">Notes</div>
              <div class="text-sm text-amber-800 leading-snug">{{ notes }}</div>
            </div>
          </div>
        </section>

        <!-- Study Plan -->
        <section v-if="studyPlan.length">
          <div class="flex items-center gap-2 mb-3">
            <BookOpen class="w-4 h-4 text-indigo-600" />
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-indigo-700">
              Study Plan ({{ studyPlan.length }} modules)
            </h3>
          </div>
          <div class="rounded-2xl overflow-hidden border border-slate-100">
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                  <th class="py-2.5 px-4 text-left font-bold text-slate-500 uppercase tracking-wider">#</th>
                  <th class="py-2.5 px-4 text-left font-bold text-slate-500 uppercase tracking-wider">Group ID</th>
                  <th class="py-2.5 px-4 text-left font-bold text-slate-500 uppercase tracking-wider">Module</th>
                  <th class="py-2.5 px-4 text-left font-bold text-slate-500 uppercase tracking-wider">Starts At</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr
                  v-for="(item, idx) in studyPlan"
                  :key="item.group_id"
                  class="hover:bg-indigo-50/30 transition"
                >
                  <td class="py-2 px-4 text-slate-400 font-medium">{{ idx + 1 }}</td>
                  <td class="py-2 px-4">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-[11px]">
                      {{ item.group_id }}
                    </span>
                  </td>
                  <td class="py-2 px-4 text-slate-700 font-medium">
                    {{ item.name || `Module ${idx + 1}` }}
                  </td>
                  <td class="py-2 px-4 text-slate-600 font-semibold tabular-nums">
                    {{ item.starts_at ? item.starts_at.slice(0, 10) : '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Installment Schedule -->
        <section v-if="installmentSchedule.length">
          <div class="flex items-center gap-2 mb-3">
            <CreditCard class="w-4 h-4 text-indigo-600" />
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-indigo-700">
              Payment Schedule ({{ installmentSchedule.length }} installments)
            </h3>
          </div>
          <div class="rounded-2xl overflow-hidden border border-slate-100">
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                  <th class="py-2.5 px-4 text-left font-bold text-slate-500 uppercase tracking-wider">#</th>
                  <th class="py-2.5 px-4 text-left font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th class="py-2.5 px-4 text-right font-bold text-slate-500 uppercase tracking-wider">Amount (EGP)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr
                  v-for="(inst, idx) in installmentSchedule"
                  :key="idx"
                  class="hover:bg-emerald-50/30 transition"
                >
                  <td class="py-2 px-4 text-slate-400 font-medium">{{ idx + 1 }}</td>
                  <td class="py-2 px-4 text-slate-700 font-semibold tabular-nums">{{ inst.due_date }}</td>
                  <td class="py-2 px-4 text-right font-bold text-slate-800 tabular-nums">
                    {{ Number(inst.amount).toLocaleString('en-EG') }}
                  </td>
                </tr>
                <!-- Total row -->
                <tr class="bg-emerald-50 border-t-2 border-emerald-100">
                  <td colspan="2" class="py-2.5 px-4 text-emerald-700 font-extrabold text-xs">Total</td>
                  <td class="py-2.5 px-4 text-right font-black text-emerald-700 text-sm tabular-nums">
                    {{ totalInstallments.toLocaleString('en-EG') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>

      <!-- Action Footer -->
      <div class="px-7 py-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center gap-3">
        <p class="text-xs text-slate-400 flex-1 hidden sm:block">
          Choose an action to finalize this reservation.
        </p>

        <!-- Ask -->
        <button
          id="submit-popup-ask-btn"
          @click="handleAction('ask')"
          :disabled="isSubmitting"
          class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 border-2 border-amber-400 text-amber-800 bg-amber-50 hover:bg-amber-100 disabled:opacity-50"
        >
          <Loader2 v-if="isSubmitting && activeAction === 'ask'" class="w-4 h-4 animate-spin" />
          <HelpCircle v-else class="w-4 h-4" />
          Ask
        </button>

        <!-- Cancel -->
        <button
          id="submit-popup-cancel-btn"
          @click="handleAction('cancel')"
          :disabled="isSubmitting"
          class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 border-2 border-red-400 text-red-800 bg-red-50 hover:bg-red-100 disabled:opacity-50"
        >
          <Loader2 v-if="isSubmitting && activeAction === 'cancel'" class="w-4 h-4 animate-spin" />
          <XCircle v-else class="w-4 h-4" />
          Cancel
        </button>

        <!-- Reserve -->
        <button
          id="submit-popup-reserve-btn"
          @click="handleAction('reserve')"
          :disabled="isSubmitting"
          class="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          <Loader2 v-if="isSubmitting && activeAction === 'reserve'" class="w-4 h-4 animate-spin" />
          <CheckCircle v-else class="w-4 h-4" />
          Reserve
        </button>
      </div>
    </div>
  </div>
</template>
