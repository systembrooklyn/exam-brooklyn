<template>
  <div class="space-y-10 p-6">
    <!-- Header -->
    <section>
      <div class="flex items-center gap-2 font-bold">
        <h1 class="text-3xl text-gray-800 mb-2">Welcome to the Dashboard</h1>
        <LayoutDashboardIcon size="30" class="text-primary" />
      </div>
      <p class="text-gray-600">Here you can manage exams, results, and users easily and efficiently.</p>
    </section>

    <!-- Stats Cards -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white shadow rounded-2xl p-6">
        <h2 class="text-gray-600 text-lg">Total Exams</h2>
        <p class="text-3xl font-bold text-indigo-600">12</p>
      </div>
      <div class="bg-white shadow rounded-2xl p-6">
        <h2 class="text-gray-600 text-lg">Registered Students</h2>
        <p class="text-3xl font-bold text-green-600">347</p>
      </div>
      <div class="bg-white shadow rounded-2xl p-6">
        <h2 class="text-gray-600 text-lg">Published Results</h2>
        <p class="text-3xl font-bold text-yellow-600">9</p>
      </div>
      <div class="bg-white shadow rounded-2xl p-6">
        <h2 class="text-gray-600 text-lg">Pending Reviews</h2>
        <p class="text-3xl font-bold text-red-500">4</p>
      </div>
    </section>

    <!-- Chart Section -->
    <section>
      <h2 class="text-xl font-semibold text-gray-700 mb-4">Monthly Overview</h2>
      <div class="bg-white shadow rounded-2xl p-6">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </section>

    <!-- Quick Actions -->
    <section>
      <h2 class="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
      <div class="flex flex-wrap gap-4">
        <router-link to="/dashboard/exams" class="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition">Manage Exams</router-link>
        <router-link to="/dashboard/results" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">View Results</router-link>
        <router-link to="/dashboard/users" class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">Manage Users</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { LayoutDashboardIcon } from 'lucide-vue-next'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

// Register components globally
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// Chart Data
const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    {
      label: 'Exams',
      backgroundColor: '#6366f1',
      data: [3, 2, 4, 1, 2],
    },
    {
      label: 'Results',
      backgroundColor: '#34d399',
      data: [2, 1, 3, 2, 1],
    },
  ]
}

// Chart Options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Monthly Exams & Results',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    }
  }
}
</script>

<style scoped>
/* Optional: give chart container fixed height */
.chart-container {
  height: 300px;
}
</style>
