import { createApp } from "vue";
import App from "./App.vue";
import './style.css'
import 'primeicons/primeicons.css'
import "primeflex/primeflex.css";
import "primevue/resources/themes/bootstrap4-dark-blue/theme.css";
import PrimeVue from "primevue/config";

const app = createApp(App);
app.use(PrimeVue);
app.mount("#app");
