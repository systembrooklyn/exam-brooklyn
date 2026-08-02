<template>
  <div class="min-h-screen w-full bg-gray-50/50 dark:bg-gray-900/50 py-4 sm:py-6 animate-fade-in">
    <div class="mx-auto w-full min-w-0 max-w-[1200px] px-4 sm:px-6 md:px-8">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Ticket class="w-6 h-6" />
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Tickets</h1>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
            {{ ticketsList.length }} tickets
          </span>
        </div>
        <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base leading-relaxed">
          Manage and track your support requests and issues.
        </p>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-auto">
        <!-- Refresh Button -->
        <button
          @click="refreshData"
          :disabled="pageLoading"
          class="inline-flex items-center justify-center p-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 cursor-pointer disabled:opacity-60"
          title="Refresh Tickets"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': pageLoading }" />
        </button>

        <router-link to="/tickets/new" class="buttons">
          <button class="btn"><span></span>
            <p data-start="good luck!" data-text="ADD!" data-title="new Ticket"></p>
          </button>
        </router-link>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="pageLoading" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm p-6 space-y-4 animate-pulse">
      <div class="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg w-1/4 mb-6"></div>
      <div class="space-y-3">
        <div v-for="i in 5" :key="i" class="flex gap-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
          <div class="h-5 w-5 bg-gray-100 dark:bg-gray-700 rounded-full flex-shrink-0 mt-1"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Filters Bar -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm p-4 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <!-- Status Tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
          <button
            @click="setStatusFilter(false)"
            :class="!filters.is_closed
              ? 'bg-white dark:bg-gray-650 text-emerald-650 dark:text-emerald-400 shadow-sm font-bold'
              : 'text-gray-500 hover:text-gray-750 dark:hover:text-gray-300 font-medium'"
            class="px-4 py-1.5 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CircleDot class="w-3.5 h-3.5" />
            Open
            <span
              :class="!filters.is_closed ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'"
              class="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full"
            >{{ openCount }}</span>
          </button>
          <button
            @click="setStatusFilter(true)"
            :class="filters.is_closed
              ? 'bg-white dark:bg-gray-650 text-purple-650 dark:text-purple-400 shadow-sm font-bold'
              : 'text-gray-500 hover:text-gray-750 dark:hover:text-gray-300 font-medium'"
            class="px-4 py-1.5 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CircleCheck class="w-3.5 h-3.5" />
            Closed
            <span
              :class="filters.is_closed ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'"
              class="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full"
            >{{ closedCount }}</span>
          </button>
        </div>

        <!-- Dropdowns & Date Filters -->
        <div class="flex flex-wrap items-center gap-2">
          <select
            v-model="filters.type"
            @change="fetchData"
            class="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            <option value="">All Types</option>
            <option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</option>
          </select>

          <select
            v-model="filters.category"
            @change="fetchData"
            class="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
          </select>

          <input
            type="date"
            v-model="filters.start_date"
            @change="onDateChange"
            title="Start Date"
            class="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          />
          <input
            type="date"
            v-model="filters.end_date"
            @change="onDateChange"
            title="End Date"
            class="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          />

          <!-- Unread Comments Toggle -->
          <button
            @click="toggleUnreadOnly"
            class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-sm"
            :class="filters.unread_only
              ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40'
              : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'"
          >
            <MessageSquare class="w-3.5 h-3.5" :class="{ 'fill-rose-500/10': filters.unread_only }" />
            <span>Unread Comments</span>
            <span v-if="unreadCurrentCount > 0"
              class="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full"
              :class="filters.unread_only
                ? 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-250'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'"
            >
              {{ unreadCurrentCount }}
            </span>
          </button>

          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      <!-- Tickets List Card -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <!-- Card Header Strip -->
        <div class="px-5 py-3 border-b border-gray-150 dark:border-gray-700/60 flex items-center gap-3">
          <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="filters.is_closed ? 'bg-purple-500' : 'bg-emerald-500'"></span>
          <span class="text-sm font-bold text-gray-900 dark:text-white">{{ filters.is_closed ? 'Closed' : 'Open' }} Tickets</span>
          <span class="text-xs text-gray-400 dark:text-gray-500">{{ ticketsList.length }} {{ ticketsList.length === 1 ? 'result' : 'results' }}</span>
        </div>

        <!-- Empty State -->
        <div v-if="!ticketsList || ticketsList.length === 0" class="px-6 py-16 text-center">
          <div class="flex flex-col items-center justify-center max-w-xs mx-auto space-y-4">
            <div class="p-4 rounded-full ring-8 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-400 ring-indigo-100/60 dark:ring-indigo-900/40">
              <Ticket class="w-8 h-8" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">No tickets found</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5">There aren't any tickets that match your current filters.</p>
            </div>
            <router-link
              to="/tickets/new"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
            >
              <Plus class="w-4 h-4" />
              Create new ticket
            </router-link>
          </div>
        </div>

        <!-- Ticket Rows -->
        <div v-else class="divide-y divide-gray-100 dark:divide-gray-700/50">
          <div
            v-for="ticket in ticketsList"
            :key="ticket.serial"
            class="px-5 py-4 flex gap-3 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all duration-150 cursor-pointer"
            @click="$router.push(`/tickets/${ticket.serial}`)"
          >
            <!-- Status Icon -->
            <div class="pt-0.5 flex-shrink-0">
              <CircleCheck v-if="ticket.status === 'closed' || ticket.is_closed" class="w-5 h-5 text-purple-500" />
              <CircleDot v-else class="w-5 h-5 text-emerald-500" :class="{ 'fill-emerald-500': !ticket.is_read }" />
            </div>

            <!-- Ticket Info -->
            <div class="flex-grow min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {{ ticket.desc ? truncate(ticket.desc, 80) : `Ticket #${ticket.serial}` }}
              </p>

              <div class="flex flex-wrap items-center gap-2 mt-1.5">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100/60">
                  #{{ ticket.serial }}
                </span>
                <span v-if="ticket.type" class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100/60">
                  {{ ticket.type }}
                </span>
                <span v-if="ticket.category" class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-100/60">
                  {{ ticket.category }}
                </span>
                <span class="inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                  created at {{ formatDate(ticket.created_at) }} by <span class="font-semibold text-gray-700 dark:text-gray-300 ml-0.5">{{ ticket.user.name }}</span>
                </span>
                <span
                  @click.stop="copyEmail(ticket.user.email)"
                  class="inline-flex items-center gap-1 text-[10px] text-gray-450 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer bg-gray-50 dark:bg-gray-750 px-1.5 py-0.5 rounded-lg border border-gray-150 dark:border-gray-700/50 transition-all font-medium"
                  title="Click to copy email"
                >
                  <Mail class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  {{ ticket.user.email }}
                </span>
                <span v-if="ticket.comments_count"
                  class="relative flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-lg border transition-colors"
                  :class="ticket.has_unread_comments
                    ? 'bg-rose-50 text-rose-650 dark:bg-rose-950/20 dark:text-rose-400 border-rose-150 dark:border-rose-900/40 font-bold shadow-sm'
                    : 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-750 border-gray-150 dark:border-gray-700/50'"
                  :title="ticket.has_unread_comments ? 'Unread comments available' : 'Comments count'"
                >
                  <MessageSquare class="w-3 h-3" :class="{ 'fill-rose-500/10': ticket.has_unread_comments }" />
                  {{ ticket.comments_count }}

                  <!-- Red dot indicator for unread comments -->
                  <span v-if="ticket.has_unread_comments" class="absolute -top-1 -right-1 flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                </span>
                <span v-if="getOtherReaders(ticket.readers, ticket.user).length"
                  class="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-750 px-1.5 py-0.5 rounded-lg border border-gray-150 dark:border-gray-700/50"
                  :title="getOtherReaders(ticket.readers, ticket.user).map(formatReaderNameWithTime).join('\n')"
                >
                  <Eye class="w-3 h-3" />
                  Seen by: {{ getOtherReaders(ticket.readers, ticket.user).map(formatReaderName).join(', ') }}
                </span>
              </div>
            </div>

            <!-- Rating Badge (Only for Closed Tickets) -->
            <div v-if="ticket.status === 'closed' || ticket.is_closed" class="flex-shrink-0 flex items-center mr-1">
              <div v-if="ticket.evaluate" class="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 rounded-xl px-2.5 py-1 text-xs font-bold">
                <Star class="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{{ ticket.evaluate }} / 10</span>
              </div>
              <div v-else-if="isTicketOwner(ticket)" class="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border border-gray-150 dark:border-gray-700 rounded-xl px-2.5 py-1 text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 hover:border-indigo-150 transition-colors">
                <Star class="w-3.5 h-3.5" />
                <span>Rate Now</span>
              </div>
            </div>

            <!-- Chevron -->
            <div class="flex-shrink-0 flex items-center text-gray-300 dark:text-gray-600">
              <ChevronRight class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Ticket, CircleDot, CircleCheck, ChevronRight, Plus, X, MessageSquare, Star, Mail, RefreshCw, Eye } from 'lucide-vue-next';
