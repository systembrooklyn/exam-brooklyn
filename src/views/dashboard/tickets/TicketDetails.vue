<template>
  <div class="min-h-screen w-full bg-gray-50/50 dark:bg-gray-900/50 py-4 sm:py-6 animate-fade-in">
    <div class="mx-auto w-full min-w-0 max-w-[1200px] px-4 sm:px-6 md:px-8">

    <!-- Loading Skeleton -->
    <div v-if="store.loading && !store.currentTicket"
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm p-6 space-y-4 animate-pulse">
      <div class="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg w-1/3"></div>
      <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
      <div class="space-y-3 mt-4">
        <div v-for="i in 4" :key="i" class="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
      </div>
    </div>

    <template v-else-if="store.currentTicket">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div>
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <router-link to="/tickets"
              class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">Tickets</router-link>
            <ChevronRight class="w-3.5 h-3.5" />
            <span>#{{ store.currentTicket.serial }}</span>
          </div>

          <h1
            class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3 flex-wrap">
            Ticket #{{ store.currentTicket.serial }}
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold text-white"
              :class="isClosed ? 'bg-purple-600' : 'bg-emerald-500'">
              <CircleCheck v-if="isClosed" class="w-4 h-4" />
              <CircleDot v-else class="w-4 h-4" />
              {{ isClosed ? 'Closed' : 'Open' }}
            </span>
          </h1>

          <div class="flex items-center flex-wrap gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Opened {{ formatDate(store.currentTicket.created_at) }} by <strong
                class="text-gray-700 dark:text-gray-300">{{ store.currentTicket.user?.name || 'User' }}<span
                  v-if="store.currentTicket.user?.fingerPrint">_{{ store.currentTicket.user?.fingerPrint }}</span></strong></span>
            <span v-if="store.currentTicket.comments?.length" class="flex items-center gap-1">
              <span class="text-gray-300 dark:text-gray-600">•</span>
              <MessageSquare class="w-3.5 h-3.5" />
              {{ store.currentTicket.comments.length }} comments
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 self-start">
          <button
            @click="loadTicket(store.currentTicket.serial)"
            :disabled="store.loading"
            class="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 cursor-pointer disabled:opacity-60"
            title="Refresh Ticket"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': store.loading }" />
          </button>

          <router-link to="/tickets/new">
            <button
              class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 cursor-pointer">
              <Plus class="w-4 h-4" />
              New Ticket
            </button>
          </router-link>
        </div>
      </div>

      <!-- Main Content: Thread + Sidebar -->
      <div class="flex flex-col lg:flex-row gap-6">

        <!-- Thread Column -->
        <div class="flex-grow lg:w-3/4 space-y-6 relative pl-8 before:absolute before:top-4 before:bottom-4 before:left-4 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">

          <!-- Original Post -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm relative">
            <!-- Timeline Dot -->
            <div class="absolute -left-7 top-4 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 z-10">
              <FileText class="w-3.5 h-3.5" />
            </div>
            <div
              class="px-5 py-3 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-t-[15px]">
              <span class="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                <FileText class="w-3.5 h-3.5" />
              </span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ store.currentTicket.user?.name || 'User' }}<span v-if="store.currentTicket.user?.fingerPrint">_{{ store.currentTicket.user?.fingerPrint }}</span>
                <span class="font-normal text-gray-500 dark:text-gray-400 ml-1">requested</span>
              </span>
              <span class="text-xs text-gray-400 dark:text-gray-500 ml-auto">{{
                formatDate(store.currentTicket.created_at) }}</span>
            </div>
            <div class="p-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap select-text editor-content" v-html="store.currentTicket.desc || 'No description provided.'">
            </div>
            <!-- Meta (URL, Attachment) -->
            <div v-if="store.currentTicket.url || store.currentTicket.attachment_url"
              class="px-5 pb-4 flex flex-col gap-2">
              <div v-if="store.currentTicket.url"
                class="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                <Link class="w-3.5 h-3.5 flex-shrink-0" />
                <a :href="store.currentTicket.url" target="_blank" class="hover:underline truncate">{{
                  store.currentTicket.url }}</a>
              </div>
              <div v-if="store.currentTicket.attachment_url"
                class="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                <Paperclip class="w-3.5 h-3.5 flex-shrink-0" />
                <a :href="store.currentTicket.attachment_url" target="_blank" class="hover:underline">View
                  Attachment</a>
              </div>
            </div>
          </div>

          <!-- Comment Timeline -->
          <div v-for="comment in store.currentTicket.comments" :key="comment.id"
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm relative">
            <!-- Timeline Dot -->
            <div class="absolute -left-7 top-4 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 z-10">
              <MessageSquare class="w-3.5 h-3.5" />
            </div>
            <div
              class="px-5 py-3 border-b border-gray-100 dark:border-gray-700/60 flex items-center gap-3 bg-gray-50/40 dark:bg-gray-900/20 rounded-t-[15px]">
              <span
                class="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                {{ (comment.user?.name || comment.author_name || 'U').charAt(0).toUpperCase() }}
              </span>
              <!-- {{ comment.user?.fingerPrint }}   -->
              <span class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ comment.user?.name || comment.author_name || 'Support Team' }}<span v-if="comment.user?.fingerPrint">_{{ comment.user?.fingerPrint }}</span>
              </span>
              <span class="text-xs text-gray-400 dark:text-gray-500 ml-auto">{{ formatDate(comment.created_at) }}</span>
            </div>
            <div class="p-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap select-text editor-content" v-html="comment.body">
            </div>
            <div v-if="comment.attachment_url" class="px-5 pb-4">
              <a :href="comment.attachment_url" target="_blank"
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                <Paperclip class="w-3.5 h-3.5" />
                View Attachment
              </a>
            </div>
            <!-- Seen by section -->
            <div v-if="getOtherReaders(comment.readers, comment.user || comment.author_name).length"
              class="px-5 pb-4 -mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
              <Eye class="w-3.5 h-3.5 flex-shrink-0" />
              <span class="font-medium text-gray-500 dark:text-gray-400">Seen by:</span>
              <span v-for="(r, idx) in getOtherReaders(comment.readers, comment.user || comment.author_name)" :key="r.id" class="inline-flex items-center gap-1">
                <span class="font-medium text-gray-650 dark:text-gray-300">{{ formatReaderName(r) }}</span>
                <span class="text-[10px] text-gray-450 dark:text-gray-500">at {{ formatDate(r.read_at) }}</span>
                <span v-if="idx < getOtherReaders(comment.readers, comment.user || comment.author_name).length - 1" class="text-gray-300 dark:text-gray-700 ml-1">•</span>
              </span>
            </div>
          </div>

          <!-- Closed Banner -->
          <div v-if="isClosed"
            class="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
            <!-- Timeline Dot -->
            <div class="absolute -left-7 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-950 border border-purple-250 dark:border-purple-800 flex items-center justify-center text-purple-600 z-10">
              <CircleCheck class="w-3.5 h-3.5" />
            </div>
            <div class="flex items-center gap-3">
              <CircleCheck class="w-5 h-5 text-purple-500 flex-shrink-0" />
              <div>
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">This ticket has been closed.</p>
                <p v-if="showReopenButton" class="text-xs text-purple-600 dark:text-purple-400 font-medium mt-0.5">
                  Time remaining to reopen: <span class="font-mono font-bold">{{ remainingTimeText }}</span>
                </p>
                <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Permanently Closed</p>
              </div>
            </div>

            <!-- Reopen Button -->
            <button
              v-if="showReopenButton"
              @click="reopenTicket"
              :disabled="store.loading"
              class="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow-sm shadow-purple-600/10"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              Reopen Ticket
            </button>
          </div>

          <!-- Add Comment Box (only when open) -->
          <div v-if="!isClosed"
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm relative">
            <!-- Timeline Dot -->
            <div class="absolute -left-7 top-4 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 z-10">
              <Plus class="w-3.5 h-3.5" />
            </div>
            <!-- Card Header -->
            <div
              class="px-6 py-5 border-b border-gray-100 dark:border-gray-700/60 flex items-center gap-3 bg-gradient-to-r from-indigo-50/30 to-white dark:from-indigo-950/15 dark:to-gray-800 rounded-t-[15px]">
              <span class="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <MessageSquare class="w-4 h-4" />
              </span>
              <div>
                <h3 class="text-sm font-bold text-gray-900 dark:text-white leading-none">Add a Comment</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave a reply or update on this ticket.</p>
              </div>
            </div>

            <form @submit.prevent="submitComment" class="px-6 py-5 space-y-4">
              <!-- Body -->
              <div>
                <label
                  class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Comment</label>
                <WhatsAppEditor
                  v-model="commentForm.body"
                  placeholder="Write your comment here..."
                />
              </div>

              <!-- Attachment -->
              <div>
                <label
                  class="cursor-pointer inline-flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Paperclip class="w-3.5 h-3.5" />
                  Attach a file
                  <input type="file" class="sr-only" @change="handleCommentFile" />
                </label>
                <span v-if="commentFile" class="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">{{
                  commentFile.name }}</span>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                <button v-if="authStore.can('can-close-ticket')" type="button" @click="closeTicket" :disabled="store.loading"
                  class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-850 dark:hover:text-white bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer disabled:opacity-60">
                  <CircleCheck class="w-4 h-4 text-purple-500" />
                  Close Ticket
                </button>
                <button type="submit" :disabled="store.loading || !commentForm.body.trim()"
                  class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-600/10">
                  <span v-if="store.loading"
                    class="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Comment
                </button>
              </div>
            </form>
          </div>

          <!-- Evaluation Section -->
          <div v-if="isClosed && !store.currentTicket.evaluate && isTicketOwner"
            class="bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-amber-900/50 shadow-sm relative">
            <!-- Timeline Dot -->
            <div class="absolute -left-7 top-4 w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-550 dark:text-amber-400 z-10">
              <Star class="w-3.5 h-3.5" />
            </div>
            <div
              class="px-6 py-5 border-b border-amber-100 dark:border-amber-900/50 flex items-center gap-3 bg-amber-50/40 dark:bg-amber-950/20 rounded-t-[15px]">
              <span class="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl">
                <Star class="w-4 h-4" />
              </span>
              <div>
                <h3 class="text-sm font-bold text-gray-900 dark:text-white leading-none">Rate Your Experience</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">How was your support experience? Rate from 1 to
                  10.</p>
              </div>
            </div>
            <div class="px-6 py-5">
              <div class="flex flex-wrap gap-2 justify-center">
                <button v-for="i in 10" :key="i" @click="submitEvaluation(i)" :disabled="store.loading || submittingScore !== null"
                  class="w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-110 cursor-pointer disabled:opacity-60 flex items-center justify-center"
                  :class="submittingScore === i
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : evalHover === i
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : i <= 3 ? 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/40'
                        : i <= 7 ? 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'"
                  @mouseover="evalHover = i" @mouseleave="evalHover = null">
                  <span v-if="submittingScore === i" class="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span v-else>{{ i }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Evaluation Done -->
          <div v-if="store.currentTicket.evaluate"
            class="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl px-5 py-4 flex items-center gap-3 relative">
            <!-- Timeline Dot -->
            <div class="absolute -left-7 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-450 z-10">
              <Star class="w-3.5 h-3.5 text-amber-500" />
            </div>
            <Star class="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              <template v-if="isTicketOwner">
                You rated this ticket <strong>{{ store.currentTicket.evaluate }} / 10</strong>. Thank you for your feedback!
              </template>
              <template v-else>
                {{ store.currentTicket.user?.name || 'The user' }} rated this ticket <strong>{{ store.currentTicket.evaluate }} / 10</strong>.
              </template>
            </span>
          </div>
        </div>

        <!-- Sidebar Column -->
        <div class="lg:w-1/4 space-y-4 lg:sticky lg:top-6 self-start">
          <!-- Info Card -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/40 dark:bg-gray-900/20">
              <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Ticket
                Info</span>
            </div>
            <div class="px-4 py-4 space-y-4 text-sm">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Status
                </p>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                  :class="isClosed ? 'bg-purple-600' : 'bg-emerald-500'">
                  <CircleCheck v-if="isClosed" class="w-3.5 h-3.5" />
                  <CircleDot v-else class="w-3.5 h-3.5" />
                  {{ isClosed ? 'Closed' : 'Open' }}
                </span>
              </div>

              <div>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Type</p>
                <span v-if="store.currentTicket.type"
                  class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100/60">
                  {{ store.currentTicket.type }}
                </span>
                <span v-else class="text-gray-400 text-xs">—</span>
              </div>

              <div>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Category
                </p>
                <span v-if="store.currentTicket.category"
                  class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-100/60">
                  {{ store.currentTicket.category }}
                </span>
                <span v-else class="text-gray-400 text-xs">—</span>
              </div>

              <div>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Serial
                </p>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100/60">
                  #{{ store.currentTicket.serial }}
                </span>
              </div>

              <div>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Created
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400">{{ formatDate(store.currentTicket.created_at) }}</p>
              </div>

              <div v-if="store.currentTicket.evaluate">
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Rating
                </p>
                <div class="flex items-center gap-1">
                  <Star class="w-3.5 h-3.5 text-amber-400" />
                  <span class="text-xs font-bold text-gray-800 dark:text-gray-200">{{ store.currentTicket.evaluate }}
                    / 10</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </template>

    <!-- Not Found -->
    <div v-else-if="!store.loading" class="flex flex-col items-center justify-center py-24 gap-4">
      <div
        class="p-4 rounded-full ring-8 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-400 ring-indigo-100/60 dark:ring-indigo-900/40">
        <Ticket class="w-8 h-8" />
      </div>
      <h3 class="text-base font-semibold text-gray-900 dark:text-white">Ticket not found</h3>
      <router-link to="/tickets"
        class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">← Back to all
        tickets</router-link>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ChevronRight, CircleDot, CircleCheck, MessageSquare, Plus,
  FileText, Link, Paperclip, Star, Ticket, RotateCcw, Eye, RefreshCw
} from 'lucide-vue-next';
import { useTicketsStore } from '@/stores/ticketsStore';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';
import WhatsAppEditor from '@/components/global/WhatsAppEditor.vue';

