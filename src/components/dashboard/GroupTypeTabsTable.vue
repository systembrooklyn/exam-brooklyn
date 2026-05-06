<template>
  <div class="flex flex-col gap-4 md:flex-row md:items-start">
    <aside class="md:w-36 shrink-0 sticky top-4 self-start z-10">
      <div class="rounded-lg border border-gray-200 bg-white/95 backdrop-blur-sm p-2 space-y-1.5 shadow-lg border-gray-300">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="w-full px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between gap-2"
          :class="
            activeTab === tab.id
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-white'
          "
          @click="activeTab = tab.id"
        >
          <span>{{ tab.label }}</span>
          <span
            class="text-xs px-2 py-0.5 rounded-full tabular-nums"
            :class="activeTab === tab.id ? 'bg-white/20' : 'bg-white text-gray-600'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>
    </aside>

    <div class="min-w-0 flex-1 overflow-x-auto rounded-lg border border-gray-100">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <th class="px-4 py-3 text-center">Group</th>
            <th class="px-4 py-3 text-center whitespace-nowrap">Code</th>
            <th class="px-4 py-3 text-center whitespace-nowrap">Start</th>
            <th class="px-4 py-3 text-center whitespace-nowrap">Lectures</th>
            <th class="px-4 py-3 text-center whitespace-nowrap">Status</th>
          </tr>
        </thead>
        <tbody v-if="filteredGroups.length" class="divide-y divide-gray-100">
          <tr
            v-for="g in filteredGroups"
            :key="rowKey(g)"
            class="hover:bg-indigo-50/40 transition-colors"
          >
            <td class="px-4 py-3 text-center font-medium text-gray-900 max-w-[220px]">
              <span class="line-clamp-2">{{ g.group_name }}</span>
            </td>
            <td class="px-4 py-3 text-center font-mono text-gray-700 whitespace-nowrap">
              {{ g.group_code }}
            </td>
            <td class="px-4 py-3 text-center text-gray-600 whitespace-nowrap text-xs sm:text-sm">
              {{ formatDateTime(g.group_start_date) }}
            </td>
            <td class="px-4 py-3 text-center tabular-nums text-gray-700">
              {{ g.group_total_lec ?? "—" }}
            </td>
            <td class="px-4 py-3 text-center">
              <span
                class="inline-flex text-xs px-2 py-0.5 rounded-full font-medium"
                :class="activePillClass(g.group_is_active)"
              >
                {{ activeLabel(g.group_is_active) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <p
        v-if="!filteredGroups.length"
        class="text-sm text-gray-500 text-center py-8 px-4 bg-gray-50/40"
      >
        {{ emptyText }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import formatDate from "../global/FormDate";

const props = defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: "No groups for this type.",
  },
});

const activeTab = ref("all");

function normalizeType(v) {
  return String(v ?? "").trim().toLowerCase();
}

const tabs = computed(() => {
  const list = Array.isArray(props.groups) ? props.groups : [];
  const online = list.filter((g) => normalizeType(g?.group_type) === "online").length;
  const klass = list.filter((g) => normalizeType(g?.group_type) === "class").length;
  return [
    { id: "all", label: "All", count: list.length },
    { id: "Online", label: "Online", count: online },
    { id: "Class", label: "Class", count: klass },
  ];
});

const filteredGroups = computed(() => {
  const list = Array.isArray(props.groups) ? props.groups : [];
  if (activeTab.value === "all") return list;
  return list.filter(
    (g) => normalizeType(g?.group_type) === String(activeTab.value).toLowerCase()
  );
});

function rowKey(g) {
  return g?.group_id ?? g?.id ?? `${g?.group_code ?? "grp"}-${g?.group_name ?? ""}`;
}

function activeLabel(val) {
  if (val === 1 || val === true) return "Active";
  if (val === 0 || val === false) return "Inactive";
  return "—";
}

function activePillClass(val) {
  if (val === 1 || val === true) return "bg-emerald-100 text-emerald-800";
  if (val === 0 || val === false) return "bg-gray-200 text-gray-600";
  return "bg-gray-100 text-gray-600";
}

function formatDateTime(raw) {
  if (raw == null || raw === "") return "—";
  const s = String(raw);
  const parts = s.split(" ");
  const datePart = formatDate(s);
  if (parts.length >= 2 && parts[1]) {
    const time = parts[1].slice(0, 5);
    if (time && time !== "00:00") return `${datePart} · ${time}`;
  }
  return datePart;
}
</script>
