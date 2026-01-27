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
                <network v-for="(network, index) in networks" :key="index" :network="network"
                    v-on:click="select(network)" />
            </div>
            <div v-else class="list">
                <div class="empty">No Networks Available</div>
            </div>
        </div>
        <form v-else-if="!connected && !loading && selected" class="security" autocomplete="off">
            <div class="password">
                <input type="password" placeholder="Password" v-model="password" autocomplete="off"
                    data-lpignore="true" />
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
            <svg id="图层_1" data-name="图层 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 331.211 113.729"
                version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink">
                <title>B1_Logo_New</title>
                <path fill="#312559"
                    d="M37.657,78.358v-43H73.151a13.57,13.57,0,0,1,5.815,2.265,13.213,13.213,0,0,1,3.667,16.951c5.307,3.9,7.619,10.265,4.749,16.471-1.484,3.209-5.683,7.312-9.439,7.312Zm7.488-25.382H73.151c1.8,0,3.746-2.84,3.746-4.931s-2-4.624-3.447-4.624h-28.3Zm0,7.764v9.406l.449.448H76.445a4.755,4.755,0,0,0,4.72-4.927c0-2.391-1.552-4.927-3.821-4.927Z">
                </path>
                <polygon fill="#312559"
                    points="96.48 78.35 103.903 78.35 103.903 35.366 89.232 35.366 89.232 43.127 96.417 43.127 96.48 78.35">
                </polygon>
                <path fill="#312559"
                    d="M24.245,101.443a6.906,6.906,0,0,1-6.9-6.9V19.171a6.906,6.906,0,0,1,6.9-6.9H48.107a.641.641,0,0,1,.64.64v9.122a.64.64,0,0,1-.64.639H27.748V91.06L48.1,90.9a.645.645,0,0,1,.457.189.632.632,0,0,1,.188.451V100.8a.641.641,0,0,1-.64.64Z">
                </path>
                <path fill="#312559"
                    d="M93.453,101.443a.641.641,0,0,1-.64-.64V91.544a.641.641,0,0,1,.64-.64l20.359.156V22.673H93.453a.64.64,0,0,1-.64-.639V12.912a.641.641,0,0,1,.64-.64h23.862a6.906,6.906,0,0,1,6.9,6.9V94.544a6.906,6.906,0,0,1-6.9,6.9Z">
                </path>
                <polygon fill="#312559"
                    points="206.567 94.573 206.567 71.936 211.375 71.936 211.682 72.242 211.682 101.303 206.26 101.303 181.811 78.666 181.811 101.303 176.696 101.303 176.696 72.242 177.003 71.936 182.118 71.936 205.952 94.268 206.567 94.573">
                </polygon>
                <polygon fill="#312559"
                    points="249.941 77.442 249.941 71.936 223.096 71.936 218.025 71.936 218.025 77.442 218.025 83.968 218.025 101.303 223.096 101.303 249.941 101.303 249.941 96 223.139 96 223.139 89.27 245.719 89.27 245.719 83.968 223.096 83.968 223.096 77.442 249.941 77.442">
                </polygon>
                <path fill="#312559"
                    d="M162.193,71.783H144.119a8.969,8.969,0,0,0-8.87,9.045V92.412a8.969,8.969,0,0,0,8.87,9.045h18.074a8.969,8.969,0,0,0,8.87-9.045V80.828a8.969,8.969,0,0,0-8.87-9.045M140.086,80.26a3.639,3.639,0,0,1,3.6-3.672H162.63a3.638,3.638,0,0,1,3.6,3.672V92.979a3.639,3.639,0,0,1-3.6,3.673H143.683a3.64,3.64,0,0,1-3.6-3.673Z">
                </path>
                <polygon fill="#312559"
                    points="180.944 35.457 180.944 59.53 204.682 59.53 204.682 64.834 175.828 64.834 175.828 35.457 180.944 35.457">
                </polygon>
                <polygon fill="#312559"
                    points="289.768 35.457 289.768 47.493 293.349 47.493 306.855 35.457 314.529 35.457 298.787 50.072 314.529 64.834 306.651 64.834 293.349 52.798 289.768 52.798 289.768 64.834 284.652 64.834 284.652 35.457 289.768 35.457">
                </polygon>
                <path fill="#312559"
                    d="M135.719,64.835V35.413h24.286a9.291,9.291,0,0,1,3.979,1.55,9.043,9.043,0,0,1,2.51,11.6c3.631,2.666,5.212,7.023,3.249,11.269-1.016,2.2-3.889,5-6.459,5Zm5.124-17.367h19.162c1.233,0,2.563-1.944,2.563-3.374S161.2,40.93,160.21,40.93H140.843Zm0,5.312v6.436l.307.306h21.11a3.254,3.254,0,0,0,3.229-3.371c0-1.636-1.062-3.371-2.615-3.371Z">
                </path>
                <path fill="#312559"
                    d="M233.92,35.321H215.846a8.969,8.969,0,0,0-8.87,9.045V55.95A8.969,8.969,0,0,0,215.846,65H233.92a8.969,8.969,0,0,0,8.87-9.045V44.366a8.969,8.969,0,0,0-8.87-9.045M211.813,43.8a3.639,3.639,0,0,1,3.6-3.672h18.947a3.638,3.638,0,0,1,3.6,3.672V56.517a3.639,3.639,0,0,1-3.6,3.673H215.41a3.64,3.64,0,0,1-3.6-3.673Z">
                </path>
                <path fill="#312559"
                    d="M255.017,40.668h23a.449.449,0,0,0,.449-.448V35.735a.45.45,0,0,0-.449-.449H255.155a8.873,8.873,0,0,0-8.667,9.046V55.915a8.872,8.872,0,0,0,8.667,9.045h22.864a.449.449,0,0,0,.449-.448V60.027a.449.449,0,0,0-.449-.448h-23a3.6,3.6,0,0,1-3.509-3.672V44.34a3.6,3.6,0,0,1,3.509-3.672">
                </path>
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

        async connect(ssid, password) {
            if (this.iface) {
                this.loading = true;
                this.connected = false;

                await request.post(`/api/${this.iface}/connect/`, { ssid, password });

                // setTimeout(() => {
                //     this.connected = true;
                //     this.loading = false;
                // }, 1000 * 5);

                if (((((await request.get("/api/")) || {}).data || {}).connections || []).find((connection) => connection.iface === this.iface && connection.ssid === ssid)) {
                    this.connected = true;
                } else {
                    this.scan();
                }
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
