<template>
    <div class="container">
        <p v-if="!connected && !loading && !selected">
            Choose your Wi-Fi network
        </p>
        <p v-if="!connected && !loading && selected">
            Enter Wi-Fi password for {{ selected.ssid }}
        </p>
        <p v-if="connected && !loading">
            Your device is now connected
        </p>
        <div v-if="!connected && !loading && !selected" class="networks">
            <div v-if="networks.length > 0" class="list">
                <network v-for="(network, index) in networks" :key="index" :network="network" v-on:click="select(network)" />
            </div>
            <div v-else class="list">
                <div class="empty">No Networks Available</div>
            </div>
        </div>
        <form v-else-if="!connected && !loading && selected" class="security" autocomplete="off">
            <div class="password">
                <input type="password" placeholder="Password" v-model="password" autocomplete="off" data-lpignore="true" />
            </div>
            <div class="actions">
                <div class="button" v-on:click="scan()">Cancel</div>
                <div class="button" v-on:click="validate()">Connect</div>
            </div>
        </form>
        <div v-else-if="!connected" class="loading">
            <spinner />
        </div>
        <div class="logo">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1009 166.92" alt="Encompass">
                <path fill="#db2927" fill-rule="nonzero" d="M290.61 49.08c10.27,1.56 18.99,7.48 24.29,15.57l9.03 -6.23c-7.47,-11.21 -19.62,-18.99 -33.32,-20.55l0 11.21z" />
                <path fill="#db2927" fill-rule="nonzero" d="M314.9 102.96c-6.23,9.65 -17.13,15.88 -29.59,15.88 -19.3,0 -35.19,-15.88 -35.19,-35.19 0,-17.13 12.15,-31.14 28.34,-34.57l0 -11.21c-22.11,3.42 -39.24,22.42 -39.24,45.47 0,25.53 20.56,46.09 46.09,46.09 16.2,0 30.21,-8.41 38.62,-20.87l-9.03 -5.6z" />
                <path fill="#db2927" fill-rule="nonzero" d="M238.29 28.84c12.77,-10.9 29.27,-17.44 47.34,-17.44 24.91,0 47.02,12.77 60.1,32.07l9.03 -6.22c-14.95,-22.11 -40.48,-36.75 -69.13,-36.75 -21.18,0 -40.49,7.78 -55.13,20.86l7.79 7.48z" />
                <path fill="#db2927" fill-rule="nonzero" d="M345.73 124.44c-13.08,19.31 -35.19,32.08 -60.42,32.08 -39.86,0 -72.56,-32.39 -72.56,-72.56 0,-17.75 6.23,-33.95 16.82,-46.4l-7.79 -7.79c-12.45,14.64 -19.93,33.63 -19.93,54.19 0,46.09 37.37,83.46 83.46,83.46 28.96,0 54.19,-14.64 69.45,-37.06l-9.03 -5.92z" />
                <path fill="#db2927" fill-rule="nonzero" d="M243.27 117.28c-7.16,-9.03 -11.52,-20.55 -11.52,-33.32 0,-29.59 24.29,-53.88 53.87,-53.88 18.69,0 35.19,9.66 44.85,23.98l9.34 -6.23c-11.52,-17.44 -31.45,-28.96 -53.87,-28.96 -35.82,0 -65.09,29.28 -65.09,65.09 0,15.57 5.61,29.9 14.64,41.11l7.78 -7.79z" />
                <path fill="#db2927" fill-rule="nonzero" d="M330.47 113.54c-9.66,14.64 -26.16,23.98 -44.85,23.98 -12.76,0 -24.6,-4.67 -33.94,-12.14l-7.79 7.78c11.21,9.66 25.85,15.26 41.73,15.26 22.42,0 42.35,-11.52 54.19,-28.96l-9.34 -5.92z" />
                <polygon fill="#202c40" fill-rule="nonzero" points="65.45,114.79 65.45,139.7 -0.26,139.7 -0.26,30.39 64.21,30.4 64.21,55.31 26.84,55.31 26.84,72.44 57.98,72.44 57.98,97.04 26.84,97.04 26.84,115.1 65.45,115.1 " />
                <polygon fill="#202c40" fill-rule="nonzero" points="86.94,30.4 114.03,30.4 156.07,95.48 156.7,95.48 156.7,30.4 183.79,30.4 183.79,139.7 156.7,139.7 114.66,74.62 114.03,74.62 114.03,139.7 86.94,139.7 " />
                <path fill="#202c40" fill-rule="nonzero" d="M353.2 84.89c0,-33.32 25.85,-56.36 56.99,-56.36 31.14,0 56.99,22.73 56.99,56.36 0,33.32 -25.84,56.37 -56.99,56.37 -31.14,0 -56.99,-22.73 -56.99,-56.37zm85.95 0c0,-18.68 -13.08,-30.52 -28.96,-30.52 -16.19,0 -28.96,11.84 -28.96,30.52 0,18.69 13.08,30.52 28.96,30.52 15.88,0 28.96,-11.83 28.96,-30.52z" />
                <polygon fill="#202c40" fill-rule="nonzero" points="488.98,30.4 518.57,30.4 549.08,105.14 579.6,30.4 609.5,30.4 609.5,139.7 582.41,139.7 582.41,82.09 582.09,82.09 559.36,139.7 539.43,139.7 516.7,82.09 516.07,82.09 516.07,139.7 488.98,139.7 " />
                <path fill="#202c40" fill-rule="nonzero" d="M715.07 68.7c0,23.36 -16.5,38.3 -40.48,38.3l-14.02 0 0 32.7 -27.09 0 0 -109.31 41.11 0.01c23.98,0 40.48,14.63 40.48,38.3zm-27.4 0c0,-10.59 -6.85,-13.7 -15.26,-13.7l-11.53 0 0 27.09 11.53 0c8.09,0 15.26,-2.8 15.26,-13.39z" />
                <path fill="#202c40" fill-rule="nonzero" d="M789.5 124.13l-42.35 0 -5.3 15.57 -29.27 0 41.42 -109.31 28.96 0.01 41.42 109.3 -29.27 0 -5.61 -15.57zm-9.03 -24.91l-12.46 -35.81 -12.45 35.81 24.91 0z" />
                <path fill="#202c40" fill-rule="nonzero" d="M833.72 113.54l21.8 -10.27c3.11,6.23 8.1,13.39 17.44,13.39 6.23,0 12.15,-3.12 12.15,-10.59 0,-5.3 -2.5,-7.79 -12.15,-11.83l-6.85 -2.5c-14.33,-5.6 -28.65,-13.7 -28.65,-32.07 0,-19.31 16.19,-31.14 35.5,-31.14 19.31,0 31.45,11.83 36.75,23.35l-19.93 11.53c-4.67,-8.1 -9.97,-10.9 -15.57,-10.9 -5.61,0 -9.97,2.49 -9.97,7.78 0,4.05 2.18,7.17 13.39,11.53l7.48 2.8c20.24,8.09 28.33,17.13 28.33,31.76 0,23.67 -21.17,34.57 -39.86,34.57 -19.62,0.31 -35.81,-11.21 -39.86,-27.41z" />
                <path fill="#202c40" fill-rule="nonzero" d="M929.02 113.54l21.8 -10.27c3.11,6.23 8.09,13.39 17.43,13.39 6.23,0 12.15,-3.12 12.15,-10.59 0,-5.3 -2.49,-7.79 -12.15,-11.83l-6.85 -2.5c-14.32,-5.6 -28.65,-13.7 -28.65,-32.07 0,-19.31 16.2,-31.14 35.5,-31.14 19.31,0 31.46,11.83 36.75,23.35l-19.93 11.53c-4.67,-8.1 -9.96,-10.9 -15.57,-10.9 -5.6,0 -9.96,2.49 -9.96,7.78 0,4.05 2.18,7.17 13.39,11.53l7.47 2.8c20.24,8.09 28.34,17.13 28.34,31.76 0,23.67 -21.18,34.57 -39.86,34.57 -19.31,0.31 -35.5,-11.21 -39.86,-27.41z" />
            </svg>
        </div>
    </div>
