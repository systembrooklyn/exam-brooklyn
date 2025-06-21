<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePlacementTestsStore } from "@/stores/placementTestsStore";
import DataTable from "@/components/dashboard/DataTable.vue";
import SweetAlert2Modal from "@/components/global/SweetAlert2Modal.vue"; 

const placementTestsStore = usePlacementTestsStore();
const router = useRouter();

const showDeleteAlertDialog = ref(false);
const itemToDelete = ref(null);

// 📝 تعديل امتحان
const handleEditPlas = (exam) => {
  router.push({ name: "edit-placement", params: { id: exam.id } });
};

// ❌ حذف امتحان
const showDeleteAlert = (id) => {
  showDeleteAlertDialog.value = true;
  itemToDelete.value = id;
};

const deleteExam = async () => {
  if (itemToDelete.value) {
    await placementTestsStore.deletePlacementTest(itemToDelete.value);
    showDeleteAlertDialog.value = false;
    itemToDelete.value = null;
    placementTestsStore.fetchPlacementTests(); // تحديث القائمة بعد الحذف
  }
};

const cancelDelete = () => {
  showDeleteAlertDialog.value = false;
  itemToDelete.value = null;
};

onMounted(() => {
  placementTestsStore.fetchPlacementTests();

  
});
  console.log("Placement tests loaded:", placementTestsStore.placementTests);
</script>

<template>
  <div class="overflow-x-auto mx-auto p-6 bg-white rounded shadow">
    <h1 class="text-2xl font-bold text-primary mb-6">All Placement Tests</h1>

    <DataTable
      :headers="[ 
        { label: 'Placement Test Name', key: 'name' },
        { label: 'Description', key: 'description' },
        { label: 'Duration', key: 'duration' }
      ]"
      :isPlacementTests="true"
      :items="placementTestsStore.placementTests || []"
      resourceType="placement-tests"
      @edit="handleEditPlas"
      @delete="showDeleteAlert"
      :loading="placementTestsStore.loading"
    />

    <SweetAlert2Modal
      v-if="showDeleteAlertDialog"
      title="Are you sure?"
      text="This placement Test will be deleted."
      icon="warning"
      @confirm="deleteExam"
      @cancel="cancelDelete"
    />
  </div>
</template>
