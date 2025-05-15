<template>
  <div class="student-profile">
    <h2>Welcome {{ fullName }}!</h2>

    <section>
      <h3 @click="toggleSection('personal')" class="section-header">
        General & Personal Information
        <span>{{ isOpen.personal ? '▲' : '▼' }}</span>
      </h3>
      <div v-if="isOpen.personal" class="section-content">
        <p><strong>Full Name:</strong> {{ fullName }}</p>
        <p><strong>Student No:</strong> {{ student.student_user?.st_num || '-' }}</p>
        <p><strong>Email:</strong> {{ student.student_user?.email || '-' }}</p>
        <p><strong>Phones:</strong>
          <span v-if="student.phones.length">
            <span v-for="(phone, index) in student.phones" :key="phone.id">
              {{ phone.phone }}<span v-if="index < student.phones.length -1">, </span>
            </span>
          </span>
          <span v-else>-</span>
        </p>
        <p><strong>Date Of Birth:</strong> {{ formattedBirthDate }}</p>
        <p><strong>ID Number:</strong> {{ student.ID_number || '-' }}</p>
        <p><strong>Career Type:</strong> {{ student.careerType || '-' }}</p>
        <p><strong>Grade:</strong> {{ student.grade || '-' }}</p>
        <p><strong>Company:</strong> {{ student.company || '-' }}</p>
      </div>
    </section>

    <section>
      <h3 @click="toggleSection('scholarship')" class="section-header">
        Scholarship & Courses Information
        <span>{{ isOpen.scholarship ? '▲' : '▼' }}</span>
      </h3>
      <div v-if="isOpen.scholarship" class="section-content">
        <p><strong>Scholarship Name:</strong> {{ student.scholarship?.name || '-' }}</p>
        <p><strong>Status:</strong> {{ student.scholar_status || '-' }}</p>
        <p><strong>Total Attendance:</strong> {{ student.total_attendance || 0 }}</p>
        <p><strong>Total Supposed:</strong> {{ student.total_supposed || 0 }}</p>
        <p><strong>Courses:</strong></p>
        <ul>
          <li v-for="course in student.scholarship?.courses || []" :key="course.id">
            {{ course.code }} - {{ course.name }}
          </li>
          <li v-if="!(student.scholarship?.courses?.length)">No courses available.</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

const props = defineProps({
  student: {
    type: Object,
    required: true,
  },
});

const isOpen = reactive({
  personal: true,
  scholarship: false,
});

function toggleSection(section) {
  isOpen[section] = !isOpen[section];
}

const fullName = computed(() => props.student.name || '-');

const formattedBirthDate = computed(() => {
  if (!props.student.birth_date) return '-';
  const d = new Date(props.student.birth_date);
  return d.toLocaleDateString();
});
</script>

<style scoped>
.student-profile {
  max-width: 600px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}
.section-header {
  cursor: pointer;
  background-color: #f5f5f5;
  padding: 10px;
  margin-top: 15px;
  border-radius: 4px;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-content {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-top: none;
  background-color: #fafafa;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>
