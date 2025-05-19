<!-- src/components/charts/StatsBarChart.vue -->
<script setup>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'
import { computed } from 'vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

/* -------- props -------- */
const props = defineProps({
  labels: { type: Array, required: true },
  values: { type: Array, required: true }
})

/* -------- computed data -------- */
const chartData = computed(() => ({
  labels: props.labels,               // ← استخدم props.labels
  datasets: [
    {
      data: props.values,             // ← استخدم props.values
      backgroundColor: '#092c67',
      borderRadius: 6
    
    }
  ]
}))

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
}
</script>

<template>
  <Bar :data="chartData" :options="chartOptions"  />
</template>
