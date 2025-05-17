<template>
  <div>
              <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Training Plane</h2>
    <Bar :data="chartData" :options="chartOptions" :width="500" :height="200" />
  </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  completedCount: {
    type: Number,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
})

const remainingCount = props.totalCount - props.completedCount

const chartData = {
  
  datasets: [
    {
      label: 'Completed',
      data: [props.completedCount],
      backgroundColor: '#22c55e', // أخضر
    },
    {
      label: 'Remaining',
      data: [remainingCount],
      backgroundColor: '#e2e8f0', // رمادي فاتح
    },
  ],
}

const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  scales: {
    x: {
      max: props.totalCount,
      ticks: {
        stepSize: 1,
      },
    },
    y: {
      stacked: true,
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
    },
    tooltip: {
      enabled: true,
    },
  },
}
</script>
