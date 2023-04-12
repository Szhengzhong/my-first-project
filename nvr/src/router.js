import Vue from "vue";
import Router from "vue-router";

console.log("Called");

Vue.use(Router);

const router = new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [{
        path: "/",
        name: "home",
        component: () => import(/* webpackChunkName: "home" */ "./views/home.vue"),
        meta: {
            public: true,
        },  
    }, {
        path: "/config",
        name: "config",
        component: () => import(/* webpackChuckName: "config" */ "./views/config.vue"),
        meta: {
            public: true,
        },
    }, {
        path: "/register",
        name: "register",
        component: () => import(/* webpackChuckName: "register" */ "./views/register.vue"),
        meta: {
            public: true,
        },
    }],
});

export default router;
