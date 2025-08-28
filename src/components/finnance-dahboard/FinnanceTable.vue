<!-- SimpleTable.vue -->
<template>
  <div class="w-full overflow-x-auto bg-white rounded-2xl shadow-lg">
    <!-- Search Bar -->
    <div v-if="searchable" class="p-4">
      <div class="w-full  flex items-center gap-2 border shadow-md border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-1 focus-within:ring-indigo-500">
      <Search size="17"  class="text-primary"/>
        <input
          v-model="search"
          type="text"
          :placeholder="searchPlaceholder"
          class="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin border-4 border-indigo-500 border-t-transparent rounded-full w-10 h-10"></div>
    </div>

    <div v-else>
      <!-- Table -->
      <table class="min-w-[600px] w-full text-center ">
        <thead>
          <tr>
            <th
              v-for="header in headers"
              :key="header.key"
              class="px-4 py-3 text-center text-primary text-lg bg-indigo-100 font-bold"
            >
              {{ header.label }}
            </th>
          
          </tr>
        </thead>

        <tbody>
          <!-- Data Rows -->
          <tr
            v-for="(item, index) in paginatedData"
            :key="getRowKey(item, index)"
            class=" hover:bg-gray-50"
          >
          <td
  v-for="header in headers"
  :key="header.key"
  :class="[
    'px-6 py-4 text-gray-600',
    index !== paginatedData.length - 1 ? 'border-b' : ''
  ]"
>
  <!-- Custom Cell Slot -->
  <slot 
    :name="`cell-${header.key}`" 
    :item="item" 
    :value="getValueByPath(item, header.key)"
    :header="header"
    :index="index"
  >
    <span>{{ getValueByPath(item, header.key) }}</span>
  </slot>
</td>


            <!-- Actions Column -->
            <!-- <td v-if="showActions" class="px-6 py-4 flex gap-3 justify-center">
              <slot name="actions" :item="item" :index="index">
                <button
                  @click="$emit('edit', item)"
                  class="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="$emit('delete', item.id || item)"
                  class="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </slot>
            </td> -->
          </tr>

          <!-- No Search Results -->
          <tr v-if="filteredData.length === 0 && search.length > 0">
            <td :colspan="totalColumns" class="px-6 py-4 text-center font-bold text-gray-700">
              <slot name="no-search-results" :search="search">
                No results found for "{{ search }}".
              </slot>
            </td>
          </tr>

          <!-- No Data -->
          <tr v-if="filteredData.length === 0 && !search.length && !loading">
            <td :colspan="totalColumns" class="px-6 py-4 text-center font-bold text-gray-600">
              <slot name="no-data">
                No data found.
              </slot>
            </td>
          </tr>
        </tbody>
      </table>

 
    </div>

    
  </div>
     <Pagination
      :="currentPage"
      :total-pages="totalPages"
      :page-numbers="pageNumbers"
      @update:current-page="goToPage" />
</template>

<script setup>
import { Search } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import Pagination from '../pages/Pagination.vue'



const props = defineProps({
  data: { type: Array, required: true },
  headers: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  searchable: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: 'Search...' },
  showActions: { type: Boolean, default: true }
})




const emit = defineEmits(['edit', 'delete'])

const search = ref('')

const filteredData = computed(() => {
  if (!search.value) return props.data
  const searchQuery = search.value.toLowerCase()
  return props.data.filter(item =>
    props.headers.some(header => {
      const value = getValueByPath(item, header.key)
      return typeof value === 'string' && value.toLowerCase().includes(searchQuery)
    })
  )
})

const paginatedData = computed(() => filteredData.value)

const totalColumns = computed(() => props.headers.length + (props.showActions ? 1 : 0))

const getValueByPath = (obj, path) =>
  path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : ''), obj) || ''

const getRowKey = (item, index) => item.id || index
</script>
