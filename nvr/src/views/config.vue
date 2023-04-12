<template>
    <div id="config">
        <navigation />
        <div ref="layout" class="layout">
            <div class="screen">
                <pages v-on:show="show" :value="page" />
                <div class="content" v-show="!loading">
                    <h2>NVR Camera Configuration</h2>
                    <p>
                        Displayed here is the Cameras configured for this Encompass NVR Player
                    </p>
                    <div v-show="errors.length > 0" class="message">
                        <div class="error" v-for="(value, key) in errors" :key="`error-${key}`">
                            {{ value }}
                        </div>                  
                    </div>
                    <div class="player">
                        <span class="icon">cast_connected</span>
                        <div style="width: 60px;"></div>
                        <div class="item">
                            <strong>Player:</strong> {{ player }}
                        </div>
                        <div class="item">
                            <strong>Name:</strong> {{ name }}
                        </div>
                        <div class="item">
                            <strong>IP Address:</strong> {{ address }}
                        </div>
                    </div>
                    <div v-show="cameras" class="fieldset" v-for="(camera, key) in cameras" :key="`camera-${key}`">
                        <div class="title">
                            <span class="icon">camera_alt</span>
                            <h3>{{ camera.name }}</h3>
                        </div>
                        <div class="parent" :cameraId="camera.id" :player="camera.player">
                            <div class="item">
                                <label for="name">Name *</label>
                                <input id="name" type="text" v-model="camera.name" />
                            </div>
                            <div class="item">
                                <label for="mac">MAC Address *</label>
                                <input id="mac" type="text" v-model="camera.mac" v-on:blur="formatMac(camera.id)"/>
                            </div>
                            <div class="item">
                                <label for="address">IP Address *</label>
                                <input id="address" type="text" v-model="camera.address" />
                            </div>
                            <div class="item">
                                <label for="rtspUrl">RTSP URL *</label>
                                <input id="rtspUrl" type="text" v-model="camera.rtspUrl" />
                            </div>
                            <div class="item">
                                <label for="status">Status *</label>
                                <select id="status" v-model="camera.status" style="max-width: 300px;">
                                    <option value=1>Active</option>
                                    <option value=0>Inactive</option>
                                </select>
                            </div>
                            <div class="item">
                                <label for="localWcsId">Local WCS ID</label>
                                <input id="localWcsId" type="text" v-model="camera.localWcsId" />
                            </div>
                        </div>
                        <div class="footer">
                            <p>* = required.</p>
                            <button type="submit" class="button" v-on:click="remove(camera.id)">Remove</button>
                        </div>
                    </div>
                    <div class="form-row">
                        <button type="submit" class="button" v-on:click="add()">Add</button>
                        <button type="submit" class="button button-primary" v-on:click="save()">Save</button>
                    </div>
                </div>
                <div class="content" v-show="loading">
                    <loading />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Navigation from "../components/navigation.vue";
    import Pages from "../components/pages.vue";
    import Loading from "../components/loading.vue";
    import MacAddress from "is-mac-address";
   
    export default {
        name: "config",
        components: { "navigation": Navigation, "pages": Pages, "loading": Loading, },
        
        data() {
            return {
                page: "config",
                loading: true,
                errors: [],
                port: "5050",
                player: undefined,
                name: undefined,
                address: undefined,
                cameras: undefined,
                removed: [],
                path: "/media/camfeeds",
            };
        },
        
        async mounted() {
            await this.fetch();
        },

        methods: {
            async fetch() {
                const player = (await this.api.get("/player")).result || {};

                if (player && player.player) {
                    this.player = player.player;
                    this.name = player.name;
                    this.address = player.address;

                    const cameras = (await this.api.get(`/cameras?player=${this.player}`)).results || [];

                    if (cameras.length > 0) this.cameras = cameras;
                    this.removed = [];
                    this.errors = [];
                }

                this.loading = false;                
            },

            add() {
                if (!this.cameras) this.cameras = [];

                const camera = {
                    id: -1 * (this.cameras.length + 1) ,
                    player: this.player,
                    name: "new camera",
                    mac: "",
                    rtspUrl: "",
                    status: 1,
                    localWcsId: ""
                };

                this.cameras.push(camera);
            },

            async remove(cameraId) {
                if (!cameraId) return;

                for (let i = 0; i < this.cameras.length; i += 1) {
                    const camera = this.cameras[i];

                    if (camera.id === cameraId) {
                        this.cameras.splice(i, 1);
                        if (camera.id > 0) this.removed.push(camera);
                        return;
                    }
                }
            },

            async save() {
                const adds = [];
                const updates = [];
                const removes = [];
                const ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                this.errors = [];

                for (let i = 0; i < this.cameras.length; i += 1) {
                    const camera = this.cameras[i];
                    let errorStr = "";

                    if (!camera.name || camera.name === "") errorStr += `Invalid name: ${camera.name}
                    `;
                    if (!MacAddress.isMACAddress(camera.mac)) errorStr += `Invalid Mac: ${camera.mac}\n`;
                    if (!camera.address || !camera.address.match(ipformat)) errorStr += `Invalid IP Address: ${camera.address}\n`;
                    if (!camera.rtspUrl || camera.rtspUrl === "") errorStr += `Invalid RTSP URL: ${camera.address}\n`;
                    if (!camera.status || !(parseInt(camera.status, 10) === 0 || parseInt(camera.status, 10) === 1)) errorStr += `Invalid Status: ${camera.status}\n`;

                    if (errorStr.length > 0) return this.errors.push(`Error: Camera ${camera.name}\n ${errorStr}`);

                    if (camera.id > 0) updates.push(camera);
                    else adds.push(camera);
                }

                for (let i = 0; i < this.removed.length; i += 1) {
                    const camera = this.removed[i];
                    camera.status = 0;

                    removes.push(camera.id);
                }

                const waits = [];

                this.loading = true

                if (adds.length > 0) {
                    waits.push(new Promise((resolve) => this.api.put("/cameras", { cameras: adds }).then((_result) => resolve())));
                }
                
                if (updates.length > 0) {
                    waits.push(new Promise((resolve) => this.api.post("/cameras", { cameras: updates }).then((_result) => resolve())));
                }

                if (removes.length > 0) {
                    waits.push(new Promise((resolve) => this.api.delete(`/cameras?ids=${removes.join(",")}`).then((_result) => resolve())));
                }
                
                // add in update crontab
                if (updates.length > 0 || adds.length > 0) {
                    waits.push(new Promise((resolve) => this.api.post("/cron", {
                        path: this.path,
                        port: this.port,
                        player: this.player,
                        cameras: this.cameras,
                    }).then((_result) => resolve())));
                }

                await Promise.all(waits);
                await this.fetch();
            },
            
            formatMac(cameraId) {
                const camera = this.cameras.filter((camera) => {
                    if (camera.id === cameraId) return camera;
                })[0] || {};

                if (camera.mac && camera.mac.length > 3 && camera.mac.length < 17) {
                    camera.mac = camera.mac.replaceAll(/\W/ig, "");
                    camera.mac = camera.mac.replace(/(.{2})/g, '$1:');
                    camera.mac = camera.mac.split(":").slice(0, -1).join(":");
                }                
            },

            show(page) {
                switch (page) {
                    case "home": 
                        this.$router.push("/");
                        break;

                    case "register": 
                        this.$router.push("/register");
                        break;

                    case "config":
                    default: 
                        break;
                }
            }
        }
    }
