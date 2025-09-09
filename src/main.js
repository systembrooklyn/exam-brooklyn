import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import mitt from "mitt";
import VueTelInput from "vue-tel-input";
import "vue-tel-input/vue-tel-input.css";
import { useAuthStore } from "./stores/auth";

const emitter = mitt();
const pinia = createPinia();

const app = createApp(App);

app.provide("emitter", emitter);
app.use(VueTelInput);
app.use(pinia);
app.use(router);

// ✅ استدعاء initAuth قبل mount
const authStore = useAuthStore();
authStore.initAuth().then(() => {
  app.mount("#app");
});
