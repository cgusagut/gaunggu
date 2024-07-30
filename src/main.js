import { createApp } from "vue";
import "@/assets/style/style.css";
import "@/assets/style/global.less";
import App from "@/App.vue";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

import { createPinia } from "pinia";
import router from "@/router";

export const app = createApp(App);
import * as ElIcons from "@element-plus/icons-vue"; //全局注册图标
for (const iconName in ElIcons) {
  app.component(iconName, ElIcons[iconName]);
}
// for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
//   app.component(key, component);
// }

app.use(ElementPlus);

app.use(createPinia());
app.use(router);
app.mount("#app");
