<template>
  <div>
                  <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200"> Payments</h2>
    <Pie :data="chartData" :options="chartOptions" :width="300" :height="300" />
  </div>
</template>

<script setup>
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  payments: Array
})


const paid = props.payments?.filter(p => p.status === 'paid').length || 0
const unpaid = props.payments?.filter(p => p.status !== 'paid').length || 0

const chartData = {
  labels: ['Paid', 'Unpaid'],
  datasets: [
    {
      label: 'Payments Status',
      data: [paid, unpaid],
      backgroundColor: ['#10b981', '#ef4444'], // أخضر وأحمر
      borderWidth: 1,
    },
  ],
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
    },
    title: {
      display: false,
    },
  },
}
</script>
