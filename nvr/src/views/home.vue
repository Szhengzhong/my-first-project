<template>
    <div id="home">
        <navigation />
        <div ref="layout" class="layout">
            <div class="screen">
                <pages v-on:show="show" :value="page" />
                <div class="content" v-if="!loading">
                    <h2>Player Information</h2>
                    <p>
                        Displayed here is the information about this Encompass NVR Player
                    </p>
                    <div v-if="player && registration" class="message">
                        <span>Redirecting you to the Register screen in {{ countSec }} sec</span>
                        <span class="registration">PlayerId {{ player }}: {{ code }}</span>
                        <span class="address">{{ address }}</span>
                    </div>
                    <div v-else class="message">
                        <span>Redirecting you to the config in {{ countSec }} sec</span>
                        <span class="registration">{{ player }}</span>
                        <span class="address">{{ address }}</span>
                    </div>
                </div>
                <div class="content" v-else>
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

    export default {
        name: "home",
        components: { "navigation": Navigation, "pages": Pages, "loading": Loading },
        data() {
            return {
                page: "home",
                loading: true,
                player: undefined,
                code: undefined,
                registration: undefined,
                address: undefined,
                manufacturer: undefined,
                countSec: undefined,
            };
        },

        async mounted() {
            await this.fetch();
        },

        methods: {
            async fetch() {
                const PlayerData = (await this.api.get("/player")).result || {};

                this.player = PlayerData.player;
                this.code = PlayerData.code;
                this.registration = PlayerData.registration;
                this.address = PlayerData.address;
                this.manufacturer = PlayerData.manufacturer;
                
                await this.checkIp();
                await this.boardInfo();

                this.countSec = 3;
                this.loading = false;

                return setTimeout(() => this.countDown(), 1000);
            },

            async checkIp() {
                const result = (await this.api.post(`/ip`));
                if (result && result.address) this.address = result.address;
            },

            async boardInfo() {
                const result = (await this.api.post("/board"));
                if (result && result.manufacturer) this.manufacturer = result.manufacturer;
            },

            countDown() {                
                if (this.countSec === 0) {
                    if (this.player && this.registration) {
                        return this.$router.push(`/register?player=${this.player}&code=${this.registration}`);
                    } else {
                        return this.$router.push(`/config?player=${this.player}&`);
                    }                    
                }

                this.countSec -= 1;
                
                return setTimeout(() => this.countDown(), 1000);
            },

            show(page) {
                switch (page) {
                    case "register": 
                        this.$router.push("/register");
                        break;

                    case "config": 
                        this.$router.push("/config");
                        break;

                    case "home":
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

    #home .screen {
        margin: 0 auto;
        width: 100%;
        max-width: 1280px;
        display: flex;
        flex-direction: row;
        position: relative;
    }

    @media (max-width: 815px) {
        #home .screen {
            flex-direction: column;
        }
    }

    #home {
        height: 100%;
        display: flex;
        flex-direction: column;
        font-family: "Montserrat", sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #3d3d3d;
        overflow: hidden;
    }

    #home .button,
    #home .button:link,
    #home .button:active,
    #home .button:visited {
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

    #home .button:hover {
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.14),
            0 2px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.2);
    }

    #home .button:focus {
        outline: 0 none;
    }

    #home .button-primary,
    #home .button-primary:link,
    #home .button-primary:active,
    #home .button-primary:visited {
        background: #202c40;
        color: #fff !important;
        border: 1px #202c40 solid;
    }

    #home .layout {
        flex: 1;
        display: flex;
        position: relative;
        min-height: 100vh;
        padding: 59px 0 0 0;
        overflow: scroll;
        box-sizing: border-box;
    }

    #home .screen {
        margin: 0 auto;
        width: 100%;
        max-width: 1280px;
        display: flex;
        flex-direction: row;
        position: relative;
    }

    @media (max-width: 815px) {
        #home .screen {
            flex-direction: column;
        }
    }

    #home .content {
        flex: 1;
        padding: 20px;
        box-sizing: border-box;
    }

    #home .content .fieldset {
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
        #home .content .fieldset {
            border-top: 1px #e5e5e5 solid;
            border-right: 0 none;
            border-bottom: 0 none;
            border-left: 0 none;
            border-radius: unset;
        }
    }

    #home .content h2 {
        font-size: 17px;
        font-weight: bold;
        margin: 0 0 4px 0;
        padding: 0;
        cursor: default;
        user-select: none;
    }

    @media (max-width: 815px) {
        #home .content h2 {
            font-size: 15px;
        }
    }

    #home .content h3 {
        font-size: 14px;
        font-weight: bold;
        margin: 0 0 14px 0;
        padding: 0;
    }

    #home .content p {
        font-size: 13px;
        margin: 0 0 20px 0;
        cursor: default;
        user-select: none;
    }

    @media (max-width: 815px) {
        #home .content p {
            font-size: 13px;
        }
    }

    #home .content table {
        width: 100%;
        max-width: 100%;
        margin: 0 0 20px 0;
    }

    #home .content table tr td {
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
        #home .content table tr td {
            width: unset;
            min-width: unset;
        }
    }

    #home .content table tr td:last-child {
        width: 100%;
    }

    @media (max-width: 815px) {
        #home .content table tr td:last-child {
            width: 70%;
        }
    }

    #home .content table tr:nth-child(odd) td {
        background-color: #f5f5f5;
    }

    #home .content .form-row {
        flex: 1;
        display: flex;
        flex-direction: row;
    }

    #home .content .form-row:empty {
        display: none;
    }

    #home .content .form-row .button {
        margin: 0 10px 20px 0;
    }

    #home .content .form-row .button:last-child {
        margin: 0 0 20px 0;
    }

    #home .content .form-row .form-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 10px 10px 10px;
    }

    #home .content .form-row .form-group:first-child {
        margin: 0 10px 10px 0;
    }

    #home .content .form-row .form-group:last-child {
        margin: 0 0 10px 10px;
    }

    #home .content .form-row .form-group:only-child {
        margin: 0 0 10px 0;
    }

    #home .message {
        display: flex;
        flex-direction: column;
        margin: 0 auto;
        background: #b6cfd0;
        color: #202c40;
        border-radius: 5px;
        padding: 20px 40px;
        font-size: 20px;
    }

    #home .message .registration {
        font-size: 35px;
        margin: 20px 0 0 0;
        color: #db2927;
    }

    #home .message .address {
        font-size: 10px;
        margin: 20px 0 0 0;
        opacity: 0.5;
    }
</style>