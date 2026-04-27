<template>
  <div class="container mx-auto px-2 sm:px-4">
    <div class="w-full overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
      <table class="w-full table-auto divide-y text-center divide-gray-200 bg-white">
        <thead
          class="bg-gray-100 py-3 text-center font-bold text-indigo-800 uppercase [&>tr>th]:whitespace-nowrap [&>tr>th]:px-2 sm:[&>tr>th]:px-4 [&>tr>th]:py-3"
        >
          <tr>
            <th>Attempt ID</th>
            <th>Test</th>
            <th>Score</th>
            <th>Status</th>
            <th>Started At</th>
            <th>Completed At</th>
            <!-- <th>Student</th> -->
            <th>Handled By</th>
          </tr>
        </thead>

        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(row, rowIndex) in data"
            :key="row.id ?? rowIndex"
            class="hover:bg-gray-50"
          >
            <td class="px-2 sm:px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
              {{ row.id ?? "-" }}
            </td>

            <td class="px-2 sm:px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
              {{ row.ptest?.name || "-" }}
            </td>

            <td class="px-2 sm:px-4 py-3 text-sm font-bold text-indigo-700 whitespace-nowrap">
              {{ row.score ?? "-" }}
            </td>

            <td class="px-2 sm:px-4 py-3 text-sm whitespace-nowrap">
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="statusClass(row.status)"
              >
                {{ row.status || "-" }}
              </span>
            </td>

            <td class="px-2 sm:px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
              {{ formatDateTime(row.started_at) }}
            </td>

            <td class="px-2 sm:px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
              {{ formatDateTime(row.completed_at) }}
            </td>

            <!-- <td class="px-2 sm:px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
              <div class="font-medium text-gray-900">
                {{ row.student?.name || "-" }}
              </div>
              <div class="text-xs text-gray-500">
                {{ row.student?.email || "-" }}
              </div>
            </td> -->

            <td class="px-2 sm:px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
              <div class="font-medium text-gray-900">
                {{ row.user?.name || "-" }}
              </div>
              <div class="text-xs text-gray-500">
                {{ row.user?.branch || "-" }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] },
});

function formatDateTime(value) {
  if (!value) return "-";

  const parsed = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "completed") return "bg-green-100 text-green-700";
  if (normalized === "in_progress") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-700";
}
</script>