import { useTicketsStore } from '@/stores/ticketsStore';
import { useAuthStore } from '@/stores/auth';
import notyf from '@/components/global/notyf';

const router = useRouter();
const store = useTicketsStore();
const authStore = useAuthStore();

const pageLoading = ref(false);

const filters = reactive({
  is_closed: false,
  type: '',
  category: '',
  start_date: '',
  end_date: '',
  unread_only: false,
});

const ticketsList = computed(() => {
  let list = filters.is_closed ? store.closedTickets : store.openTickets;
  if (filters.unread_only) {
    list = list.filter(t => t.has_unread_comments);
  }
  return list;
});

const openCount = computed(() => {
  let list = store.openTickets;
  if (filters.unread_only) {
    list = list.filter(t => t.has_unread_comments);
  }
  return list.length;
});
const closedCount = computed(() => {
  let list = store.closedTickets;
  if (filters.unread_only) {
    list = list.filter(t => t.has_unread_comments);
  }
  return list.length;
});

const hasActiveFilters = computed(() =>
  filters.type || filters.category || filters.start_date || filters.end_date || filters.unread_only
);

const buildParams = () => {
  // Open tickets → no is_closed param at all
  // Closed tickets → is_closed=1
  const params = {};

  if (filters.is_closed) {
    params.is_closed = 1;
  }
  // Always add the other filters if set
  if (filters.type) params.type = filters.type;
  if (filters.category) params.category = filters.category;
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;

  return params;
};

