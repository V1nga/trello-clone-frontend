import { createApp } from "vue";
import { createPinia } from "pinia";
import { fullscreenImagePlugin } from "vue-3-fullscreen-image-directive-plugin";
import "vue-3-fullscreen-image-directive-plugin/style.css";
import App from "./app/App.vue";
import { router } from "./router";
import { vuetify } from "./plugins/vuetify";
import "./assets/styles/global.scss";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.use(fullscreenImagePlugin);

app.mount("#app");
