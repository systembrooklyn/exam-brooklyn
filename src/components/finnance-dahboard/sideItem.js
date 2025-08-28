import { CalendarSearch ,BadgeDollarSign } from 'lucide-vue-next'

export const itemfinnance = [

   {
    name: 'Student Ditails',
    icon: BadgeDollarSign ,
    children: [
      { name: 'By Date', route: 'by-date'},  
      {name : "After 2 Days", route: 'after-2-days'},
      { name: 'After 1 week', route: 'after-1-week'},
      { name: 'Unpaid', route: 'unpaid'},
    ]
  },

]
