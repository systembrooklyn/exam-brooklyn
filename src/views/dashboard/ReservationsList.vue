<script setup>
import { ref, onMounted, computed } from "vue";
import { useReservationStore } from "@/stores/reservations";
import DataTable from "@/components/dashboard/DataTable.vue";
import SweetAlert2Modal from "@/components/global/SweetAlert2Modal.vue";
import Modal from "@/components/global/Modal.vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const reservationStore = useReservationStore();
const showModal = ref(false);
const saving = ref(false);
const isEditing = ref(false);
const form = ref({
  name: "",
  email: "",
  mobile: "",
  ID_number: "",
  birth_date: "",
  grade: "",
  company: "",
  marketing_code: "",
  scholarship: "",
  called_time: "",
  called_by: "",
  faculity: "",
  major: "",
  careerType: "",
});

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
  form.value = {
  name: "",
  email: "",
  mobile: "",
  ID_number: "",
  birth_date: "",
  grade: "",
  company: "",
  marketing_code: "",
  scholarship: "",
  called_time: "",
  called_by: "",
  faculity: "",
  major: "",
  careerType: "",
}
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  saving.value = false;
};

const editReservation = (reservation) => {
  isEditing.value = true;

form.value = {
  ...reservation,
  student: {
    ...reservation.student,
    scholarship_id: reservation.student.scholarship?.id || "",
  },
  called_by: reservation.called_by?.id || "", // هنا ضروري يكون ID فقط
  status: reservation.status?.key || "",
};


  showModal.value = true;
};

const saveReservation = async () => {
  console.log("form.value:", form.value);
  
  saving.value = true;
const payload = {
  name: form.value.student.name,
  email: form.value.student.email,
  phones: form.value.student.phones,
  ID_number: form.value.student.ID_number,
  grade: form.value.student.grade,
  birth_date: form.value.student.birth_date,
  company: form.value.student.company,
  marketing_code: form.value.student.marketing_code,
  scholarship: form.value.student.scholarship_id, // ID فقط
  status: form.value.status,
  called_by: form.value.called_by, // ID فقط
  called_time: form.value.called_time,
  careerType: form.value.student.careerType,
  faculity: form.value.student.faculity,
  major: form.value.student.major,
};

console.log("payload:", payload);


  try {
    if (isEditing.value) {
      console.log("payload:", payload);
      
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
});
</script>

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
    { label: 'Scholarship', key: 'student.scholarship.name' },
    { label: 'Status', key: 'status.label' },

  ]"
  :items="reservationStore.reservations"
  resourceType="reservations"
  :isReservation="true"
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
  

  