<script setup>
import { ref, onMounted, watch } from "vue";
import { useStudentStore } from "@/stores/SearchStudent";
import Loader from "@/components/global/Loader.vue";

const props = defineProps({
  cardName: {
    type: String,
    default: "Unknown"
  }
});

const loading = ref(true);
const data = ref([]);
const columns = ref([]);

const studentStore = useStudentStore();

function extractColumns(dataArray) {
  // نجمع كل المفاتيح من كل العناصر في Set
  const keysSet = new Set();
  dataArray.forEach(item => {
    Object.keys(item).forEach(key => keysSet.add(key));
  });
  return Array.from(keysSet);
}

async function fetchData(name) {
  loading.value = true;
  await studentStore.fetchDataStuden(name);

  if (studentStore.studentData && studentStore.studentData.length > 0) {
    data.value = studentStore.studentData;
    columns.value = extractColumns(data.value);
  } else {
    data.value = [];
    columns.value = [];
  }

  loading.value = false;
}

onMounted(() => {
  fetchData(props.cardName);
});

watch(() => props.cardName, (newName) => {
  fetchData(newName);
});
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Detalis: {{ cardName }}</h1>
    <div v-if="loading"> <Loader :show="studentStore.loading" />
</div>
    <div v-else>
      <table class="min-w-full border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th
              v-for="col in columns"
              :key="col"
              class="border border-gray-300 px-4 py-2 capitalize"
            >
              {{ col.replace(/_/g, ' ') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in data"
            :key="index"
            class="hover:bg-gray-50"
          >
            <td
              v-for="col in columns"
              :key="col"
              class="border border-gray-300 px-4 py-2"
            >
              {{ row[col] !== undefined ? row[col] : '' }}
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="data.length === 0" class="mt-4 text-gray-500">
        لا توجد بيانات للعرض
      </div>
    </div>
  </div>
</template>

<style scoped>
/* أي تحسينات */
</style>
