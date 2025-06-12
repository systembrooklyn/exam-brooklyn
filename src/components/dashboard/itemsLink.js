import { BookOpenCheck, PlusCircle, Settings, Users, FileText, GraduationCap, ShieldCheck, UserCog ,ClipboardCheck, Brain } from 'lucide-vue-next'

export const items = [
  {
    name: 'Users',
    icon: UserCog,
    route: 'users'
  },
  {
    name: 'Exams',
    icon: BookOpenCheck,
    children: [
      { name: 'All Exams', route: 'exams', icon: FileText },  
      { name: 'Create Exam', route: 'create-exam', icon: PlusCircle }  
    ]
  },
  {
    name: 'Courses',
    icon: GraduationCap,  
    route: 'courses'
  },
  {
    name: 'Instructors',
    icon: Users,  
    route: 'instructors'
  },
  {
    name: 'Scholarships', 
    icon: GraduationCap,  
    route: 'scholarships'
  },
  {
    name: 'Roles',
    icon: ShieldCheck,  
    route: 'roles'
  },
  {
    name:'Reservations',
    icon: ClipboardCheck  ,  
    route: 'reservations'
  },
    {
    name: 'Placement Tests',
    icon: Brain ,
    children: [
      { name: 'Placement List', route: 'placement'},  
      { name: 'Create Placement Test', route: 'create-placement'}  
    ]
  },
  {
    name: 'Settings',
    icon: Settings,  
    route: 'settings'
  }
]
