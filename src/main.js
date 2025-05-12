import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import mitt from 'mitt' 
import VueTelInput from 'vue-tel-input';
import 'vue-tel-input/vue-tel-input.css';

const emitter = mitt()
const pinia = createPinia()

const app = createApp(App)


app.provide('emitter', emitter) 


app.use(VueTelInput);

app.use(router)
app.use(pinia)

app.mount('#app')