const route = useRoute();
const router = useRouter();
const store = useTicketsStore();
const authStore = useAuthStore();

const commentForm = ref({ body: '' });
const commentFile = ref(null);
const evalHover = ref(null);

const isClosed = computed(() => {
  return store.currentTicket?.status === 'closed' || store.currentTicket?.is_closed;
});

const isTicketOwner = computed(() => {
  const currentUser = authStore.user;
  const ticketUser = store.currentTicket?.user;
  if (!currentUser || !ticketUser) return false;
  return currentUser.id === ticketUser.id || currentUser.email === ticketUser.email;
});

const getOtherReaders = (readers, commentOwner) => {
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

    const isAuthor = commentOwner && (
      (commentOwner.id && r.id && String(commentOwner.id) === String(r.id)) ||
      (commentOwner.fingerPrint && r.fingerprint && String(commentOwner.fingerPrint) === String(r.fingerprint)) ||
      (commentOwner.fingerprint && r.fingerprint && String(commentOwner.fingerprint) === String(r.fingerprint)) ||
      (commentOwner.name && r.name && commentOwner.name.trim().toLowerCase() === r.name.trim().toLowerCase()) ||
      (commentOwner.email && r.email && commentOwner.email.trim().toLowerCase() === r.email.trim().toLowerCase())
    );

    const matchesAuthorName = !isAuthor && r.name && (
      (typeof commentOwner === 'string' && commentOwner.trim().toLowerCase() === r.name.trim().toLowerCase()) ||
      (commentOwner && typeof commentOwner === 'object' && commentOwner.author_name && String(commentOwner.author_name).trim().toLowerCase() === r.name.trim().toLowerCase())
    );

    return !isSelf && !isAuthor && !matchesAuthorName;
  });
};

