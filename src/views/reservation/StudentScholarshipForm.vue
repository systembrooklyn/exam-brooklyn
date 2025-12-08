<template>
  <div class="w-full p-4 grid grid-cols-12 gap-4">

    <!-- LEFT SECTION (Student Info Form) -->
    <div class="col-span-8 space-y-4">

      <!-- First Row: Update + Last Update Time -->
      <div class="flex items-center justify-between border-b pb-2">
        <div class="flex items-center gap-2">
          <span class="text-blue-500 text-3xl">🔄</span>
          <span class="font-semibold text-lg">Update</span>
        </div>

        <div class="text-right">
          <p class="text-xs text-gray-500">Last Update</p>
          <p class="text-sm font-semibold">{{ lastUpdate }}</p>
        </div>
      </div>

      <!-- Grade + Scholarship + Student Type -->
      <div class="grid grid-cols-3 gap-2">
        <InputField label="Grade" v-model="form.grade" disabled />
        <InputField label="Scholarship" v-model="form.scholarship" disabled />
        <SelectField
          label="Student Type"
          :options="['Engineer', 'Non Engineer']"
          v-model="form.studentType"
        />
      </div>

      <hr />

      <!-- Study Type + Payment Method -->
      <div class="grid grid-cols-3 gap-2">
        <SelectField
          label="Study Type"
          :options="['Online','In Class']"
          v-model="form.studyType"
        />

        <InputField label="" disabled />

        <SelectField
          label="Payment Method"
          :options="['2 months','3 months','4 months']"
          v-model="form.paymentMethod"
        />
      </div>

      <hr />

      <!-- Papers Section -->
      <div class="grid grid-cols-3 gap-2 p-3 border rounded bg-blue-50">
        <SelectField label="ID" :options="['Yes','No']" v-model="form.paperId" disabled />
        <SelectField label="Certificate" :options="['Yes','No']" v-model="form.paperCert" disabled />
        <SelectField label="HR" :options="['Yes','No']" v-model="form.paperHr" disabled />
      </div>

      <InputField label="Nationality" v-model="form.nationality" />

      <!-- Offers Section -->
      <div class="border rounded p-2">
        <div class="bg-blue-900 text-white px-3 py-1 mb-2">Offers</div>
        <SelectField
          label="Top student"
          :options="['Yes','No']"
          v-model="form.topStudentOffer"
        />
      </div>
    </div>

    <!-- RIGHT SECTION (Notes + Submit) -->
    <div class="col-span-4 space-y-4">

      <!-- Amount -->
      <div>
        <label class="text-sm font-medium">Amount</label>
        <input
          type="number"
          v-model="form.amount"
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <!-- Notes -->
      <div>
        <label class="text-sm font-medium">Notes</label>
        <textarea
          v-model="form.notes"
          rows="10"
          class="w-full border rounded p-3"
        ></textarea>
      </div>

      <!-- Submit -->
      <button
        @click="submitForm"
        class="w-full bg-red-600 text-white py-3 rounded text-lg font-bold hover:bg-red-700 transition"
      >
        SUBMIT ▶
      </button>

      <button
        class="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
      >
        Temporary Receipt
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import InputField from "@/components/Reservation/InputField.vue";
import SelectField from "@/components/Reservation/SelectField.vue";

/* --------------------
   RECEIVED FROM WAITING LIST
-----------------------*/
const props = defineProps({
  student: Object,
});

/* --------------------
   FORM DATA
-----------------------*/
const form = reactive({
  name: props.student?.name || "",
  grade: props.student?.grade || "",
  scholarship: props.student?.scholarshipType || "",
  studentType: "",
  studyType: "",
  paymentMethod: "",
  paperId: props.student?.papers?.id || "Yes",
  paperCert: props.student?.papers?.certificate || "Yes",
  paperHr: props.student?.papers?.hr || "Yes",
  nationality: "",
  topStudentOffer: "",
  amount: "",
  notes: "",
});

const lastUpdate = "03/10/2025 17:33:21";

/* --------------------
   SUBMIT
-----------------------*/
const submitForm = () => {
  console.log("Submitting Form:", JSON.parse(JSON.stringify(form)));
  alert("Form Submitted");
};
</script>

<!-- Reusable Small Inputs -->
<script>
export default {}
</script>

