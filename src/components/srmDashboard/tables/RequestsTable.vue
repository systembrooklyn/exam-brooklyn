<script setup>
import {
  ArrowDownUp,
  ArrowUpDown,
  Clock,
  MessageCircleReply,
  UserPen,
  UsersRound,
} from "lucide-vue-next";
import { ref } from "vue";
import { useRequestStore } from "@/stores/srmStore/requestStore";
import RequestFieldModal from "../RequestFieldModal.vue";
import ReplyRequestModal from "../ReplyRequestModal.vue";

const props = defineProps({
  title: String,
  headers: Array,
  data: Array,
  loading: Boolean,
  sortOrder: String,
});

const loadingReply = ref(false);
const replyKey = ref("emp_res");
const successStatusId = ref(null);
const errorStatusId = ref(null);
const loadingStatusId = ref(null);
const expandedCell = ref({});
const showRequestFieldModal = ref(false);
const showReplyModal = ref(false);
const selectedRequestId = ref(null);
const requestStore = useRequestStore();

const expandableColumns = [
  "value",
  "comment",
  "manager_response",
  "employee_response",
];

const emit = defineEmits(["toggleSort"]);

function toggleSort(field) {
  emit("toggleSort", field);
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function displayValue(val) {
  return val ?? "No Data Available";
}

function openModel(id, key = "emp_res") {
  selectedRequestId.value = id;
  replyKey.value = key;
  showReplyModal.value = true;
}

function toggleExpand(index, field) {
  if (expandedCell.value.key === `${index}-${field}`) {
    expandedCell.value = {};
  } else {
    expandedCell.value = { key: `${index}-${field}`, index, field };
  }
}

const updateRequestData = async ({ id, data, onSuccess, loadingRef }) => {
  if (loadingRef) loadingRef.value = id;

  try {
    await requestStore.updateRequest(id, data);
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Error updating request:", error);
  } finally {
    if (loadingRef) loadingRef.value = null;
  }
};

const updateStatus = async (row) => {
  const previousStatus = row.status;
  if (loadingStatusId.value === row.id) return;

  loadingStatusId.value = row.id;
  successStatusId.value = null;
  errorStatusId.value = null;

  try {
    await updateRequestData({
      id: row.id,
      data: { status: row.status },
      loadingRef: loadingStatusId, // ← مهم
      onSuccess: () => {
        // successStatusId.value = row.id;
       loadingStatusId.value = null
        setTimeout(() => {
          if (successStatusId.value === row.id) successStatusId.value = null;
        }, 2000);
      },
    });
  } catch (error) {
    errorStatusId.value = row.id;
    row.status = previousStatus;
    setTimeout(() => {
      if (errorStatusId.value === row.id) errorStatusId.value = null;
    }, 2000);
  }
};

const handleReply = async ({ key, value }) => {
  loadingReply.value = true;

  await updateRequestData({
    id: selectedRequestId.value,
    data: { [key]: value },
    loadingRef: null,
    onSuccess: () => {
      showReplyModal.value = false; // ← إغلاق المودال هنا ✅
    },
  });

  loadingReply.value = false;
};

</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <div
        class="flex items-center gap-2 text-indigo-800 font-bold text-lg cursor-pointer select-none"
        @click="toggleSort('created_at')"
      >
        Sort by Date
        <span>
          <ArrowUpDown v-if="sortOrder === 'asc'" :size="16" />
          <ArrowDownUp v-else :size="16" />
        </span>
      </div>
      <button
        @click="showRequestFieldModal = true"
        class="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-200"
      >
        Add New {{ title }}
      </button>
    </div>

    <div
      v-for="(row, rowIndex) in data"
      :key="rowIndex"
      class="bg-white p-3 rounded-lg shadow-md border border-gray-200"
    >
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center space-x-6">
          <span class="text-sm font-semibold text-gray-800">{{
            formatDate(row.created_at)
          }}</span>

          <span
            class="text-sm font-semibold text-gray-800 flex items-center gap-1"
          >
            <UserPen size="15" /> {{ row.employee?.name }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
          >
            {{ row.field }}
          </span>
          <div class="relative inline-block min-w-[120px] text-center">
            <select
              v-model="row.status"
              @change="updateStatus(row)"
              :class="[
                row.status === 'closed'
                  ? 'bg-green-100 text-green-700'
                  : row.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700',
                'w-full text-center cursor-pointer px-3 py-1 rounded-full text-sm font-medium capitalize appearance-none pr-6',
                'focus:outline-none focus:ring-0 ',
              ]"
            >
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>

            <div
              v-if="loadingStatusId === row.id"
              class="absolute top-1/2 right-2 transform -translate-y-1/2"
            >
              <div
                class="border-2 border-gray-300 border-t-green-600 rounded-full w-4 h-4 animate-spin"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <div class="prose max-w-none text-gray-800 font-medium mb-4">
          <template v-if="expandableColumns.includes('value')">
            <span v-if="`${rowIndex}-value` === expandedCell.key">
              {{ displayValue(row.value) }}
              <button
                class="ml-2 text-sm text-indigo-600 underline"
                @click.stop="toggleExpand(rowIndex, 'value')"
              >
                Less
              </button>
            </span>
            <span v-else>
              {{ displayValue(row.value).split(" ").slice(0, 25).join(" ") }}
              <span v-if="displayValue(row.value).split(' ').length > 35">
                ...
                <button
                  class="ml-1 text-sm text-indigo-600 underline"
                  @click.stop="toggleExpand(rowIndex, 'value')"
                >
                  More
                </button>
              </span>
            </span>
          </template>
          <template v-else>
            {{ displayValue(row.value) }}
          </template>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="!row.employee_response"
            @click="openModel(row.id, 'emp_res')"
            class="flex items-center justify-center gap-1 cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold text-sm px-3 py-1 rounded-lg shadow-sm transition"
          >
            Reply
            <MessageCircleReply size="15" />
          </button>
          <button
            v-if="!row.manager_response"
            @click="openModel(row.id, 'mng_res')"
            class="flex items-center justify-center gap-1 cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold text-sm px-3 py-1 rounded-lg shadow-sm transition"
          >
            Manager Reply
            <MessageCircleReply size="15" />
          </button>
        </div>
      </div>

      <div class="space-y-4 text-sm pt-1">
        <div
          v-if="row.manager_response"
          class="bg-gray-50 pl-2 py-1 rounded-md border-l-4 border-indigo-400"
        >
          <strong class="text-indigo-600">Manager Reply:</strong>
          <p class="text-gray-800">{{ row.manager_response }}</p>
          <div class="flex items-center gap-4 mt-3">
            <span
              v-if="row.manager_response_at"
              class="text-xs text-gray-800 flex items-center gap-1"
            >
              <Clock size="13" /> {{ row.manager_response_at }}
            </span>
            <span class="text-xs text-gray-800 flex items-center gap-1">
              <UsersRound size="13" /> {{ row.manager?.name }}
            </span>
          </div>
        </div>
        <div
          v-if="row.employee_response"
          class="bg-gray-50 pl-2 py-1 rounded-md border-l-4 border-blue-400"
        >
          <strong class="text-blue-600">Employee Reply:</strong>
          <p class="text-gray-800">{{ row.employee_response }}</p>
          <div class="flex items-center gap-4 mt-3">
            <span
              v-if="row.employee_response_at"
              class="text-xs text-gray-800 flex items-center gap-1"
            >
              <Clock size="13" />
              {{ formatDate(row.employee_response_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <RequestFieldModal
      v-if="showRequestFieldModal"
      v-model="showRequestFieldModal"
      :type="title"
    />

    <ReplyRequestModal
      v-if="showReplyModal"
      v-model="showReplyModal"
      :fieldKey="replyKey"
      :loadingReply="loadingReply"
      @send-reply="handleReply"
    />
  </div>
</template>
