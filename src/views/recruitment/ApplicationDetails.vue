<template>
  <!-- Loading State -->
  <div v-if="store.loading && !app" class="flex flex-col items-center justify-center min-h-[400px]">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
    <p class="text-sm text-gray-400 font-medium">Loading application details...</p>
  </div>

  <div class="space-y-6 animate-fade-in max-w-6xl mx-auto" v-else-if="app">

    <!-- Header / Navigation -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
      <div class="flex items-center gap-3">
        <button @click="$router.back()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
          <ArrowLeft class="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Application Details
          </h1>
          <p class="text-gray-500 text-sm mt-0.5">
            Track and progress candidate <strong class="text-indigo-600">{{ candidateName }}</strong>
            for <strong class="text-gray-700">{{ app.job_post?.title }}</strong>
          </p>
        </div>
      </div>

      <!-- General Application State Actions -->
      <div class="flex items-center gap-2">
        <button
          v-if="app.status === 'active' && authStore.can('assign-recruiter')"
          @click="showAssignModal = true"
          class="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <User class="w-4 h-4 text-gray-400" />
          {{ app.assigned_recruiter ? 'Change Recruiter' : 'Assign Recruiter' }}
        </button>

        <button
          v-if="app.status === 'active' && authStore.can('reject-applications')"
          @click="openRejectModal"
          class="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/50 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <XCircle class="w-4 h-4" /> Reject
        </button>

        <button
          v-if="app.status === 'active' && authStore.can('withdraw-applications')"
          @click="openWithdrawModal"
          class="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200/50 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <CornerUpLeft class="w-4 h-4" /> Withdraw
        </button>

        <button
          v-if="app.status === 'active' && authStore.can('hire-candidate')"
          @click="handleHire"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <CheckCircle2 class="w-4 h-4" /> Hire Candidate
        </button>
      </div>
    </div>

    <!-- Stepper / Pipeline Progress -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wide">Recruitment Pipeline Stages</h3>
      <div class="flex items-center w-full justify-between flex-wrap gap-4 pt-2">
        <div
          v-for="(stg, idx) in stages"
          :key="stg.id"
          class="flex items-center flex-1 min-w-[120px] relative group"
        >
          <!-- Stage Node -->
          <button
            @click="handleMoveStage(stg)"
            :disabled="!authStore.can('move-application-stage') || app.status !== 'active'"
            class="flex items-center gap-2 text-left focus:outline-none transition-all disabled:opacity-80"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors"
              :class="stageNodeClass(stg, idx)"
            >
              <Check v-if="isStageCompleted(stg, idx)" class="w-4 h-4" />
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-800 leading-tight">{{ stg.name }}</p>
              <p class="text-[10px] text-gray-400 mt-0.5">
                {{ isStageCurrent(stg) ? 'Current Stage' : isStageCompleted(stg, idx) ? 'Completed' : 'Upcoming' }}
              </p>
            </div>
          </button>

          <!-- Divider Line -->
          <div
            v-if="idx < stages.length - 1"
            class="hidden md:block h-0.5 flex-1 mx-4 bg-gray-100"
            :class="{ 'bg-emerald-500': isStageCompleted(stages[idx + 1], idx + 1) || isStageCurrent(stages[idx + 1]) }"
          />
        </div>
      </div>
    </div>

    <!-- Main Content Section (Split Columns) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Left Sidebar: Candidate details overview -->
      <div class="space-y-6 lg:col-span-1">

        <!-- Candidate Overview Box -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-lg flex items-center justify-center">
                {{ candidateInitials }}
              </div>
              <div>
                <h2 class="font-bold text-gray-900 text-lg">
                  {{ candidateName }}
                </h2>
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-1"
                  :class="store.statusMeta(app.status).cls"
                >
                  {{ store.statusMeta(app.status).label }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick contact details -->
          <div class="space-y-2.5 text-sm text-gray-600 border-t border-gray-50 pt-4">
            <p class="flex items-center gap-2">
              <Mail class="w-4 h-4 text-gray-400" />
              {{ app.candidate?.email }}
            </p>
            <p class="flex items-center gap-2">
              <Phone class="w-4 h-4 text-gray-400" />
              {{ app.candidate?.phone }}
            </p>
            <p class="flex items-center gap-2" v-if="app.candidate?.linkedin">
              <Linkedin class="w-4 h-4 text-indigo-500" />
              <a :href="app.candidate?.linkedin" target="_blank" class="text-indigo-600 hover:underline">
                LinkedIn Profile
              </a>
            </p>
          </div>

          <!-- Recruiter Assignment details -->
          <div class="border-t border-gray-50 pt-4 space-y-2">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wide">Assigned Recruiter</p>
            <div class="flex items-center gap-2" v-if="app.assigned_recruiter">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                {{ (app.assigned_recruiter.name || 'R')[0] }}
              </div>
              <span class="text-sm font-semibold text-gray-700">{{ app.assigned_recruiter.name }}</span>
            </div>
            <p v-else class="text-xs text-gray-400">No recruiter assigned yet.</p>
          </div>

          <!-- View full Profile button -->
          <div class="pt-2">
            <button
              @click="$router.push({ name: 'recruitment-candidate-profile', params: { id: app.candidate?.id } })"
              class="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-xs font-semibold border border-gray-200/60 transition-colors"
            >
              View Full Profile
            </button>
          </div>
        </div>

        <!-- Selected Job Listing Box -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wide">Job Position Listing</h3>
          <div class="space-y-3">
            <div>
              <p class="text-sm font-bold text-gray-900">{{ app.job_post?.title }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Location: {{ app.job_post?.location || 'Remote' }}</p>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-2 border-t border-gray-50">
              <div>
                <span class="block text-gray-400">Type</span>
                <span class="font-semibold text-gray-700 capitalize">{{ (app.job_post?.employment_type || '').replace('_', ' ') }}</span>
              </div>
              <div>
                <span class="block text-gray-400">Deadline</span>
                <span class="font-semibold text-gray-700">{{ app.job_post?.deadline ? formatDate(app.job_post.deadline) : 'No Deadline' }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Tab Panels: Interviews, Offer, Activity Log -->
      <div class="space-y-6 lg:col-span-2">

        <!-- Tabs Navigation -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="flex border-b border-gray-100 bg-gray-50/50">
            <button
              v-for="t in tabs"
              :key="t.value"
              @click="activeTab = t.value"
              class="flex-1 py-3 text-center text-sm font-semibold transition-all border-b-2 outline-none cursor-pointer"
              :class="activeTab === t.value ? 'text-indigo-600 border-indigo-600 bg-white' : 'text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-100/30'"
            >
              {{ t.label }}
            </button>
          </div>

          <!-- Tab Content Panel -->
          <div class="p-6">

            <!-- Tab 1: Interviews -->
            <div v-if="activeTab === 'interviews'" class="space-y-5 animate-fade-in">
              <div class="flex justify-between items-center pb-2">
                <h4 class="text-sm font-bold text-gray-800 uppercase tracking-wide">Interviews History</h4>
                <button
                  v-if="authStore.can('create-interviews') && app.status === 'active'"
                  @click="openScheduleModal"
                  class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus class="w-3.5 h-3.5" /> Schedule Interview
                </button>
              </div>

              <!-- List of interviews -->
              <div v-if="interviewsList.length === 0" class="text-center py-8 text-gray-400 text-sm">
                <Clock class="w-8 h-8 text-gray-300 mx-auto mb-2" />
                No interviews scheduled yet.
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="iv in interviewsList"
                  :key="iv.id"
                  class="border border-gray-100 rounded-xl p-4 bg-gray-50/30 space-y-3"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-bold text-gray-800 text-sm">{{ iv.interview_stage?.name || 'Interview' }}</p>
                      <p class="text-xs text-gray-400 mt-0.5">
                        Scheduled at: {{ formatDate(iv.scheduled_at, true) }}
                      </p>
                    </div>
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
                      :class="interviewResultBadge(iv.result).cls"
                    >
                      {{ interviewResultBadge(iv.result).label }}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 border-t border-gray-50/50 pt-2.5">
                    <p class="flex items-center gap-1">
                      <User class="w-3.5 h-3.5 text-gray-400" />
                      Interviewer: {{ iv.interviewer?.name || 'Not assigned' }}
                    </p>
                    <p class="flex items-center gap-1" v-if="iv.meeting_link">
                      <Globe class="w-3.5 h-3.5 text-indigo-400" />
                      Link: <a :href="iv.meeting_link" target="_blank" class="text-indigo-600 hover:underline">Join Meeting</a>
                    </p>
                    <p class="flex items-center gap-1" v-else>
                      <MapPin class="w-3.5 h-3.5 text-gray-400" />
                      Location: {{ iv.location || 'Virtual' }}
                    </p>
                  </div>

                  <!-- feedback section if exists -->
                  <div v-if="iv.feedback || iv.score != null" class="bg-white rounded-lg p-3 border border-gray-100/50 text-xs mt-2">
                    <div class="flex items-center justify-between font-semibold text-gray-700">
                      <span>Feedback comments</span>
                      <span v-if="iv.score != null" class="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Score: {{ iv.score }}/100</span>
                    </div>
                    <p class="text-gray-500 mt-1 italic">{{ iv.feedback || 'No comments registered.' }}</p>
                  </div>

                  <!-- interview result inputs (if pending) -->
                  <div
                    v-if="iv.result === 'pending' && authStore.can('submit-interview-results') && app.status === 'active'"
                    class="flex gap-2 pt-1 border-t border-gray-100/50 justify-end"
                  >
                    <button
                      v-if="authStore.can('schedule-interviews')"
                      @click="openRescheduleModal(iv)"
                      class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Reschedule
                    </button>
                    <button
                      @click="openResultModal(iv)"
                      class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Submit Result
                    </button>
                    <button
                      @click="handleCancelInterview(iv.id)"
                      class="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel Interview
                    </button>
                  </div>

                </div>
              </div>
            </div>

            <!-- Tab 2: Offer Details -->
            <div v-if="activeTab === 'offer'" class="space-y-6 animate-fade-in">
              <div class="flex justify-between items-center border-b border-gray-50 pb-2">
                <h4 class="text-sm font-bold text-gray-800 uppercase tracking-wide">Employment Offer</h4>
                <button
                  v-if="!offerData && authStore.can('create-offers') && app.status === 'active'"
                  @click="showOfferModal = true"
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus class="w-3.5 h-3.5" /> Generate Offer letter
                </button>
              </div>

              <!-- Offer summary -->
              <div v-if="!offerData" class="text-center py-12 text-gray-400 text-sm">
                <FileText class="w-10 h-10 text-gray-300 mx-auto mb-2" />
                No offer has been generated yet for this candidate.
              </div>

              <div v-else class="space-y-5">
                <div class="border border-gray-100 rounded-2xl p-5 bg-indigo-50/20 space-y-4">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-xs text-gray-400">Offer Reference Code</p>
                      <p class="font-bold text-gray-800 text-base">{{ offerData.offer_number }}</p>
                    </div>
                    <span
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
                      :class="offerStatusBadge(offerData.status).cls"
                    >
                      {{ offerStatusBadge(offerData.status).label }}
                    </span>
                  </div>

                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-gray-50 pt-4">
                    <div>
                      <span class="block text-xs text-gray-400">Base Salary</span>
                      <span class="font-bold text-gray-800">{{ formatNumber(offerData.salary) }} {{ offerData.currency || 'EGP' }}</span>
                    </div>
                    <div>
                      <span class="block text-xs text-gray-400">Allowance</span>
                      <span class="font-bold text-gray-800">{{ formatNumber(offerData.allowance) }} {{ offerData.currency || 'EGP' }}</span>
                    </div>
                    <div>
                      <span class="block text-xs text-gray-400">Bonus</span>
                      <span class="font-bold text-gray-800">{{ formatNumber(offerData.bonus) }} {{ offerData.currency || 'EGP' }}</span>
                    </div>
                    <div>
                      <span class="block text-xs text-gray-400">Probation</span>
                      <span class="font-bold text-gray-800">{{ offerData.probation_months }} Months</span>
                    </div>
                  </div>

                  <div class="text-sm pt-2 border-t border-gray-50">
                    <p class="text-xs text-gray-400">Estimated Start Date</p>
                    <p class="font-semibold text-gray-700 mt-0.5">
                      {{ offerData.start_date ? formatDate(offerData.start_date) : 'Not defined' }}
                    </p>
                  </div>
                </div>

                <div class="flex gap-2 justify-end" v-if="offerData.status === 'pending' && app.status === 'active'">
                  <button
                    v-if="authStore.can('send-offers')"
                    @click="handleSendOffer(offerData.id)"
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Send class="w-3.5 h-3.5" /> Send Offer Email
                  </button>
                  <button
                    v-if="authStore.can('expire-offers')"
                    @click="handleExpireOffer(offerData.id)"
                    class="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Mark as Expired
                  </button>
                </div>
              </div>
            </div>

            <!-- Tab 3: Activity Log -->
            <div v-if="activeTab === 'timeline'" class="space-y-5 animate-fade-in">
              <h4 class="text-sm font-bold text-gray-800 uppercase tracking-wide pb-2">Activity Timeline</h4>
              
              <div v-if="activityTimeline.length === 0" class="text-center py-8 text-gray-400 text-sm">
                No activity logs recorded.
              </div>

              <div v-else class="relative border-l border-gray-100 ml-3 pl-5 space-y-6 py-2">
                <div
                  v-for="act in activityTimeline"
                  :key="act.id"
                  class="relative"
                >
                  <!-- Timeline indicator node -->
                  <span class="absolute -left-7 top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white ring-4 ring-indigo-50" />
                  
                  <div>
                    <p class="text-sm text-gray-800 font-semibold">{{ act.action_description || act.activity_text || act.action }}</p>
                    <p class="text-[10px] text-gray-400 mt-0.5">
                      By: {{ act.user?.name || 'System' }} &nbsp;·&nbsp; {{ formatDate(act.created_at || act.timestamp, true) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>

    <!-- Assign Recruiter Modal -->
    <div
      v-if="showAssignModal"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showAssignModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <User class="w-5 h-5 text-indigo-500" /> Assign Recruiter
        </h3>
        <select
          v-model="selectedRecruiterId"
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
        >
          <option value="">Select recruiter...</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ employeeName(emp) }}</option>
        </select>
        <div class="flex justify-end gap-3 pt-2">
          <button @click="showAssignModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            @click="confirmAssignRecruiter"
            :disabled="!selectedRecruiterId || store.submitting"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Assign
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div
      v-if="showRejectModal"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showRejectModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <XCircle class="w-5 h-5 text-red-500" /> Reject Application
        </h3>
        <p class="text-sm text-gray-500">Add a reason for rejecting this candidate application.</p>
        <textarea
          v-model="rejectReason"
          rows="3"
          placeholder="e.g. Technical assessment score below requirements..."
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400/30 resize-none"
        />
        <div class="flex justify-end gap-3">
          <button @click="showRejectModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            @click="confirmReject"
            :disabled="store.submitting"
            class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </div>

    <!-- Withdraw Modal -->
    <div
      v-if="showWithdrawModal"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showWithdrawModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CornerUpLeft class="w-5 h-5 text-gray-500" /> Withdraw Application
        </h3>
        <p class="text-sm text-gray-500">Provide withdrawal comments (e.g. accepted another offer).</p>
        <textarea
          v-model="withdrawReason"
          rows="3"
          placeholder="Comments..."
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
        />
        <div class="flex justify-end gap-3">
          <button @click="showWithdrawModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            @click="confirmWithdraw"
            :disabled="store.submitting"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Confirm Withdraw
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule Interview Modal -->
    <div
      v-if="showScheduleModal"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showScheduleModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Clock class="w-5 h-5 text-indigo-500" /> Schedule Interview
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Interview Stage <span class="text-red-500">*</span></label>
            <select
              v-model="interviewForm.interview_stage_id"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="">Select stage...</option>
              <option v-for="stg in stages" :key="stg.id" :value="stg.id">{{ stg.name }}</option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Scheduled At <span class="text-red-500">*</span></label>
              <input
                v-model="interviewForm.scheduled_at"
                type="datetime-local"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Interviewer <span class="text-red-500">*</span></label>
              <select
                v-model="interviewForm.interviewer_id"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
              >
                <option value="">Select employee...</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Meeting Link <span class="text-xs text-gray-400">(optional)</span></label>
              <input
                v-model="interviewForm.meeting_link"
                type="url"
                placeholder="https://meet.google.com/..."
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Location / Office <span class="text-xs text-gray-400">(optional)</span></label>
              <input
                v-model="interviewForm.location"
                type="text"
                placeholder="e.g. Cairo Headquarters"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Preparation Notes</label>
            <textarea
              v-model="interviewForm.notes"
              rows="2"
              placeholder="Instructions for the candidate or interviewer..."
              class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showScheduleModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            @click="confirmScheduleInterview"
            :disabled="!interviewForm.interview_stage_id || !interviewForm.scheduled_at || !interviewForm.interviewer_id || store.submitting"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>

    <!-- Reschedule Interview Modal -->
    <div
      v-if="showRescheduleModal"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showRescheduleModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Clock class="w-5 h-5 text-amber-500" /> Reschedule Interview
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Interview Stage</label>
            <input
              type="text"
              disabled
              :value="rescheduleForm.stage_name"
              class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-400 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Scheduled At <span class="text-red-500">*</span></label>
              <input
                v-model="rescheduleForm.scheduled_at"
                type="datetime-local"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Interviewer <span class="text-red-500">*</span></label>
              <select
                v-model="rescheduleForm.interviewer_id"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
              >
                <option value="">Select employee...</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ employeeName(emp) }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Meeting Link <span class="text-xs text-gray-400">(optional)</span></label>
              <input
                v-model="rescheduleForm.meeting_link"
                type="url"
                placeholder="https://meet.google.com/..."
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Location / Office <span class="text-xs text-gray-400">(optional)</span></label>
              <input
                v-model="rescheduleForm.location"
                type="text"
                placeholder="e.g. Cairo Headquarters"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showRescheduleModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            @click="confirmRescheduleInterview"
            :disabled="!rescheduleForm.scheduled_at || !rescheduleForm.interviewer_id || store.submitting"
            class="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>

    <!-- Submit Interview Result Modal -->
    <div
      v-if="showResultModal"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showResultModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 class="w-5 h-5 text-emerald-600" /> Submit Interview Result
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Result Outcome <span class="text-red-500">*</span></label>
            <select
              v-model="resultForm.result"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="passed">Passed</option>
              <option value="rejected">Rejected</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Evaluation Score (0 - 100)</label>
            <input
              v-model.number="resultForm.score"
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 85"
              class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Interviewer Feedback</label>
            <textarea
              v-model="resultForm.feedback"
              rows="3"
              placeholder="Strengths, weaknesses, alignment comments..."
              class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showResultModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            @click="confirmSubmitResult"
            :disabled="store.submitting"
            class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>
    </div>

    <!-- Generate Offer Modal -->
    <div
      v-if="showOfferModal"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="showOfferModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileText class="w-5 h-5 text-indigo-500" /> Generate Employment Offer
        </h3>

        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Base Salary (monthly) <span class="text-red-500">*</span></label>
              <input
                v-model.number="offerForm.salary"
                type="number"
                min="0"
                placeholder="e.g. 12000"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Allowance (monthly)</label>
              <input
                v-model.number="offerForm.allowance"
                type="number"
                min="0"
                placeholder="e.g. 1000"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">One-time / Annual Bonus</label>
              <input
                v-model.number="offerForm.bonus"
                type="number"
                min="0"
                placeholder="e.g. 5000"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Probation Period (months)</label>
              <input
                v-model.number="offerForm.probation_months"
                type="number"
                min="0"
                placeholder="e.g. 3"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Currency Code</label>
              <input
                v-model="offerForm.currency"
                type="text"
                maxlength="3"
                placeholder="EGP"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 uppercase"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Proposed Start Date</label>
              <input
                v-model="offerForm.start_date"
                type="date"
                class="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showOfferModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            @click="confirmCreateOffer"
            :disabled="!offerForm.salary || store.submitting"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Generate
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  ArrowLeft, User, XCircle, CornerUpLeft, CheckCircle2, Check, Mail, Phone, Linkedin, FileText, Plus, Clock, Globe, MapPin, Send
} from 'lucide-vue-next';
import { useApplicationsStore } from '@/stores/recruitment/applicationsStore';
import { useInterviewStagesStore } from '@/stores/recruitment/interviewStagesStore';
import { useHrEmployeesStore } from '@/stores/hr/employees';
import { useInterviewsStore } from '@/stores/recruitment/interviewsStore';
import { useOffersStore } from '@/stores/recruitment/offersStore';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const appId = Number(route.params.id);

const store = useApplicationsStore();
const stagesStore = useInterviewStagesStore();
const employeesStore = useHrEmployeesStore();
const offersStore = useOffersStore();
const authStore = useAuthStore();

// ── Application Detail ────────────────────────────────────────────────────
const app = computed(() => store.currentApplication);
const stages = computed(() => stagesStore.stages);
const employees = computed(() => employeesStore.employees);

const employeeName = (emp) => {
  const pi = emp?.personal_info || {};
  const joined = [pi.first_name, pi.last_name].filter(Boolean).join(" ").trim();
  const name = joined || String(emp?.name || "").trim() || `Employee #${emp?.id ?? "-"}`;
  const fp = emp?.fingerprint ?? emp?.fingerPrint ?? pi?.fingerprint ?? pi?.fingerPrint ?? emp?.user?.fingerPrint;
  return fp ? `${name} (${fp})` : name;
};

// ── Tab State ─────────────────────────────────────────────────────────────
const activeTab = ref('interviews');
const tabs = [
  { label: 'Interviews & Results', value: 'interviews' },
  { label: 'Offer Letter', value: 'offer' },
  { label: 'Activity Timeline', value: 'timeline' },
];

const interviewsList = computed(() => store.interviews);
const offerData = computed(() => store.offer);
const activityTimeline = computed(() => store.activityLog);

const candidateName = computed(() => {
  const c = app.value?.candidate;
  if (!c) return '—';
  return c.name || `${c.firstname || ''} ${c.lastname || ''}`.trim() || '—';
});

const candidateInitials = computed(() => {
  const name = candidateName.value;
  if (name === '—') return '?';
  const parts = name.split(' ');
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
});

// ── Formatting Helpers ────────────────────────────────────────────────────
const formatNumber = (num) => Number(num || 0).toLocaleString('en-US');
const formatDate = (d, includeTime = false) => {
  if (!d) return '—';
  const opt = { day: '2-digit', month: 'short', year: 'numeric' };
  if (includeTime) {
    opt.hour = '2-digit';
    opt.minute = '2-digit';
  }
  return new Date(d).toLocaleDateString('en-GB', opt);
};

// ── Stepper Color Mapping ─────────────────────────────────────────────────
const isStageCompleted = (stage, idx) => {
  const currentIdx = stages.value.findIndex(s => s.id === (app.value?.stage || app.value?.current_stage)?.id);
  return idx < currentIdx;
};
const isStageCurrent = (stage) => (app.value?.stage || app.value?.current_stage)?.id === stage.id;

const stageNodeClass = (stage, idx) => {
  if (isStageCompleted(stage, idx)) {
    return 'bg-emerald-500 border-emerald-500 text-white';
  }
  if (isStageCurrent(stage)) {
    return 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-50';
  }
  return 'bg-white border-gray-200 text-gray-400';
};

// ── Status Badges ─────────────────────────────────────────────────────────
const interviewResultBadge = (res) => {
  const map = {
    pending:   { label: 'Pending',   cls: 'bg-amber-50 text-amber-600 border-amber-200' },
    passed:    { label: 'Passed',    cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    rejected:  { label: 'Rejected',  cls: 'bg-red-50 text-red-600 border-red-200' },
    no_show:   { label: 'No Show',   cls: 'bg-purple-50 text-purple-600 border-purple-200' },
    cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  };
  return map[res] ?? { label: res, cls: 'bg-gray-100 text-gray-500' };
};

const offerStatusBadge = (status) => {
  const map = {
    pending:  { label: 'Pending Response', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    accepted: { label: 'Accepted',         cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected',         cls: 'bg-red-50 text-red-700 border-red-200' },
    expired:  { label: 'Expired',          cls: 'bg-gray-150 text-gray-600 border-gray-200' },
  };
  return map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500' };
};

// ── Application Actions ───────────────────────────────────────────────────
const showAssignModal = ref(false);
const selectedRecruiterId = ref('');
const confirmAssignRecruiter = async () => {
  await store.assignRecruiter(appId, selectedRecruiterId.value);
  showAssignModal.value = false;
};

// Reject modal
const showRejectModal = ref(false);
const rejectReason = ref('');
const openRejectModal = () => { rejectReason.value = ''; showRejectModal.value = true; };
const confirmReject = async () => {
  await store.rejectApplication(appId, rejectReason.value.trim());
  showRejectModal.value = false;
};

// Withdraw modal
const showWithdrawModal = ref(false);
const withdrawReason = ref('');
const openWithdrawModal = () => { withdrawReason.value = ''; showWithdrawModal.value = true; };
const confirmWithdraw = async () => {
  await store.withdrawApplication(appId, withdrawReason.value.trim());
  showWithdrawModal.value = false;
};

// Hire
const handleHire = async () => {
  await store.hireCandidate(appId);
};

// Move stage
const handleMoveStage = async (stage) => {
  // Can only advance in order or skip optional
  await store.moveStage(appId, stage.id);
};

// ── Tab-1: Schedule Interview ─────────────────────────────────────────────
const showScheduleModal = ref(false);
const interviewForm = reactive({
  interview_stage_id: '',
  scheduled_at: '',
  interviewer_id: '',
  meeting_link: '',
  location: '',
  notes: '',
});
const openScheduleModal = () => {
  Object.assign(interviewForm, { interview_stage_id: '', scheduled_at: '', interviewer_id: '', meeting_link: '', location: '', notes: '' });
  showScheduleModal.value = true;
};
const confirmScheduleInterview = async () => {
  const iStore = useInterviewsStore();
  // Call schedule
  await iStore.scheduleInterview({
    application_id: appId,
    ...interviewForm,
  });
  showScheduleModal.value = false;
  await store.fetchInterviews(appId);
  await store.fetchActivityLog(appId);
};

// Cancel interview
const handleCancelInterview = async (ivId) => {
  const iStore = useInterviewsStore();
  await iStore.cancelInterview(ivId);
  await store.fetchInterviews(appId);
};

// ── Reschedule Interview ──────────────────────────────────────────────────
const showRescheduleModal = ref(false);
const activeRescheduleId = ref(null);
const rescheduleForm = reactive({
  stage_name: '',
  scheduled_at: '',
  interviewer_id: '',
  meeting_link: '',
  location: '',
});

const openRescheduleModal = (iv) => {
  activeRescheduleId.value = iv.id;
  let formattedDate = '';
  if (iv.scheduled_at) {
    const dt = new Date(iv.scheduled_at);
    const tzOffset = dt.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(dt.getTime() - tzOffset)).toISOString().slice(0, 16);
    formattedDate = localISOTime;
  }
  Object.assign(rescheduleForm, {
    stage_name: iv.interview_stage?.name || 'Interview',
    scheduled_at: formattedDate,
    interviewer_id: iv.interviewer?.id || iv.interviewer_id || '',
    meeting_link: iv.meeting_link || '',
    location: iv.location || '',
  });
  showRescheduleModal.value = true;
};

const confirmRescheduleInterview = async () => {
  const iStore = useInterviewsStore();
  await iStore.rescheduleInterview(activeRescheduleId.value, {
    scheduled_at: rescheduleForm.scheduled_at,
    interviewer_id: rescheduleForm.interviewer_id,
    meeting_link: rescheduleForm.meeting_link,
    location: rescheduleForm.location,
  });
  showRescheduleModal.value = false;
  await store.fetchInterviews(appId);
  await store.fetchActivityLog(appId);
};

// Submit result modal
const showResultModal = ref(false);
const activeInterviewId = ref(null);
const resultForm = reactive({
  result: 'passed',
  score: '',
  feedback: '',
});
const openResultModal = (iv) => {
  activeInterviewId.value = iv.id;
  Object.assign(resultForm, { result: 'passed', score: '', feedback: '' });
  showResultModal.value = true;
};
const confirmSubmitResult = async () => {
  const iStore = useInterviewsStore();
  await iStore.submitResult(activeInterviewId.value, { ...resultForm });
  showResultModal.value = false;
  await store.fetchInterviews(appId);
  await store.fetchActivityLog(appId);
};

// ── Tab-2: Offer actions ──────────────────────────────────────────────────
const showOfferModal = ref(false);
const offerForm = reactive({
  salary: '',
  allowance: '',
  bonus: '',
  currency: 'EGP',
  probation_months: 3,
  start_date: '',
});

const confirmCreateOffer = async () => {
  const oStore = useOffersStore();
  await oStore.createOffer({
    application_id: appId,
    ...offerForm,
  });
  showOfferModal.value = false;
  await store.fetchOffer(appId);
  await store.fetchActivityLog(appId);
};

const handleSendOffer = async (offerId) => {
  const oStore = useOffersStore();
  await oStore.sendOffer(offerId);
  await store.fetchOffer(appId);
};

const handleExpireOffer = async (offerId) => {
  const oStore = useOffersStore();
  await oStore.expireOffer(offerId);
  await store.fetchOffer(appId);
};

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    await store.fetchApplication(appId);
  } catch (err) {
    console.warn('Failed to load application, using mock fallback', err);
    store.currentApplication = {
      id: appId,
      candidate: {
        id: 1,
        firstname: 'Youssef',
        lastname: 'Khaled',
        email: 'youssef.k@example.com',
        phone: '+20111222333',
        linkedin: 'https://linkedin.com/in/youssef-khaled'
      },
      job_post: {
        id: 1,
        title: 'Senior NodeJS Engineer',
        location: 'Cairo HQ',
        employment_type: 'full_time',
        deadline: '2026-09-10'
      },
      assigned_recruiter: {
        id: 2,
        name: 'Sherif Omar'
      },
      current_stage: {
        id: 2,
        name: 'Technical Exam'
      },
      status: 'active',
      created_at: '2026-08-20T10:00:00Z'
    };
  }

  try {
    await stagesStore.fetchStages();
  } catch (err) {
    stagesStore.stages = [
      { id: 1, name: 'Screening' },
      { id: 2, name: 'Technical Exam' },
      { id: 3, name: 'Final Interview' },
      { id: 4, name: 'Offer Extended' }
    ];
  }

  try {
    await employeesStore.getEmployees();
  } catch (err) {
    employeesStore.employees = [
      { id: 2, name: 'Sherif Omar', personal_info: { first_name: 'Sherif', last_name: 'Omar' } },
      { id: 3, name: 'Ahmed Ali', personal_info: { first_name: 'Ahmed', last_name: 'Ali' } },
      { id: 4, name: 'Mona Salem', personal_info: { first_name: 'Mona', last_name: 'Salem' } }
    ];
  }

  try {
    await store.fetchInterviews(appId);
  } catch (err) {
    store.interviews = [
      {
        id: 1,
        interview_stage: { id: 1, name: 'Screening' },
        scheduled_at: '2026-08-21 10:00:00',
        interviewer: { name: 'Sherif Omar' },
        result: 'passed',
        score: 90,
        feedback: 'Very strong screening round.'
      },
      {
        id: 2,
        interview_stage: { id: 2, name: 'Technical Exam' },
        scheduled_at: '2026-08-25 11:30:00',
        interviewer: { name: 'Ahmed Ali' },
        result: 'pending',
        location: 'Cairo HQ Room 4B'
      }
    ];
  }

  try {
    await store.fetchOffer(appId);
  } catch (err) {
    store.offer = null;
  }

  try {
    await store.fetchActivityLog(appId);
  } catch (err) {
    store.activityLog = [
      { id: 1, action_description: 'Application submitted', user: { name: 'System' }, created_at: '2026-08-20T10:00:00Z' },
      { id: 2, action_description: 'Recruiter assigned: Sherif Omar', user: { name: 'Mona Salem' }, created_at: '2026-08-20T11:00:00Z' },
      { id: 3, action_description: 'Moved to Screening stage', user: { name: 'Sherif Omar' }, created_at: '2026-08-21T10:30:00Z' },
      { id: 4, action_description: 'First Interview Scheduled', user: { name: 'Sherif Omar' }, created_at: '2026-08-21T11:00:00Z' }
    ];
  }
  
  if (app.value?.assigned_recruiter) {
    selectedRecruiterId.value = app.value.assigned_recruiter.id;
  }
});
</script>
