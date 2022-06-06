import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const router = new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [{
        path: "/",
        name: "console",
        component: () => import(/* webpackChunkName: "console" */ "./views/console.vue"),
        meta: {
            public: true,
        },
    }],
});

export default router;
