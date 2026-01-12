<template>
  <div class="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
    <!-- Loading State -->
    <div v-if="loading && !items.length" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && items.length === 0" class="p-8 text-center text-gray-500">
      {{ emptyMessage || 'No records found.' }}
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left min-w-[800px]">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <!-- Serial Number Header -->
            <th class="p-4 font-semibold text-gray-600 text-center w-16">#</th>
            
            <!-- Dynamic Headers -->
            <th 
              v-for="header in headers" 
              :key="header.key" 
              class="p-4 font-semibold text-gray-600 text-center whitespace-nowrap"
            >
              {{ header.label }}
            </th>
            
            <!-- Actions Header -->
            <th v-if="hasActions" class="p-4 font-semibold text-gray-600 text-center w-32">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="(item, index) in paginatedItems" :key="item.id || index" class="hover:bg-gray-50 transition-colors">
            <!-- Serial Number -->
            <td class="p-4 text-center text-gray-500 font-medium">
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </td>

            <!-- Data Columns -->
            <td 
              v-for="header in headers" 
              :key="header.key" 
              class="p-4 text-center text-sm"
              :class="header.class"
            >
              <!-- Slot for custom cell content -->
              <slot :name="header.key" :item="item" :value="item[header.key]">
                <!-- Default content -->
                <span class="text-gray-700">{{ item[header.key] || '-' }}</span>
              </slot>
            </td>

            <!-- Actions Column -->
            <td v-if="hasActions" class="p-4">
              <div class="flex items-center justify-center gap-3">
                <slot name="actions" :item="item">
                     <button v-if="hasEdit" @click="$emit('edit', item)" class="text-blue-600 hover:text-blue-800 transition-colors" title="Edit">
                        <Edit class="w-5 h-5" />
                    </button>
                    <button v-if="hasDelete" @click="$emit('delete', item.id)" class="text-red-500 hover:text-red-700 transition-colors" title="Delete">
                        <Trash2 class="w-5 h-5" />
                    </button>
                </slot>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="items.length > itemsPerPage"
      :currentPage="currentPage"
      :totalPages="totalPages"
      :totalQuestions="items.length"
      :questionsPerPage="itemsPerPage"
      :goToPage="goToPage"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Pagination from '@/components/pages/Pagination.vue';
import { Edit, Trash2 } from "lucide-vue-next";

const emit = defineEmits(['edit', 'delete']);

const props = defineProps({
  headers: {
    type: Array,
    required: true,
    // Expected format: [{ label: 'Name', key: 'name' }, ...]
  },
  items: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyMessage: {
    type: String,
    default: 'No data available.',
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  hasActions: {
    type: Boolean,
    default: true
  },
  hasEdit: {
    type: Boolean,
    default: true
  },
  hasDelete: {
    type: Boolean,
    default: true
  }
});


const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(props.items.length / props.itemsPerPage));

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return props.items.slice(start, end);
});

const goToPage = (page) => {
  currentPage.value = page;
};

// Reset pagination when items change (e.g. filtering)
watch(() => props.items, () => {
  currentPage.value = 1;
});
</script>
