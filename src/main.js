import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementPlus from 'element-plus';
import Antd from 'ant-design-vue';
import 'element-plus/dist/index.css';
import 'ant-design-vue/dist/reset.css';
import './assets/styles/global.css';
import pinia from './store';

const app = createApp(App);

// 挂载插件
app.use(router);
app.use(store);
app.use(ElementPlus);
app.use(Antd); // 引入 Ant Design Vue
app.use(pinia);

app.mount('#app');