</script>

<style>
    @font-face {
        font-family: "Montserrat";
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: local("Montserrat Regular"), local("Montserrat-Regular"),
            url(../assets/montserrat.woff2) format("woff2");
        unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F,
            U+FE2E-FE2F;
    }

    @font-face {
        font-family: "Material Icons";
        font-style: normal;
        font-weight: 400;
        src: url(../assets/material.eot);
        src: local("Material Icons"), local("MaterialIcons-Regular"),
            url(../assets/material.woff2) format("woff2"),
            url(../assets/material.woff) format("woff"),
            url(../assets/material.ttf) format("truetype");
    }

    textarea,
    input[type='text'],
    input[type='button'],
    input[type='submit'] {
        -webkit-appearance: none;
        border-radius: 0;
    }

    select {
        -webkit-appearance: none;
        width: 100%;
        height: 32px;
        border-top: 0 none;
        border-right: 0 none;
        border-bottom: 1px #d4d4d4 solid;
        border-left: 0 none;
        border-radius: 0;
        background: #fff;
        padding: 7px;
        font-size: 14px;
    }

    select:focus {
        border-bottom: 2px #202c40 solid;
        outline: 0 none;
        padding: 7px 7px 6px 7px;
    }

    .icon {
        font-family: "Material Icons";
        font-weight: normal;
        font-style: normal;
        font-size: 24px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        font-feature-settings: "liga";
        -webkit-font-smoothing: antialiased;
    }

    a,
    a:link,
    a:active,
    a:visited {
        color: #202c40;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    pre {
        white-space: pre-wrap;
        word-break: break-word;
    }

    input[type="text"] {
        padding: 7px;
        width: 300px;
        margin: 10px 0;
        font-size: 14px;
        background: #fff;
        color: #000;
        border: 1px #e5e5e5 solid;
        border-radius: 3px;
    }

    input[type="text"]:focus {
        outline: 0 none;
        border-color: #202c40;
    }

    input[type="submit"] {
        width: 100px;
        font-size: 12pt;
        background: #202c40;
        color: #fff !important;
        text-decoration: none !important;
        display: inline-block;
        border: 1px #202c40 solid;
        border-radius: 3px;
        padding: 10px;
        cursor: pointer;
        user-select: none;
        margin: 0;
        white-space: pre;
    }

    input[type="submit"]:focus {
        outline: 0 none;
    }

    input[type="submit"]:hover {
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.14),
            0 2px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.2);
    }

    .mobile-only {
        display: none;
    }

    @media (max-width: 815px) {
        .desktop-only {
            display: none !important;
        }

        .mobile-only {
            display: unset;
        }
    }

    #config {
        height: 100%;
        display: flex;
        flex-direction: column;
        font-family: "Montserrat", sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #3d3d3d;
        overflow: hidden;
    }

    #config .button,
    #config .button:link,
    #config .button:active,
    #config .button:visited {
        background: #fff;
        color: #777 !important;
        text-decoration: none !important;
        font-size: 14px;
        text-align: center;
        display: inline-block;
        border: 1px #e5e5e5 solid;
        border-radius: 3px;
        padding: 10px;
        box-sizing: border-box;
        cursor: pointer;
        user-select: none;
        margin: 0 10px 0 0;
        white-space: pre;
    }

    #config .button:hover {
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.14),
            0 2px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.2);
    }

    #config .button:focus {
        outline: 0 none;
    }

    #config .button-primary,
    #config .button-primary:link,
    #config .button-primary:active,
    #config .button-primary:visited {
        background: #202c40;
        color: #fff !important;
        border: 1px #202c40 solid;
    }

    #config .layout {
        flex: 1;
        display: flex;
        position: relative;
        min-height: 100vh;
        padding: 59px 0 0 0;
        overflow: scroll;
        box-sizing: border-box;
    }

    #config .screen {
        margin: 0 auto;
        width: 100%;
        max-width: 1280px;
        display: flex;
        flex-direction: row;
        position: relative;
    }

    @media (max-width: 815px) {
        #config .screen {
            flex-direction: column;
        }
    }

    #config .content {
        flex: 1;
        padding: 20px;
        box-sizing: border-box;
    }

    #config .content .fieldset {
        display: flex;
        flex-direction: column;
        padding: 20px 20px 0 20px;
        margin: 0 0 20px 0;
        border: 1px #e5e5e5 solid;
        border-radius: 3px;
        background: #fff;
        color: #3d3d3d;
    }

    @media (max-width: 815px) {
        #config .content .fieldset {
            border-top: 1px #e5e5e5 solid;
            border-right: 0 none;
            border-bottom: 0 none;
            border-left: 0 none;
            border-radius: unset;
        }
    }

    #config .content h2 {
        font-size: 17px;
        font-weight: bold;
        margin: 0 0 4px 0;
        padding: 0;
        cursor: default;
        user-select: none;
    }

    @media (max-width: 815px) {
        #config .content h2 {
            font-size: 15px;
        }
    }

    #config .content h3 {
        font-size: 14px;
        font-weight: bold;
        margin: 0 0 14px 0;
        padding: 0;
    }

    #config .content p {
        font-size: 13px;
        margin: 0 0 20px 0;
        cursor: default;
        user-select: none;
    }

    @media (max-width: 815px) {
        #config .content p {
            font-size: 13px;
        }
    }

    #config .content table {
        width: 100%;
        max-width: 100%;
        margin: 0 0 20px 0;
    }

    #config .content table tr td {
        width: 300px;
        min-width: 300px;
        padding: 7px;
        font-size: 12px;
        box-sizing: border-box;
        vertical-align: top;
        word-wrap: break-word;
        word-break: break-all;
    }

    @media (max-width: 815px) {
        #config .content table tr td {
            width: unset;
            min-width: unset;
        }
    }

    #config .content table tr td:last-child {
        width: 100%;
    }

    @media (max-width: 815px) {
        #config .content table tr td:last-child {
            width: 70%;
        }
    }

    #config .content table tr:nth-child(odd) td {
        background-color: #f5f5f5;
    }

    #config .content .form-row {
        flex: 1;
        display: flex;
        flex-direction: row;
    }

    #config .content .form-row:empty {
        display: none;
    }

    #config .content .form-row .button {
        margin: 0 10px 20px 0;
    }

    #config .content .form-row .button:last-child {
        margin: 0 0 20px 0;
    }

    #config .content .form-row .form-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 10px 10px 10px;
    }

    #config .content .form-row .form-group:first-child {
        margin: 0 10px 10px 0;
    }

    #config .content .form-row .form-group:last-child {
        margin: 0 0 10px 10px;
    }

    #config .content .form-row .form-group:only-child {
        margin: 0 0 10px 0;
    }

    #config .message {
        display: flex;
        flex-direction: column;
        margin: 0 auto;
        background: #b6cfd0;
        color: #202c40;
        border-radius: 5px;
        padding: 20px 40px;
        font-size: 20px;
    }

    #config .message .registration {
        font-size: 35px;
        margin: 20px 0 0 0;
        color: #db2927;
    }

    #config .message .error {
        font-size: 14px;
        margin: 20px 0 0 0;
        color: #db2927;
        white-space: pre-wrap;
    }

    #config .message .address {
        font-size: 10px;
        margin: 20px 0 0 0;
        opacity: 0.5;
        margin-bottom: 7px;
    }

    #config .content .player {
        background-color: #751212;
        border: 1px #e5e5e5 solid;
        border-radius: 3px;
        color: #ffffff;
        display: flex;
        flex-direction: row;
        padding: 20px 20px 0 20px;
        margin: 0 0 20px 0;
        font-size: 14px;
        vertical-align: middle;
        position: relative;
        min-height: 36px;
    }

    @media (max-width: 815px) {
        #config .content .player {
            border-top: 1px #e5e5e5 solid;
            border-right: 0 none;
            border-bottom: 0 none;
            border-left: 0 none;
            border-radius: unset;
        }
    }

    @media (max-width: 400px) {
        #config .content .player {
            flex-direction: column;
        }
    }

    #config .content .player .icon {
        font-size: 50px;
        height: 60px;
        position: absolute;
        top: 7px;
        left: 7px;
        bottom: 0;
        right: 0;
        margin: auto;
    }

    @media (max-width: 400px) {
        #config .content .player .icon {
            left: 15px;
        }
    }

    #config .content .player .item {
        flex: 1;
        margin: 0 0 14px 0;
    }

    @media (max-width: 400px) {
        #config .content .player .item {
            padding-left: 60px;
        }
    }

    #config .content .player .item strong {
        font-weight: 700;
        font-size: 15px;
    }

    #config .content .parent {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: repeat(3, 1fr);
        grid-gap: 3px;
        font-size: 14px;
    }
    
    @media (max-width: 400px) {
        #config .content .parent {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
        }
    }

    #config .content .fieldset .title {
        display: flex;
        flex-direction: row;
        vertical-align: middle;
    }

    #config .content .fieldset .title .icon {
        min-height: 24px;
        font-size: 20px;
        margin-right: 7px;
    }

    #config .content .fieldset .title h3 {
        margin-top: 3px;
    }

    #config .content .parent label {
        font-weight: 600;
        font-size: 15px;
    }

    #config .content .parent .item {
        display: flex;
        flex-direction: column;
    }

    #config .content .footer {
        margin-bottom: 7px;
    }

    #config .content .footer p {
        font-size: 10px;
        opacity: 0.5;
    }
</style>