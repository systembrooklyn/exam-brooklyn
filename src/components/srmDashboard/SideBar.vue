<template>
  <div class="flex min-h-screen bg-slate-50">
    <aside class="w-110 bg-white border-r border-slate-200/80 shadow-xl shadow-slate-100/50 flex flex-col overflow-y-auto overflow-x-hidden h-screen">
      <!-- SEARCH BOX -->
      <div class="p-5 bg-slate-50/50 border-b border-slate-100 shrink-0">
        <div class="relative max-w-md mx-auto">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search class="w-4 h-4" />
          </span>
          <input v-model="studentId" @keyup.enter="handleSearch" type="text" :placeholder="searchByOther
              ? 'Phone, Email or National ID...'
              : 'Enter Student ID...'
            " class="w-full pl-10 pr-12 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400" />

          <button @click="handleSearch" :disabled="isLoading"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition active:scale-95 disabled:opacity-50 cursor-pointer">
            <Search v-if="!isLoading" class="w-4 h-4 font-bold" />
            <div v-else class="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </button>
        </div>

        <div class="mt-3 flex justify-center">
          <div class="inline-flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
            <button type="button" @click="searchByOther = false"
              class="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 select-none cursor-pointer"
              :class="!searchByOther ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
              Student ID
            </button>
            <button type="button" @click="searchByOther = true"
              class="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 select-none cursor-pointer"
              :class="searchByOther ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
              Phone / Email / ID
            </button>
          </div>
        </div>
      </div>

      <!-- STUDENT HEADER -->
      <div class="flex flex-col pb-5 items-center border-b border-slate-100 p-5 text-center bg-white shrink-0 relative">
        <p v-if="student?.scholar_status === 'canceled'"
          class="mb-3.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm animate-pulse">
          <span>⚠️</span> This student has been canceled
        </p>

        <!-- Status Badges -->
        <div class="flex flex-wrap justify-center gap-1.5 mb-4">
          <span v-if="student?.scholarship?.study_type"
            class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50 uppercase tracking-wide">
            {{ student?.scholarship?.study_type }}
          </span>
          <span v-if="student?.scholar_status"
            class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100/50 uppercase tracking-wide">
            {{ student?.scholar_status }}
          </span>
          <span v-if="student?.careerType"
            class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50 uppercase tracking-wide">
            {{ student?.careerType }}
          </span>
        </div>

        <div v-show="student?.name && student?.st_num && student?.ID_number" class="w-full max-w-sm">
          <!-- Student Avatar Container -->
          <!-- <div class="w-20 h-20 mx-auto rounded-full bg-slate-50 border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-400 mb-3.5 overflow-hidden">
            <img v-if="student?.ppUrl" :src="student.ppUrl" class="w-full h-full object-cover" alt="Student Profile" />
            <span v-else class="text-2xl font-extrabold text-slate-300 tracking-wider">
              {{ student?.name?.slice(0, 2)?.toUpperCase() }}
            </span>
          </div> -->

          <h2 class="text-lg font-extrabold text-slate-800 leading-tight">
            <template v-if="!isEditMode">
              {{ student?.name }}
            </template>
            <input v-else ref="nameInput" v-model="editForm.name" type="text"
              class="w-full text-lg font-extrabold text-slate-800 bg-slate-50 border border-indigo-200 rounded-xl px-3 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mt-0.5" />
          </h2>

          <div class="mt-3.5 space-y-1.5 text-xs text-slate-500 font-semibold">
            <div class="flex items-center justify-center gap-2">
              <span class="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Student No:</span>
              <span class="text-slate-700 font-bold">{{ student?.st_num }}</span>
            </div>
            
            <div class="flex items-center justify-center gap-2">
              <span class="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Scholarship:</span>
              <span class="text-slate-700 font-bold">{{ studentAllData?.student?.scholarship?.name }}</span>
            </div>
            
            <div class="flex items-center justify-center gap-2">
              <span class="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Code:</span>
              <template v-if="!isEditMode">
                <span class="text-slate-700 font-bold">{{ studentAllData?.student?.marketing_code }}</span>
              </template>
              <input v-else v-model="editForm.marketing_code" type="text"
                class="w-36 text-center text-xs font-bold text-slate-750 bg-slate-50 border border-indigo-200 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5" />
            </div>

            <div class="flex items-center justify-center gap-2">
              <span class="font-bold text-slate-400 uppercase tracking-wider text-[9px]">National ID:</span>
              <template v-if="!isEditMode">
                <span class="text-slate-700 font-bold">{{ student?.ID_number || "Not Set Yet" }}</span>
              </template>
              <input v-else v-model="editForm.ID_number" type="text"
                class="w-48 text-center text-xs font-bold text-slate-750 bg-slate-50 border border-indigo-200 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5" />
            </div>
          </div>
        </div>

        <!-- Sleek Quick Action Bar -->
        <div class="flex justify-center items-center gap-2.5 mt-4.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner">
          <!-- Share -->
          <div class="relative group">
            <button class="p-2 bg-white text-rose-500 hover:bg-rose-50 border border-slate-200/60 rounded-xl hover:scale-105 transition shadow-sm active:scale-95 cursor-pointer">
              <Share2 class="w-4 h-4" />
            </button>
            <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-30 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
              Share Details
            </div>
          </div>

          <!-- Send QR -->
          <div class="relative group">
            <button @click="showConfirmModal = true" class="p-2 bg-white text-emerald-500 hover:bg-emerald-50 border border-slate-200/60 rounded-xl hover:scale-105 transition shadow-sm active:scale-95 cursor-pointer">
              <QrCode class="w-4 h-4" />
            </button>
            <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-30 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
              Send QR Code
            </div>
          </div>

          <!-- App -->
          <div class="relative group">
            <button class="p-2 bg-white text-indigo-500 hover:bg-indigo-50 border border-slate-200/60 rounded-xl hover:scale-105 transition shadow-sm active:scale-95 cursor-pointer">
              <AppWindow class="w-4 h-4" />
            </button>
            <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-30 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
              Open App View
            </div>
          </div>

          <!-- Edit Toggle -->
          <div v-if="student?.name && !isEditMode && authStore.hasPermission('edit-student')" class="relative group">
            <button @click="enterEditMode" class="p-2 bg-white text-amber-500 hover:bg-amber-50 border border-slate-200/60 rounded-xl hover:scale-105 transition shadow-sm active:scale-95 cursor-pointer">
              <Edit class="w-4 h-4" />
            </button>
            <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-30 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
              Edit Profile
            </div>
          </div>
        </div>
      </div>

      <!-- DETAILS PANEL -->
      <div class="p-5 space-y-4 bg-slate-50/30 flex-1 border-t border-slate-100" v-if="
        student &&
        (student.email ||
          student.phones?.length ||
          student.major ||
          student.company ||
          student.grade ||
          student.faculity)
      ">
        <div class="flex justify-between items-center mb-1">
          <h3 class="text-xs font-extrabold text-indigo-950 uppercase tracking-widest flex items-center gap-1.5">
            <span class="p-1 bg-indigo-50 text-indigo-600 rounded">
              <User class="w-3.5 h-3.5" />
            </span>
            Profile Information
          </h3>
          <div v-if="isEditMode" class="flex gap-2">
            <button @click="saveChanges" :disabled="!hasChanges || studentUpdateStore.loading"
              class="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-1.5 cursor-pointer">
              <span v-if="studentUpdateStore.loading" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Save</span>
            </button>
            <button @click="cancelEdit" class="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-300 transition cursor-pointer">
              Cancel
            </button>
          </div>
        </div>

        <!-- CARD 1: CONTACT DETAILS -->
        <div class="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-3.5">
          <h4 class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b pb-1.5">Contact Details</h4>
          
          <div class="space-y-3">
            <!-- Phones -->
            <div class="flex items-start gap-3.5 p-2 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition">
              <div class="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <Phone class="w-4 h-4" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Phones</span>
                <template v-if="!isEditMode">
                  <div class="flex items-center justify-between gap-2 mt-0.5">
                    <div class="flex items-center flex-wrap gap-1 text-xs font-bold text-slate-700">
                      <template v-for="(phone, index) in student?.phones" :key="index">
                        <span class="cursor-pointer hover:text-indigo-600 hover:underline select-all transition-colors duration-150" 
                              :title="'Click to copy: ' + phone" 
                              @click="copyText(phone, 'Phone Number')">
                          {{ phone }}
                        </span>
                        <span v-if="index < student.phones.length - 1" class="text-slate-400 mx-1 select-none">/</span>
                      </template>
                      <span v-if="!student?.phones || student.phones.length === 0" class="text-slate-500 font-semibold">Not Set Yet</span>
                    </div>
                    <button @click="showSmsModal = true" class="p-1 hover:bg-emerald-100 text-emerald-600 rounded-lg transition cursor-pointer" title="Send SMS">
                      <MessageSquareText class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </template>
                <template v-else>
                  <input v-model="phoneInput" @blur="updatePhones" type="text" placeholder="Phones (comma separated)"
                    class="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1" />
                </template>
              </div>
            </div>

            <!-- Email -->
            <div class="flex items-start gap-3.5 p-2 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition">
              <div class="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <Mail class="w-4 h-4" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Email Address</span>
                <template v-if="!isEditMode">
                  <div class="flex items-center justify-between gap-2 mt-0.5">
                    <span class="text-xs font-bold text-slate-700 truncate cursor-pointer hover:text-indigo-600 hover:underline select-all transition-colors duration-150" :title="'Click to copy Email: ' + student?.email" @click="copyText(student?.email, 'Email')">{{ student?.email }}</span>
                    <button @click="showEmailModal = true" class="p-1 hover:bg-blue-100 text-blue-600 rounded-lg transition cursor-pointer" title="Send Email">
                      <Mail class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </template>
                <template v-else>
                  <input v-model="editForm.email" type="email"
                    class="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1" />
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- CARD 2: ACADEMIC & EMPLOYMENT -->
        <div class="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-3.5">
          <h4 class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b pb-1.5">Academic & Employment</h4>
          
          <div class="grid grid-cols-2 gap-3">
            <!-- Company -->
            <div class="flex items-start gap-3 p-2 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition col-span-2">
              <div class="p-1.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                <Briefcase class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Company</span>
                <template v-if="!isEditMode">
                  <span class="block text-xs font-bold text-slate-700 truncate">{{ student?.company || "No Available" }}</span>
                </template>
                <template v-else>
                  <input v-model="editForm.company" type="text"
                    class="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5" />
                </template>
              </div>
            </div>

            <!-- Major -->
            <div class="flex items-start gap-3 p-2 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition">
              <div class="p-1.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                <BookOpen class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Major</span>
                <template v-if="!isEditMode">
                  <span class="block text-xs font-bold text-slate-700 truncate" :title="student?.major">{{ student?.major || "No Available" }}</span>
                </template>
                <template v-else>
                  <input v-model="editForm.major" type="text"
                    class="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5" />
                </template>
              </div>
            </div>

            <!-- Grade -->
            <div class="flex items-start gap-3 p-2 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition">
              <div class="p-1.5 bg-sky-50 text-sky-600 rounded-lg shrink-0">
                <Award class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Grade</span>
                <template v-if="!isEditMode">
                  <span class="block text-xs font-bold text-slate-700 truncate">{{ student?.grade || "Not Set Yet" }}</span>
                </template>
                <template v-else>
                  <input v-model="editForm.grade" type="text"
                    class="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5" />
                </template>
              </div>
            </div>

            <!-- Faculty -->
            <div class="flex items-start gap-3 p-2 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition col-span-2">
              <div class="p-1.5 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                <GraduationCap class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Faculty</span>
                <template v-if="!isEditMode">
                  <span class="block text-xs font-bold text-slate-700 truncate" :title="student?.faculity">{{ student?.faculity || "No Available" }}</span>
                </template>
                <template v-else>
                  <input v-model="editForm.faculity" type="text"
                    class="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5" />
                </template>
              </div>
            </div>

            <!-- Career Type (In Edit mode or if available in read-only) -->
            <div v-if="isEditMode || student?.careerType" class="flex items-start gap-3 p-2 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition col-span-2">
              <div class="p-1.5 bg-teal-50 text-teal-600 rounded-lg shrink-0">
                <Activity class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Career Type</span>
                <template v-if="!isEditMode">
                  <span class="block text-xs font-bold text-slate-700 truncate">{{ student?.careerType || "Not Set Yet" }}</span>
                </template>
                <template v-else>
                  <input v-model="editForm.careerType" type="text"
                    class="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-0.5" />
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- CARD 3: RESERVATION & REGISTRATION -->
        <div class="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-3.5">
          <h4 class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b pb-1.5">Reservation & Registration</h4>
          
          <div class="space-y-3">
            <!-- Branch -->
            <div class="flex items-start gap-3.5 p-2.5 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition">
              <div class="p-1 text-indigo-500 rounded shrink-0 bg-indigo-50/50 flex items-center justify-center w-6 h-6">
                <MapPin class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Branch</span>
                <span class="block text-xs font-bold text-slate-700 truncate" :title="reservationDetails.branch?.name || 'Not Set Yet'">
                  {{ reservationDetails.branch?.name || "Not Set Yet" }}
                </span>
              </div>
            </div>

            <!-- Registered At -->
            <div class="flex items-start gap-3.5 p-2.5 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition">
              <div class="p-1 text-emerald-500 rounded shrink-0 bg-emerald-50/50 flex items-center justify-center w-6 h-6">
                <Calendar class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Registered At</span>
                <span class="block text-xs font-bold text-slate-700" :title="reservationDetails.registered_at || 'Not Set Yet'">
                  {{ formatDateTime(reservationDetails.registered_at) }}
                </span>
              </div>
            </div>

            <!-- Registered By -->
            <div class="flex items-start gap-3.5 p-2.5 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition">
              <div class="p-1 text-blue-500 rounded shrink-0 bg-blue-50/50 flex items-center justify-center w-6 h-6">
                <User class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Registered By</span>
                <span class="block text-xs font-bold text-slate-700 truncate" :title="reservationDetails.registered_by?.name || 'Not Set Yet'">
                  {{ reservationDetails.registered_by?.name ? (reservationDetails.registered_by.name.split(" ")[0] + "_" + reservationDetails.registered_by.fingerPrint) : "Not Set Yet" }}
                </span>
              </div>
            </div>

            <!-- Reserved By -->
            <div class="flex items-start gap-3.5 p-2.5 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition">
              <div class="p-1 text-purple-500 rounded shrink-0 bg-purple-50/50 flex items-center justify-center w-6 h-6">
                <UserCheck class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Reserved By</span>
                <span class="block text-xs font-bold text-slate-700 truncate" :title="reservationDetails.reserved_by?.name || 'Not Set Yet'">
                  {{ reservationDetails.reserved_by?.name ? (reservationDetails.reserved_by.name.split(" ")[0] + "_" + reservationDetails.reserved_by.fingerPrint) : "Not Set Yet" }}
                </span>
              </div>
            </div>

            <!-- Reserved Time -->
            <div class="flex items-start gap-3.5 p-2.5 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition">
              <div class="p-1 text-amber-500 rounded shrink-0 bg-amber-50/50 flex items-center justify-center w-6 h-6">
                <Clock class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Reserved Time</span>
                <span class="block text-xs font-bold text-slate-700" :title="reservationDetails.reserved_time || 'Not Set Yet'">
                  {{ formatDateTime(reservationDetails.reserved_time) }}
                </span>
              </div>
            </div>

            <!-- Called Time -->
            <div class="flex items-start gap-3.5 p-2.5 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition">
              <div class="p-1 text-rose-500 rounded shrink-0 bg-rose-50/50 flex items-center justify-center w-6 h-6">
                <PhoneCall class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Called Time</span>
                <span class="block text-xs font-bold text-slate-700" :title="reservationDetails.called_time || 'Not Set Yet'">
                  {{ formatDateTime(reservationDetails.called_time) }}
                </span>
              </div>
            </div>

            <!-- Called By -->
            <div class="flex items-start gap-3.5 p-2.5 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition">
              <div class="p-1 text-teal-500 rounded shrink-0 bg-teal-50/50 flex items-center justify-center w-6 h-6">
                <User class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Called By</span>
                <span class="block text-xs font-bold text-slate-700 truncate" :title="reservationDetails.called_by?.name || 'Not Set Yet'">
                  {{ reservationDetails.called_by?.name ? (reservationDetails.called_by.name.split(" ")[0] + "_" + reservationDetails.called_by.fingerPrint) : "Not Set Yet" }}
                </span>
              </div>
            </div>

            <!-- Religion -->
            <div class="flex items-start gap-3.5 p-2.5 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition">
              <div class="p-1 text-pink-500 rounded shrink-0 bg-pink-50/50 flex items-center justify-center w-6 h-6">
                <Heart class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Religion</span>
                <span class="block text-xs font-bold text-slate-700 truncate" :title="student?.religion || studentAllData?.student?.religion || 'Not Set Yet'">
                  {{ student?.religion || studentAllData?.student?.religion || "Not Set Yet" }}
                </span>
              </div>
            </div>

            <!-- Nationality -->
            <div class="flex items-start gap-3.5 p-2.5 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition">
              <div class="p-1 text-sky-500 rounded shrink-0 bg-sky-50/50 flex items-center justify-center w-6 h-6">
                <Globe class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Nationality</span>
                <span class="block text-xs font-bold text-slate-700 truncate" :title="student?.nationality || studentAllData?.student?.nationality || 'Not Set Yet'">
                  {{ student?.nationality || studentAllData?.student?.nationality || "Not Set Yet" }}
                </span>
              </div>
            </div>

            <!-- Birth Date -->
            <div class="flex items-start gap-3.5 p-2.5 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition">
              <div class="p-1 text-violet-500 rounded shrink-0 bg-violet-50/50 flex items-center justify-center w-6 h-6">
                <Calendar class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Birth Date</span>
                <span class="block text-xs font-bold text-slate-700" :title="student?.birth_date || studentAllData?.student?.birth_date || 'Not Set Yet'">
                  {{ formatDateTime(student?.birth_date || studentAllData?.student?.birth_date) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- CONFIRM QR EMAIL MODAL -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-2xl shadow-xl border border-slate-150 text-center max-w-sm mx-4 transform transition-all">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-650 rounded-full flex items-center justify-center mx-auto mb-3.5">
          <QrCode class="w-6 h-6" />
        </div>
        <h3 class="text-base font-bold text-slate-800 mb-1.5">
          Send QR Code?
        </h3>
        <p class="text-xs text-slate-500 mb-4 leading-normal">
          The QR code will be generated and sent via email to <strong class="text-slate-700">{{ student?.email }}</strong>
        </p>
        <div class="flex justify-center gap-3">
          <button @click="sendQrEmail"
            class="flex-1 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-sm active:scale-95 cursor-pointer">
            Yes, Send
          </button>
          <button @click="showConfirmModal = false"
            class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <SendMessageModal v-if="showEmailModal" :visible="showEmailModal" type="email" :recipient="student?.email"
      :loading="messageStore.loading" @send="handleEmailSend" @close="showEmailModal = false" />

    <SendMessageModal v-if="showSmsModal" :visible="showSmsModal" type="sms" :recipient="student?.phones?.join(' / ')"
      :loading="messageStore.loading" @send="handleSmsSend" @close="showSmsModal = false" />

    <StudentPickerModal v-model:visible="showPicker" :students="studentsList" @confirm="handlePickStudent" />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import StudentPickerModal from "./StudentPickerModal.vue";
import { useStudentStore } from "@/stores/SearchStudent";
import { useStudentUpdateStore } from "@/stores/studentUpdateStore";
import { useAuthStore } from "@/stores/auth";

import {
  Mail,
  Share2,
  QrCode,
  AppWindow,
  Search,
  MessageSquareText,
  Edit,
  Phone,
  Briefcase,
  BookOpen,
  Award,
  GraduationCap,
  Activity,
  MapPin,
  Calendar,
  User,
  UserCheck,
  Clock,
  PhoneCall,
  Heart,
  Globe,
} from "lucide-vue-next";
import { useStudentMessageStore } from "../../stores/srmStore/studentMessageStore";
import notyf from "@/components/global/notyf";
import SendMessageModal from "./SendMessageModal.vue";

const studentId = ref("");
const student = ref({});
const studentAllData = ref(null);
const searchByOther = ref(false);
const showPicker = ref(false);
const studentsList = ref([]);
const modalType = ref("email");
const isLoading = ref(false);
const showConfirmModal = ref(false);
const showEmailModal = ref(false);
const emailBody = ref("");
const showSmsModal = ref(false);
const smsBody = ref("");

const reservationDetails = computed(() => {
  const reservation = studentAllData.value?.reservation?.[0];
  return reservation || studentAllData.value || {};
});

// Edit mode states
const isEditMode = ref(false);
const editForm = ref({});
const originalData = ref({});
const phoneInput = ref("");
const nameInput = ref(null);

const studentStore = useStudentStore();
const studentUpdateStore = useStudentUpdateStore();
const messageStore = useStudentMessageStore();
const authStore = useAuthStore();

const emit = defineEmits(["student-selected"]);

// Computed to check if there are changes
const hasChanges = computed(() => {
  if (!isEditMode.value) return false;

  // Compare each field
  const fieldsToCompare = [
    "name",
    "email",
    "company",
    "major",
    "grade",
    "faculity",
    "ID_number",
    "marketing_code",
    "birth_date",
    "careerType",
    "scholar_status",
    "ppUrl",
  ];

  for (const field of fieldsToCompare) {
    const originalValue = originalData.value[field] || "";
    const editValue = editForm.value[field] || "";
    if (String(originalValue) !== String(editValue)) {
      return true;
    }
  }

  // Compare phones array
  const originalPhones = originalData.value.phones || [];
  const editPhones = editForm.value.phones || [];
  if (
    JSON.stringify(originalPhones.sort()) !==
    JSON.stringify(editPhones.sort())
  ) {
    return true;
  }

  return false;
});

const enterEditMode = () => {
  if (!student.value || !student.value.name) {
    notyf.error("No student selected");
    return;
  }

  isEditMode.value = true;

  // Initialize edit form with current student data
  editForm.value = {
    name: student.value.name || "",
    email: student.value.email || "",
    phones: student.value.phones ? [...student.value.phones] : [],
    company: student.value.company || "",
    major: student.value.major || "",
    grade: student.value.grade || "",
    faculity: student.value.faculity || "",
    ID_number: student.value.ID_number || "",
    marketing_code: studentAllData.value?.student?.marketing_code || "",
    birth_date: student.value.birth_date || "",
    careerType: student.value.careerType || "",
    scholar_status: student.value.scholar_status || "",
    ppUrl: student.value.ppUrl || "",
  };

  // Store original data for comparison
  originalData.value = JSON.parse(JSON.stringify(editForm.value));

  // Initialize phone input
  phoneInput.value = editForm.value.phones.join(", ");

  // Focus on first input
  nextTick(() => {
    if (nameInput.value) {
      nameInput.value.focus();
    }
  });
};

const cancelEdit = () => {
  isEditMode.value = false;
  editForm.value = {};
  originalData.value = {};
  phoneInput.value = "";
};

const updatePhones = () => {
  if (phoneInput.value.trim()) {
    editForm.value.phones = phoneInput.value
      .split(",")
      .map((phone) => phone.trim())
      .filter((phone) => phone.length > 0);
  } else {
    editForm.value.phones = [];
  }
};

const getChangedFields = () => {
  const changes = {};

  const fieldsToCheck = [
    "name",
    "email",
    "company",
    "major",
    "grade",
    "faculity",
    "ID_number",
    "marketing_code",
    "birth_date",
    "careerType",
    "scholar_status",
    "ppUrl",
  ];

  for (const field of fieldsToCheck) {
    const originalValue = originalData.value[field] || "";
    const editValue = editForm.value[field] || "";
    if (String(originalValue) !== String(editValue)) {
      changes[field] = editValue;
    }
  }

  // Check phones
  const originalPhones = originalData.value.phones || [];
  const editPhones = editForm.value.phones || [];
  if (
    JSON.stringify(originalPhones.sort()) !==
    JSON.stringify(editPhones.sort())
  ) {
    changes.phones = editPhones;
  }

  return changes;
};

const saveChanges = async () => {
  if (!hasChanges.value) {
    notyf.info("No changes to save");
    return;
  }

  if (!studentId.value || !student.value?.id) {
    notyf.error("No student selected");
    return;
  }

  try {
    const changedFields = getChangedFields();

    if (Object.keys(changedFields).length === 0) {
      notyf.info("No changes to save");
      cancelEdit();
      return;
    }

    await studentUpdateStore.updateStudent(student.value.id, changedFields);

    // Refresh student data
    await studentStore.fetchStudent(studentId.value);
    student.value = studentStore.student.student;
    studentAllData.value = studentStore.student;
    emit("student-selected", studentAllData.value);

    cancelEdit();
  } catch (error) {
    console.error("Error updating student:", error);
  }
};

const searchStudent = async (lookupValue = studentId.value) => {
  try {
    await studentStore.fetchStudent(lookupValue);
    student.value = studentStore.student.student;
    studentAllData.value = studentStore.student;
    emit("student-selected", studentAllData.value);
    // Exit edit mode if active
    if (isEditMode.value) {
      cancelEdit();
    }
  } catch (error) {
    student.value = {};
    studentAllData.value = null;
    emit("student-selected", studentAllData.value);
    console.error("Error fetching student:", error);
  }
};

const searchStudentByOther = async () => {
  try {
    isLoading.value = true;
    await studentStore.fetchStudentByOther(studentId.value);
    studentsList.value = studentStore.studentsList;
    showPicker.value = studentsList.value.length > 0;
  } catch (error) {
    console.error("Error fetching student by other:", error);
  } finally {
    isLoading.value = false;
  }
};

const handlePickStudent = (picked) => {
  if (picked?.st_num) {
    studentId.value = picked.st_num;
    searchStudent(picked.st_num);
    return;
  }

  if (picked?.id) {
    searchStudent(picked.id);
  }
};

const handleSearch = () => {
  if (searchByOther.value) searchStudentByOther();
  else searchStudent();
};

const handleSend = (message) => {
  const recipient =
    modalType.value === "email" || modalType.value === "share"
      ? student.value.email
      : student.value.phones?.join(", ");
  alert(
    `${modalType.value === "email" ? "Email" : "SMS"
    } sent to ${recipient}:\n${message}`
  );
};

const sendQrEmail = async () => {
  try {
    showConfirmModal.value = false;
    const studentNumber = student.value?.st_num ?? studentId.value;
    if (!studentNumber) {
      notyf.error("No student selected");
      return;
    }

    const payload = { st_num: studentNumber };
    await messageStore.sendMail(payload);
    notyf.success("Send QR successfully");
  } catch (error) {
    console.error(error);
  }
};



const handleEmailSend = async (message) => {
  try {
    const studentNumber = student.value?.st_num ?? studentId.value;
    if (!studentNumber) return notyf.error("No student selected");

    const payload = { st_num: studentNumber, emailBody: message };
    await messageStore.sendMail(payload);
    notyf.success("Email sent successfully!");
    showEmailModal.value = false;
  } catch (error) {
    notyf.error("Failed to send email");
    console.error(error);
  }
};

const handleSmsSend = async (message) => {
  try {
    const studentNumber = student.value?.st_num ?? studentId.value;
    if (!studentNumber) return notyf.error("No student selected");

    const payload = { st_num: studentNumber, body: message };
    await messageStore.sendSms(payload);
    notyf.success("SMS sent successfully!");
    showSmsModal.value = false;
  } catch (error) {
    notyf.error("Failed to send SMS");
    console.error(error);
  }
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr || dateTimeStr === "Not Set Yet" || dateTimeStr === "Not Set Yet" || dateTimeStr === "-") return "Not Set Yet";
  
  const str = String(dateTimeStr);
  const cleanedStr = str.trim();
  const date = new Date(cleanedStr.replace(/-/g, "/"));
  
  if (isNaN(date.getTime())) {
    return str;
  }

  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();

  const hasTime = cleanedStr.includes(":") || cleanedStr.includes(" ") || cleanedStr.includes("T");
  
  if (hasTime) {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month} ${year} (${hours}:${minutes} ${ampm})`;
  }
  
  return `${day} ${month} ${year}`;
};

const copyText = (text, fieldName) => {
  if (!text || text === "Not Set Yet" || text === "N/A" || text === "-") return;
  navigator.clipboard.writeText(String(text)).then(() => {
    notyf.success(`${fieldName} copied to clipboard!`);
  }).catch((err) => {
    console.error("Failed to copy to clipboard:", err);
  });
};

</script>
