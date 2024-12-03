import WelcomePage from '../views/WelcomePage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import {createRouter, createWebHistory} from "vue-router";

const routes = [
    { path: '/', name: 'WelcomePage', component: WelcomePage },
    { path: '/register', name: 'RegisterPage', component: RegisterPage },
    // 其他路由...
];

export default createRouter({
    history: createWebHistory(),
    routes,
});
