<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Interview Pipeline Stages</h1>
        <p class="text-sm text-gray-500 mt-0.5">Configure the stages candidates move through during the recruitment process</p>
      </div>
      <button
        @click="openModal()"
        class="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        Add Stage
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!store.stages.length" class="text-center py-24">
      <div class="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Layers class="w-8 h-8 text-violet-400" />
      </div>
      <p class="text-gray-500 font-medium">No stages configured yet</p>
      <p class="text-gray-400 text-sm mt-1">Add interview pipeline stages to structure your hiring process.</p>
    </div>

    <!-- Stages List -->
    <div v-else class="space-y-3">
      <div
        v-for="stage in store.stages"
        :key="stage.id"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5 hover:shadow-md transition-shadow"
      >
        <!-- Sort Order Badge -->
        <div class="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
          {{ stage.sort_order ?? '—' }}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="font-semibold text-gray-900">{{ stage.name }}</p>
            <span class="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{{ stage.code }}</span>
            <span v-if="!stage.is_active" class="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 font-medium">Inactive</span>
            <span v-if="stage.is_optional" class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-medium">Optional</span>
          </div>
          <!-- Flags row -->
          <div class="flex gap-4 mt-2 flex-wrap">
            <span class="flex items-center gap-1 text-xs text-gray-500">
              <component :is="stage.requires_schedule ? CheckCircle : XCircle" class="w-3.5 h-3.5" :class="stage.requires_schedule ? 'text-emerald-500' : 'text-gray-300'" />
              Schedule required
            </span>
            <span class="flex items-center gap-1 text-xs text-gray-500">
              <component :is="stage.requires_feedback ? CheckCircle : XCircle" class="w-3.5 h-3.5" :class="stage.requires_feedback ? 'text-emerald-500' : 'text-gray-300'" />
              Feedback required
            </span>
            <span class="flex items-center gap-1 text-xs text-gray-500">
              <component :is="stage.allow_score ? CheckCircle : XCircle" class="w-3.5 h-3.5" :class="stage.allow_score ? 'text-emerald-500' : 'text-gray-300'" />
              Allow score
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            @click="openModal(stage)"
            class="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
            title="Edit"
          >
            <Pencil class="w-4 h-4" />
          </button>
          <button
            @click="handleDelete(stage)"
            class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal" />
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-900">{{ editingStage ? 'Edit Stage' : 'Add Interview Stage' }}</h3>
              <button @click="closeModal" class="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                <X class="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-5">
              <!-- Name + Code -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5">Stage Name <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.name"
                    placeholder="e.g. Technical Interview"
                    class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5">Code <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.code"
                    placeholder="e.g. technical_interview"
                    class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-mono"
                  />
                </div>
              </div>

              <!-- Sort Order -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Sort Order</label>
                <input
                  v-model.number="form.sort_order"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <!-- Toggle Flags -->
              <div class="space-y-3">
                <p class="text-sm font-semibold text-gray-700">Stage Options</p>
                <label v-for="flag in FLAGS" :key="flag.key" class="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <span class="text-sm text-gray-700">{{ flag.label }}</span>
                  <button
                    type="button"
                    @click="form[flag.key] = !form[flag.key]"
                    class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
                    :class="form[flag.key] ? 'bg-violet-600' : 'bg-gray-200'"
                  >
                    <span
                      class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                      :class="form[flag.key] ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </label>
              </div>

              <!-- Error -->
              <p v-if="formError" class="text-sm text-red-500 flex items-center gap-1.5">
                <AlertTriangle class="w-4 h-4" /> {{ formError }}
              </p>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                @click="closeModal"
                class="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >Cancel</button>
              <button
                @click="handleSave"
                :disabled="store.submitting"
                class="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <span v-if="store.submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {{ editingStage ? 'Save Changes' : 'Create Stage' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Plus, Layers, Pencil, Trash2, X, CheckCircle, XCircle, AlertTriangle } from 'lucide-vue-next';
import { useInterviewStagesStore } from '@/stores/recruitment/interviewStagesStore';

const store = useInterviewStagesStore();

// ── Modal State ────────────────────────────────────────────────────────────
const showModal    = ref(false);
const editingStage = ref(null);
const formError    = ref('');

const FLAGS = [
  { key: 'is_active',          label: 'Active (visible in pipeline)' },
  { key: 'is_optional',        label: 'Optional (can be skipped)' },
  { key: 'requires_schedule',  label: 'Requires scheduled time' },
  { key: 'requires_feedback',  label: 'Requires feedback from interviewer' },
  { key: 'allow_score',        label: 'Allow numerical score (0–100)' },
];

const form = reactive({
  name:               '',
  code:               '',
  sort_order:         0,
  is_optional:        false,
  is_active:          true,
  requires_schedule:  true,
  requires_feedback:  true,
  allow_score:        false,
});

function openModal(stage = null) {
  editingStage.value = stage;
  formError.value    = '';
  if (stage) {
    Object.assign(form, {
      name:              stage.name ?? '',
      code:              stage.code ?? '',
      sort_order:        stage.sort_order ?? 0,
      is_optional:       !!stage.is_optional,
      is_active:         stage.is_active !== false,
      requires_schedule: !!stage.requires_schedule,
      requires_feedback: !!stage.requires_feedback,
      allow_score:       !!stage.allow_score,
    });
  } else {
    Object.assign(form, { name: '', code: '', sort_order: store.stages.length, is_optional: false, is_active: true, requires_schedule: true, requires_feedback: true, allow_score: false });
  }
  showModal.value = true;
}

function closeModal() { showModal.value = false; }

async function handleSave() {
  formError.value = '';
  if (!form.name.trim()) { formError.value = 'Stage name is required.'; return; }
  if (!form.code.trim()) { formError.value = 'Stage code is required.'; return; }

  const payload = { ...form };
  try {
    if (editingStage.value) {
      await store.updateStage(editingStage.value.id, payload);
    } else {
      await store.createStage(payload);
    }
    closeModal();
  } catch {
    formError.value = 'Failed to save stage. Please try again.';
  }
}

async function handleDelete(stage) {
  if (!confirm(`Delete stage "${stage.name}"? This cannot be undone.`)) return;
  await store.deleteStage(stage.id);
}

onMounted(() => store.fetchStages());
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
