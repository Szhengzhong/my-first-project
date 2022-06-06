import Vue from "vue";
import Request from "axios";

import Logo from "./components/logo.vue";
import Router from "./router";
import App from "./app.vue";

Vue.mixin({
    data: () => ({
        api: {
            async get(url) {
                return (await Request.get(`/api${url}`)).data;
            },

            async post(url, data) {
                return (await Request.post(`/api${url}`, data)).data;
            },

            async put(url, data) {
                return (await Request.put(`/api${url}`, data)).data;
            },

            async delete(url) {
                return (await Request.delete(`/api${url}`)).data;
            },
        },
    }),
});

Vue.component("logo", Logo);

Vue.config.productionTip = false;

new Vue({
    router: Router,
    render: (h) => h(App),
}).$mount("#app");
