<template>
  <div class="container mx-auto px-2 sm:px-4">
    <div
      class="w-full overflow-x-auto rounded-lg border border-gray-300 shadow-sm"
    >
      <table
        class="w-full table-auto divide-y text-center divide-gray-200 bg-white"
      >
        <thead
          class="bg-gray-100 py-3 text-center font-bold text-indigo-800 uppercase [&>tr>th]:whitespace-nowrap [&>tr>th]:px-2 sm:[&>tr>th]:px-4 [&>tr>th]:py-3"
        >
          <tr>
            <th>Group Name</th>

            <th
              class="px-6 py-3 flex gap-2 items-center justify-center text-left text-lg font-bold text-indigo-800 uppercase cursor-pointer select-none"
              @click="$emit('toggleSort', 'start_date')"
            >
              Start Date
              <span>
                <ArrowUpDown v-if="sortOrder === 'asc'" :size="16" />
                <ArrowDownUp v-else :size="16" />
              </span>
            </th>

            <th>Actual Send Date <br />by system</th>
            <th>Sender <br />by srm</th>
            <th>Sent at</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(row, rowIndex) in sortedData"
            :key="getRowKey(row, rowIndex)"
            class="hover:bg-gray-50"
            :class="
              row.name.toLowerCase().includes('ai')
                ? 'bg-yellow-100'
                : ''
            "
          >
            <td
              class="px-2 sm:px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap"
            >
              {{ row.name.replace(" Group ", " - ") }}
              <span class="text-gray-600"> ({{ row.type }})</span>
            </td>

            <td class="px-2 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              <template v-if="editingGroupId !== getGroupId(row)">
                {{
                  (() => {
                    const dateStr =
                      row.type === "online" ? row.student_start : row.start_date;
                    return formatDate(dateStr);
                  })()
                }}
              </template>
              <input
                v-else
                v-model="editForm.starts_at"
                type="date"
                step="1"
                class="border border-indigo-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </td>
            <td class="px-2 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{ formatDate(row.act_date) }}
            </td>

            <td class="px-2 sm:px-4 py-3 text-sm text-gray-600 capitalize whitespace-nowrap">
              {{ row.sender?.name && row.sender?.fingerPrint ? `${row.sender.name}_${row.sender.fingerPrint}` : "-" }}
            </td>

            <td class="px-2 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{ formatDate(row.sent_at) || "-" }}
            </td>

            <td class="px-2 sm:px-4 py-3 text-sm whitespace-nowrap">
              <template v-if="row.type !== 'online'">-</template>
              <template v-else-if="!authStore.hasPermission('edit-groups')">-</template>
              <template v-else-if="editingGroupId !== getGroupId(row)">
                <button
                  type="button"
                  class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition"
                  title="Edit"
                  @click="enterEditMode(row)"
                >
                  <Edit :size="18" />
                </button>
              </template>
              <template v-else>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-1">
                  <button
                    type="button"
                    class="px-2 py-1 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    :disabled="!hasChanges || groupUpdateStore.loading"
                    @click="saveChanges(row)"
                  >
                    <span
                      v-if="groupUpdateStore.loadingGroupId === getGroupId(row)"
                      class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    />
                    {{ groupUpdateStore.loadingGroupId === getGroupId(row) ? "Saving..." : "Save" }}
                  </button>
                  <button
                    type="button"
                    class="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded"
                    :disabled="groupUpdateStore.loading"
                    @click="cancelEdit"
                  >
                    Cancel
                  </button>
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ArrowDownUp, ArrowUpDown, Edit } from "lucide-vue-next";
import formatDate from "../../global/FormDate";
import { useDateSort } from "../../global/useDateSort";
import { computed, ref } from "vue";
import { useGroupUpdateStore } from "@/stores/srmStore/groupUpdateStore";
import { useAuthStore } from "@/stores/auth";
import notyf from "@/components/global/notyf";

const authStore = useAuthStore();

const props = defineProps({
  data: { type: Array, default: () => [] },
  sortOrder: { type: String, default: "asc" },
  studentId: { type: [String, Number], default: null },
});

const emit = defineEmits(["refresh-groups"]);

const groupUpdateStore = useGroupUpdateStore();
const editingGroupId = ref(null);
const editForm = ref({ starts_at: "" });
const originalData = ref({ starts_at: "" });

const { sortByDate } = useDateSort();

function getGroupId(row) {
  return row.group_id ?? row.id;
}

function getRowKey(row, index) {
  return getGroupId(row) ?? index;
}

/** Convert API datetime to input datetime-local value */
function toDatetimeLocal(val) {
  if (!val) return "";
  const s = String(val).trim().replace(" ", "T").slice(0, 16);
  const d = new Date(s);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

/** Convert datetime-local value to API format "YYYY-MM-DD HH:mm:ss" */
function toApiDatetime(val) {
  if (!val) return "";
  const s = String(val).trim();
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const sec = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}:${sec}`;
}

const hasChanges = computed(() => {
  if (editingGroupId.value == null) return false;
  return toApiDatetime(editForm.value.starts_at) !== toApiDatetime(originalData.value.starts_at);
});

function enterEditMode(row) {
  const id = getGroupId(row);
  if (id == null) return;
  const dateStr = row.type === "online" ? row.student_start : row.start_date;
  const dtLocal = toDatetimeLocal(dateStr);
  editingGroupId.value = id;
  editForm.value = { starts_at: dtLocal };
  originalData.value = { starts_at: dtLocal };
}

function cancelEdit() {
  editingGroupId.value = null;
  editForm.value = { starts_at: "" };
  originalData.value = { starts_at: "" };
}

async function saveChanges(row) {
  if (!hasChanges.value) {
    notyf.info("No changes to save");
    return;
  }
  const groupId = getGroupId(row);
  if (groupId == null) {
    notyf.error("Cannot update: missing group id");
    return;
  }
  const stId = props.studentId;
  if (stId == null || stId === "") {
    notyf.error("Cannot update: no student selected");
    return;
  }
  const startsAt = toApiDatetime(editForm.value.starts_at);
  if (!startsAt) {
    notyf.error("Please select a valid date and time");
    return;
  }
  const payload = { group_id: groupId, starts_at: startsAt };
  try {
    await groupUpdateStore.updateGroupStartTime(stId, payload);
    emit("refresh-groups");
    cancelEdit();
  } catch (e) {
    console.error("Error updating group:", e);
  }
}

const sortedData = computed(() =>
  sortByDate(props.data, "start_date", props.sortOrder)
);
</script>
