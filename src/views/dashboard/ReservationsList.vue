<template>
    <div class="space-y-6 p-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">Reservations List</h1>
        
        <!-- Button to Add New Reservation (if the user has permission) -->
        <div v-if="authStore.hasPermission('create-reservations')" @click="toggleForm" class="buttons">
          <button class="btn">
            <span></span>
            <p data-start="good luck!" data-text="ADD!" data-title="new Reservation"></p>
          </button>
        </div>
      </div>
  
      <div>
        <!-- DataTable to display Reservations -->
        <DataTable
  :headers="[
    { label: 'Student Name', key: 'student.name' },
    { label: 'Student Email', key: 'student.email' },
    { label: 'Grade', key: 'student.grade' },
    { label: 'Scholarship', key: 'student.scholarship' },
    { label: 'Reserved Time', key: 'reserved_time' },
    { label: 'Called By', key: 'called_by.name' },
    { label: 'Registered By', key: 'registered_by.name' },
    { label: 'Branch', key: 'branch.name' },
    { label: 'Marketing Code', key: 'marketing_code' },
    { label: 'Status', key: 'status.label' },
    // أضف باقي الحقول اللي محتاجها
  ]"
  :items="reservationStore.reservations"
  resourceType="reservations"
  @edit="editReservation"
  @delete="confirmDelete"
/>

      </div>
  
      <!-- Reuse Modal Component for Add/Edit Reservation -->
      <Modal
        v-if="showModal"
        :showModal="showModal"
        :modalTitle="isEditing ? 'Edit Reservation' : 'Add Reservation'"
        :form="form"
        :saving="saving"
        :isReservation="true"
        @closeModal="closeModal"
        @saveData="saveReservation"
      />
  
      <!-- SweetAlert2 Modal for Confirmation -->
      <SweetAlert2Modal
        v-if="showDeleteAlert"
        :title="'Are you sure?'"
        :text="'This reservation will be deleted.'"
        :confirmButtonText="'Yes, delete it!'"
        :cancelButtonText="'Cancel'"
        @confirm="deleteReservation"
        @cancel="cancelDelete"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from "vue";
  import { useReservationStore } from "@/stores/reservations";  // Assuming the store is available
  import DataTable from "@/components/dashboard/DataTable.vue";
  import SweetAlert2Modal from "@/components/global/SweetAlert2Modal.vue";
  import Modal from "@/components/global/Modal.vue";
  import { useAuthStore } from "@/stores/auth";
  
  const authStore = useAuthStore();
  const reservationStore = useReservationStore();
  const showModal = ref(false);
  const saving = ref(false);
  const isEditing = ref(false);
  const form = ref({ student: {}, reserved_time: "", called_by: {}, status: {} });
  const showDeleteAlert = ref(false);
  const reservationIdToDelete = ref(null);
  const search = ref("");
  const reservations = ref([]);
  
  const filteredReservations = computed(() => {
    return reservationStore.reservations.filter((reservation) => {
      return (
        reservation.student.name.toLowerCase().includes(search.value.toLowerCase()) ||
        reservation.reserved_time.toLowerCase().includes(search.value.toLowerCase())
      );
    });
  });
  
  const toggleForm = () => {
    showModal.value = true;
    isEditing.value = false;
    form.value = { student: {}, reserved_time: "", called_by: {}, status: {} };
  };
  
  const closeModal = () => {
    showModal.value = false;
    isEditing.value = false;
    saving.value = false;
  };
  
  const editReservation = (reservation) => {
    isEditing.value = true;
    form.value = { ...reservation };
    showModal.value = true;
  };
  
  const saveReservation = async () => {
    saving.value = true;
  
    const payload = {
      ...form.value,
      reserved_time: String(form.value.reserved_time),  // Ensure correct format
    };
  
    try {
      if (isEditing.value) {
        await reservationStore.updateReservation(form.value.id, payload);
      } else {
        await reservationStore.addReservation(payload);
      }
      closeModal();
    } catch (error) {
      console.error(error);
    } finally {
      saving.value = false;
    }
  };
  
  const confirmDelete = (id) => {
    showDeleteAlert.value = true;
    reservationIdToDelete.value = id;
  };
  
  const deleteReservation = async () => {
    await reservationStore.deleteReservation(reservationIdToDelete.value);
    showDeleteAlert.value = false;
    reservationIdToDelete.value = null;
  };
  
  const cancelDelete = () => {
    showDeleteAlert.value = false;
    reservationIdToDelete.value = null;
  };
  
  onMounted(() => {
    reservationStore.fetchReservations();
    saving.value = false;
    reservations.value = reservationStore.reservations;
    console.log("Reservations:", reservationStore.reservations);
    
  });
  </script>
  