const formatReaderName = (r) => {
  return `${r.name}${r.fingerprint ? '_' + r.fingerprint : ''}`;
};

const loadTicket = (serial) => {
  store.currentTicket = null;
  store.fetchTicketBySerial(serial);
};

onMounted(() => {
  const serial = route.params.serial;
  if (serial) loadTicket(serial);
});

watch(
  () => route.params.serial,
  (newSerial) => {
    if (newSerial) loadTicket(newSerial);
  }
);

onUnmounted(() => {
  store.currentTicket = null;
});

const formatDate = (dateString) => {
  if (!dateString) return 'recently';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const truncate = (text, length) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

const handleCommentFile = (event) => {
  const f = event.target.files?.[0];
  if (f) commentFile.value = f;
};

const submitComment = async () => {
  if (!commentForm.value.body.trim()) return;
  const formData = new FormData();
  formData.append('body', commentForm.value.body);
  if (commentFile.value) formData.append('attachment', commentFile.value);
  try {
    await store.addComment(store.currentTicket.serial, formData);
    commentForm.value.body = '';
    commentFile.value = null;
  } catch (e) {
    console.error(e);
  }
};

const closeTicket = async () => {
  const result = await Swal.fire({
    title: 'Close this ticket?',
    text: 'This action will mark the ticket as closed.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#7c3aed',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, close it!',
    cancelButtonText: 'Cancel',
  });
  if (result.isConfirmed) {
    try {
      await store.changeTicketStatus(store.currentTicket.serial, 'closed');
      if (store.currentTicket) store.currentTicket.is_closed = true;
    } catch (e) {
      console.error(e);
    }
  }
};

const submittingScore = ref(null);

const submitEvaluation = async (score) => {
  submittingScore.value = score;
  try {
    await store.evaluateTicket(store.currentTicket.serial, score);
    if (store.currentTicket) store.currentTicket.evaluate = score;
    Swal.fire({
      icon: 'success',
      title: 'Thank You!',
      text: `You rated this ticket ${score}/10.`,
      confirmButtonColor: '#4f46e5',
    });
  } catch (e) {
    console.error(e);
  } finally {
    submittingScore.value = null;
  }
};

const remainingTimeText = ref('');
const showReopenButton = ref(false);
let timerId = null;

const updateCountdown = () => {
  if (!store.currentTicket || !isClosed.value) {
    showReopenButton.value = false;
    remainingTimeText.value = '';
    return;
  }

  let closedStatus = store.currentTicket.latest_status;
  if (!closedStatus || closedStatus.status !== 'closed') {
    const historyClosed = store.currentTicket.statuses_history?.find(s => s.status === 'closed');
    if (!historyClosed) {
      showReopenButton.value = false;
      remainingTimeText.value = '';
      return;
    }
    closedStatus = historyClosed;
  }

  const closedAt = new Date(closedStatus.action_at || closedStatus.created_at).getTime();
  const now = new Date().getTime();
  const limit = 24 * 60 * 60 * 1000; // 24 hours in ms
  const remaining = limit - (now - closedAt);

  if (remaining > 0) {
    showReopenButton.value = true;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    remainingTimeText.value = `${hours}h ${minutes}m ${seconds}s`;
  } else {
    showReopenButton.value = false;
    remainingTimeText.value = 'Permanently Closed';
  }
};

const reopenTicket = async () => {
  const result = await Swal.fire({
    title: 'Reopen this ticket?',
    text: 'Do you want to open this ticket again?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#7c3aed',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, reopen it!',
    cancelButtonText: 'Cancel',
  });
  if (result.isConfirmed) {
    try {
      await store.changeTicketStatus(store.currentTicket.serial, 'open');
      Swal.fire({
        icon: 'success',
        title: 'Ticket Reopened',
        text: 'This ticket is now active again.',
        confirmButtonColor: '#4f46e5',
      });
    } catch (e) {
      console.error(e);
    }
  }
};

watch(
  () => store.currentTicket,
  (ticket) => {
    if (timerId) clearInterval(timerId);
    if (ticket && (ticket.status === 'closed' || ticket.is_closed)) {
      updateCountdown();
      timerId = setInterval(updateCountdown, 1000);
    } else {
      showReopenButton.value = false;
      remainingTimeText.value = '';
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
});
</script>