</template>

<script>
    import request from "./request";
    import network from "./network.vue";
    import spinner from "./spinner.vue";

    export default {
        name: "app",

        components: {
            network,
            spinner,
        },

        data() {
            return {
                connected: false,
                loading: true,
                interval: null,
                selected: null,
                password: "",
                networks: [],
                iface: null,
            };
        },

        mounted() {
            if (this.interval) {
                clearInterval(this.interval);

                this.interval = null;
            }

            this.scan();
        },

        methods: {
            async scan() {
                this.selected = null;

                if (!this.iface) {
                    this.iface = (((((await request.get("/api/")) || {}).data || {}).devices || []).find((device) => device.type === "wifi") || {}).iface || null;
                }

                const response = await request.get("/api/networks/");
                const data = Array.isArray(response.data) ? response.data : [];

                this.networks = data;
                this.loading = false;

                if (!this.interval) this.interval = setInterval(() => this.scan(), 10 * 1000);
            },

            connect(ssid, password) {
                if (this.iface) {
                    this.loading = true;
                    this.connected = false;

                    request.post(`/api/${this.iface}/connect/`, { ssid, password });

                    setTimeout(() => {
                        this.connected = true;
                        this.loading = false;
                    }, 1000 * 5);
                }
            },

            validate() {
                if (this.password && this.password !== "") {
                    this.connect(this.selected.ssid, this.password);
                }
            },

            select(selected) {
                if (this.interval) {
                    clearInterval(this.interval);
                    this.interval = null;
                }

                if (selected.security.mode && selected.security.mode !== "" && selected.security.mode !== "none") {
                    this.selected = { ...selected };
                } else {
                    this.connect(selected.ssid);
                }
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
        src: local("Montserrat Regular"), local("Montserrat-Regular"), url(./assets/montserrat.woff) format("woff2");
        unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
    }

    html {
        height: 100%;
    }

    body {
        margin: 0;
        padding: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #fff;
        font-family: "Montserrat", sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-size: 12pt;
        color: #333;
    }

    ::-webkit-scrollbar {
        background-color: transparent;
        width: 4px;
        height: 4px;
    }

    ::-webkit-scrollbar-track {
        background-color: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background-color: #35353554;
        border-radius: 0;
    }

    ::-webkit-scrollbar-button {
        display: none;
    }

    .button {
        height: 40px;
        box-sizing: border-box;
        border-radius: 3px;
        background: #202c40;
        color: #fff !important;
        text-decoration: none !important;
        display: inline-flex;
        align-items: center;
        border: 1px #1a1a1a solid;
        padding: 10.5px 14px 9.5px 14px;
        user-select: none;
        margin: 0 0 0 10px;
        white-space: pre;
        cursor: pointer;

        &:first-child {
            margin: 0;
        }

        &:hover {
            box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.44), 0 2px 1px -1px rgba(0, 0, 0, 0.42), 0 1px 3px 1px rgba(0, 0, 0, 0.5);
            text-decoration: none !important;
        }
    }

    #portal {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;

        .container {
            flex: 1;
            width: 100%;
            max-width: 790px !important;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            padding: 30px 20px;
            font-size: 17px;
            overflow: hidden;

            @media (min-width: 300px) and (max-width: 815px) {
                margin: 0;
                width: 100%;
            }

            .logo {
                display: flex;
                justify-content: space-around;
                padding: 10px 0 0 0;

                svg {
                    width: 197px;
                }
            }

            p {
                margin: 20px 0 10px 0;
                text-align: center;
                font-size: 17px;
                font-weight: bold;
                user-select: none;
            }

            .loading {
                flex: 1;
                display: flex;
                padding: 0 0 50% 0;
                flex-direction: row;
                justify-content: space-around;
                align-items: center;
            }

            .security {
                flex: 1;
                margin: 10px 0 0 0;
                overflow: overlay;

                .password {
                    display: flex;
                    flex-direction: row;
                    background: #ececec;
                    border-bottom: 2px #d4d4d4 solid;
                    padding: 20px;

                    &:focus-within {
                        border-bottom: 2px #202c40 solid;
                    }

                    input {
                        flex: 1;
                        border: 0 none !important;
                        outline: 0 none !important;
                        background: transparent;
                        font-size: 14px;
                        color: #000;
                    }
                }

                .actions {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-end;
                    margin: 14px 0 0 0;
                }
            }

            .networks {
                flex: 1;
                margin: 10px 0 0 0;
                border-top: 1px #d4d4d4 solid;
                overflow: overlay;

                .list {
                    padding: 5px 20px;
                    background: #fff;
                }

                .network {
                    border-bottom: 1px #fff solid;

                    &:last-child {
                        border-bottom: 0 none;
                    }
                }

                .empty {
                    padding: 20px 10px;
                    color: #333;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    user-select: none;
                    cursor: default;
                    opacity: 0.9;

                    @media (min-width: 300px) and (max-width: 815px) {
                        font-size: 15px;
                    }
                }
            }
        }
    }
</style>
