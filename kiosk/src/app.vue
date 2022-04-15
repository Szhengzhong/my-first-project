<template>
    <div :key="version" id="screen">
        <div v-if="!url" class="configure">
            <div class="inner">
                <logo class="logo" :width="500" :height="82" />
                <div v-if="player && registration" class="message">
                    <span>Enter this code in the <b>Encompass Cast</b> dashboard to configure.</span>
                    <span class="registration">{{ code }}</span>
                    <span class="address">{{ address }}</span>
                </div>
                <div v-else-if="player" class="message">
                    <span>Open the <b>Encompass Cast</b> dashboard to configure.</span>
                    <span class="registration">{{ display }}</span>
                    <span class="address">{{ address }}</span>
                </div>
                <div v-else class="message">
                    <span>Connecting to network...</span>
                    <span class="address">{{ address }}</span>
                </div>
            </div>
        </div>
        <iframe v-else :src="url" frameborder="0"></iframe>
        <div class="kiosk"></div>
    </div>
</template>

<script>
    import Os from "os";
    import Logo from "@/components/logo.vue";
    import Encompass from "./encompass";
    import Instance from "./instance";

    export default {
        name: "app",

        components: {
            "logo": Logo,
        },

        data() {
            return {
                version: 0,
                loading: true,
                player: undefined,
                display: undefined,
                timeout: 10 * 1000,
                registration: undefined,
                address: undefined,
                url: undefined,
            };
        },

        computed: {
            code() {
                if (!this.registration) return undefined;

                return this.registration.match(/.{1,3}/g).join("-");
            },
        },

        watch: {
            url() {
                this.version += 1;
                this.timeout = this.url ? 5 * 60 * 1000 : 10 * 1000;
            },
        },

        async mounted() {
            await this.fetch();
        },

        methods: {
            async fetch() {
                await Encompass.register();

                this.url = Instance.url;
                this.player = Instance.player;
                this.display = Instance.name;
                this.registration = Instance.registration;
                this.address = await this.ip();
                this.loading = false;

                setTimeout(async () => {
                    await this.fetch();
                }, this.timeout);
            },

            async ip() {
                const ifaces = Os.networkInterfaces();
                const results = [];

                Object.keys(ifaces).forEach((ifname) => {
                    ifaces[ifname].forEach((iface) => {
                        if (iface.family !== "IPv4" || iface.internal !== false) return;
                        if (results.indexOf(iface.address) === -1) results.push(`${iface.address}`);
                    });
                });

                if (results.length > 0) await Encompass.logIp(results[0]);

                return results[0];
            },
        },
    };
</script>

<style lang="scss">
    @font-face {
        font-family: "Montserrat";
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: local("Montserrat Regular"), local("Montserrat-Regular"), url(./assets/montserrat.woff2) format("woff2");
        unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
    }

    @font-face {
        font-family: "Montserrat Black";
        font-style: normal;
        font-weight: 900;
        font-display: swap;
        src: local("Montserrat Black"), local("Montserrat-Black"), url(./assets/montserrat-black.woff2) format("woff2");
        unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
    }
</style>

<style lang="scss">
    html,
    body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    #screen {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        font-family: "Montserrat", sans-serif;
        background: #202c40;
        overflow: hidden;

        .kiosk {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: none;
        }

        iframe {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            overflow: hidden;
            cursor: none;
        }

        .configure {
            width: 100%;
            height: 100%;
            background: #202c40;
            display: flex;
            flex-direction: row;
            align-content: center;
            align-items: center;
            color: #fff;

            .logo {
                margin: 0 auto 80px auto
            }

            .inner {
                display: flex;
                flex-direction: column;
                width: 100%;
            }

            .message {
                display: flex;
                flex-direction: column;
                margin: 0 auto;
                background: #b6cfd0;
                color: #202c40;
                border-radius: 5px;
                padding: 20px 40px;
                font-size: 20px;

                .registration {
                    font-size: 35px;
                    margin: 20px 0 0 0;
                    color: #db2927;
                }

                .address {
                    font-size: 10px;
                    margin: 20px 0 0 0;
                    opacity: 0.5;
                }
            }
        }
    }
</style>