const typeOptions = computed(() => {
  const meta = store.metaOptions;
  return meta?.type || meta?.types || [];
});

const categoryOptions = computed(() => {
  const meta = store.metaOptions;
  return meta?.category || meta?.categories || [];
});

const getOtherReaders = (readers, ticketOwner) => {
  if (!readers || !Array.isArray(readers)) return [];
  const currentUser = authStore.user;
  return readers.filter(r => {
    const isSelf = currentUser && (
      (currentUser.id && r.id && String(currentUser.id) === String(r.id)) ||
      (currentUser.fingerPrint && r.fingerprint && String(currentUser.fingerPrint) === String(r.fingerprint)) ||
      (currentUser.fingerprint && r.fingerprint && String(currentUser.fingerprint) === String(r.fingerprint)) ||
      (currentUser.name && r.name && currentUser.name.trim().toLowerCase() === r.name.trim().toLowerCase()) ||
      (currentUser.email && r.email && currentUser.email.trim().toLowerCase() === r.email.trim().toLowerCase())
    );

    const isOwner = ticketOwner && (
      (ticketOwner.id && r.id && String(ticketOwner.id) === String(r.id)) ||
      (ticketOwner.fingerPrint && r.fingerprint && String(ticketOwner.fingerPrint) === String(r.fingerprint)) ||
      (ticketOwner.fingerprint && r.fingerprint && String(ticketOwner.fingerprint) === String(r.fingerprint)) ||
      (ticketOwner.name && r.name && ticketOwner.name.trim().toLowerCase() === r.name.trim().toLowerCase()) ||
      (ticketOwner.email && r.email && ticketOwner.email.trim().toLowerCase() === r.email.trim().toLowerCase())
    );

    return !isSelf && !isOwner;
  });
};

const formatReaderName = (r) => {
  return `${r.name}${r.fingerprint ? '_' + r.fingerprint : ''}`;
};

const formatReaderNameWithTime = (r) => {
  if (!r.read_at) return formatReaderName(r);
  const timeStr = new Date(r.read_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  return `${formatReaderName(r)} at ${timeStr}`;
};

const toggleUnreadOnly = () => {
  filters.unread_only = !filters.unread_only;
};

const unreadCurrentCount = computed(() => {
  const list = filters.is_closed ? store.closedTickets : store.openTickets;
  return list.filter(t => t.has_unread_comments).length;
});

const refreshData = async () => {
  pageLoading.value = true;
  try {
    const params = buildParams();
    await store.fetchTickets(params);
    await store.fetchMetaOptions();
  } catch (e) {
    console.error(e);
  } finally {
    pageLoading.value = false;
  }
};

const fetchData = async () => {
  const params = buildParams();
  const paramsStr = JSON.stringify(params);

  pageLoading.value = true;
  try {
    if (filters.is_closed) {
      if (store.lastClosedFilters !== paramsStr) {
        await store.fetchTickets(params);
      }
    } else {
      if (store.lastOpenFilters !== paramsStr) {
        await store.fetchTickets(params);
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    pageLoading.value = false;
  }
};

const onDateChange = () => {
  const start = filters.start_date;
  const end = filters.end_date;
  if ((start && end) || (!start && !end)) {
    fetchData();
  }
};

const setStatusFilter = (isClosed) => {
  filters.is_closed = isClosed;
  fetchData();
};

const clearFilters = () => {
  filters.type = '';
  filters.category = '';
  filters.start_date = '';
  filters.end_date = '';
  filters.unread_only = false;
  fetchData();
};

onMounted(async () => {
  pageLoading.value = true;
  try {
    await store.fetchMetaOptions();
    // Fetch both sets in parallel on mount to populate tabs and cache them
    await Promise.all([
      store.fetchTickets({}), // Open
      store.fetchTickets({ is_closed: 1 }) // Closed
    ]);
  } catch (e) {
    console.error(e);
  } finally {
    pageLoading.value = false;
  }
});

const stripHtml = (html) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const truncate = (text, length) => {
  if (!text) return '';
  const cleanText = stripHtml(text);
  return cleanText.length > length ? cleanText.substring(0, length) + '...' : cleanText;
};

const formatDate = (dateString) => {
  if (!dateString) return 'recently';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const copyEmail = (email) => {
  if (!email) return;
  navigator.clipboard.writeText(email);
  notyf.success('Email copied to clipboard!');
};

const isTicketOwner = (ticket) => {
  const currentUser = authStore.user;
  if (!currentUser || !ticket?.user) return false;
  return currentUser.id === ticket.user.id || currentUser.email === ticket.user.email;
};
</script>
