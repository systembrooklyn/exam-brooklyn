<template>
  <li>
    <div class="w-full cursor-pointer flex items-center hover:bg-gray-100 transition-all duration-300 ease-in-out" :class="[
      isActive ? 'bg-indigo-100 text-indigo-600 font-semibold rounded-2xl' : '',
      isExpanded ? 'px-4 py-2.5 justify-between' : 'h-12 justify-center'
    ]" @click="toggle" :title="!isExpanded ? item.name : ''">
      <div class="flex items-center" :class="isExpanded ? 'gap-3' : 'justify-center w-full'">
        <component :is="item.icon" class="w-5 h-5 text-indigo-400 flex-shrink-0"
          :class="{ 'text-indigo-600 ': isActive }" v-if="item.icon" />
        <span class="text-sm whitespace-nowrap transition-all duration-300 ease-in-out origin-left"
          :class="isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'">{{ item.name }}</span>
      </div>

      <svg v-if="isExpanded && item.children" xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 transition-transform duration-200 flex-shrink-0" :class="{ 'rotate-90': open }" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>

    <transition name="fade-slide hover:bg-gray-100">
      <ul v-if="open && item.children && isExpanded" class="pl-10">
        <li v-for="child in item.children" :key="child.name"
          class="p-2 relative cursor-pointer font-semibold text-gray-600" :class="{
            activ: route.name === child.route,
          }" @click="router.push({ name: child.route })">
          {{ child.name }}
          <span class="list-item absolute top-4 -left-3"></span>
        </li>
      </ul>
    </transition>
  </li>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const props = defineProps({ item: Object, isExpanded: { type: Boolean, default: true } });
const router = useRouter();
const route = useRoute();

const open = ref(false);

onMounted(() => {
  if (props.item.children) {
    open.value = props.item.children.some(
      (child) => route.name === child.route
    );
  }
});


const isActive = computed(() => {
  if (props.item.route) {
    return route.name === props.item.route;
  }
  if (props.item.children) {
    return props.item.children.some((child) => route.name === child.route);
  }
  return false;
});


const toggle = () => {
  if (props.item.children) {
    open.value = !open.value;
  } else if (props.item.route) {
    router.push({ name: props.item.route });
  }
};
</script>

<style scoped>
li .list-item {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 10px;
  border-radius: 50%;
  background-color: #ccc;
  transition: background-color 0.3s, box-shadow 0.3s;
}

li.activ .list-item {
  background-color: #624ff6;
  box-shadow: 0 0 10px #624ff6;
}

ul {
  list-style-type: none;
}
</style>
