import WelcomePage from '../views/WelcomePage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import {createRouter, createWebHistory} from "vue-router";
import MyDashboard from "@/views/MyDashboard";

const routes = [
    { path: '/', name: 'WelcomePage', component: WelcomePage },
    { path: '/register', name: 'RegisterPage', component: RegisterPage },
    { path: '/dashboard', name: 'DashboardPage', component: MyDashboard },
    // 其他路由...
];

export default createRouter({
    history: createWebHistory(),
    routes,
});
