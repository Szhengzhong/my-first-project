<template>
    <div id="register">
        <navigation />
        <div ref="layout" class="layout">
            <div class="screen">
                <pages v-on:show="show" :value="page" />
                <div class="content" v-show="!loading">
                    <h2>{{ code ? "Registration" : "Update Player Info"}}</h2>
                    <div v-show="errors.length > 0" class="message">
                        <span class="error" v-for="(value, key) in errors" :key="`error-${key}`">
                            {{ value }}
                        </span>
                    </div>
                    <div class="fieldset">
                        <label for="playerInfo">Player Information</label>
                        <input id="playerInfo" v-model="player" type="text" disabled=true/>
                    </div>
                    <div class="fieldset">
                        <label for="name">Name</label>
                        <input id="name" v-model="name" type="text" ref="name"/>
                    </div>
                    <div class="fieldset">
                        <label for="encompassId">Encompass ID</label>
                        <input id="encompassId" v-model="encompassId" type="text"/>
                    </div>
                    <div class="fieldset" v-if="code">
                        <label for="code">Registration Code</label>
                        <input id="code" v-model="code" type="text" disabled=true/>
                    </div>
                    <div class="actions">
                        <button type="submit" class="button button-primary" v-on:click="save()">{{ code ? "Register" : "Save" }}</button>
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

    export default {
        name: "register",
        components: { "navigation": Navigation, "pages": Pages, "loading": Loading },

        data() {
            return {
                page: "register",
                loading: true,
                player: undefined,
                code: undefined,
                encompassId: undefined,
                name: undefined,
                errors: [],
            };
        },

        async mounted() {
            this.player = this.$route.query.player;
            this.code = this.$route.query.code;

            await this.fetch();
            this.loading = false;

            this.$nextTick(() => {
                const playerName = this.$refs.name;
                playerName.focus();
            });
        },

        methods: {
            async fetch() {
                const player = (await this.api.get("/player")).result || {};
                this.player = player.player;
                this.name = player.name;
                this.encompassId = player.encompassId;
                this.errors = [];
            },

            async save() {
                this.errors = [];

                if (this.code) {
                    let player = (await this.api.get(`/unregistered?encompassId=Unregistered&name=${this.code}`)).result || {};

                    console.log(player);
                    console.log(this.player);

                    if (player.player !== this.player) this.errors.push("Please refresh, cannot register device as it appears to already be registered");

                    if (!this.name || this.name === "") this.errors.push("Name is missing.");
                    if (!this.encompassId || this.encompassId === "") this.errors.push("EncompassID is missing.");

                    if (this.errors.length > 0) return;

                    const result = (await this.api.post("/register", { 
                        player: this.player, 
                        code: this.code, 
                        name: this.name, 
                        encompassId: this.encompassId,
                    }));

                    if (result.result) {
                        this.code = undefined;
                        return await this.fetch();                        
                    }
                } else {
                    if (!this.name || this.name === "") this.errors.push("Name is missing.");
                    if (!this.encompassId || this.encompassId === "") this.errors.push("EncompassID is missing.");

                    if (this.errors.length > 0) return;

                    const result = (await this.api.post("/update", { 
                        player: this.player, 
                        code: this.code, 
                        name: this.name, 
                        encompassId: this.encompassId,
                    }));

                    console.log(result);

                    if (result.result) return await this.fetch();
                }
            },

            show(page) {
                switch (page) {
                    case "home": 
                        this.$router.push("/");
                        break;

                    case "config": 
                        this.$router.push("/config");
                        break;

                    case "register":
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

    
    #register {
        height: 100%;
        display: flex;
        flex-direction: column;
        font-family: "Montserrat", sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #3d3d3d;
        overflow: hidden;
    }

    #register .button,
    #register .button:link,
    #register .button:active,
    #register .button:visited {
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

    #register .button:hover {
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.14),
            0 2px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.2);
    }

    #register .button:focus {
        outline: 0 none;
    }

    #register .button-primary,
    #register .button-primary:link,
    #register .button-primary:active,
    #register .button-primary:visited {
        background: #202c40;
        color: #fff !important;
        border: 1px #202c40 solid;
    }

    #register .layout {
        flex: 1;
        display: flex;
        position: relative;
        min-height: 100vh;
        padding: 59px 0 0 0;
        overflow: scroll;
        box-sizing: border-box;
    }

    #register .screen {
        margin: 0 auto;
        width: 100%;
        max-width: 1280px;
        display: flex;
        flex-direction: row;
        position: relative;
    }

    @media (max-width: 815px) {
        #register .screen {
            flex-direction: column;
        }
    }

    #register .content {
        flex: 1;
        padding: 20px;
        box-sizing: border-box;
    }

    #register .content .fieldset {
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
        #register .content .fieldset {
            border-top: 1px #e5e5e5 solid;
            border-right: 0 none;
            border-bottom: 0 none;
            border-left: 0 none;
            border-radius: unset;
        }
    }

    #register .content h2 {
        font-size: 17px;
        font-weight: bold;
        margin: 0 0 4px 0;
        padding: 0;
        cursor: default;
        user-select: none;
    }

    @media (max-width: 815px) {
        #register .content h2 {
            font-size: 15px;
        }
    }

    #register .content h3 {
        font-size: 14px;
        font-weight: bold;
        margin: 0 0 14px 0;
        padding: 0;
    }

    #register .content p {
        font-size: 13px;
        margin: 0 0 20px 0;
        cursor: default;
        user-select: none;
    }

    @media (max-width: 815px) {
        #register .content p {
            font-size: 13px;
        }
    }

    #register .content table {
        width: 100%;
        max-width: 100%;
        margin: 0 0 20px 0;
    }

    #register .content table tr td {
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
        #register .content table tr td {
            width: unset;
            min-width: unset;
        }
    }

    #register .content table tr td:last-child {
        width: 100%;
    }

    @media (max-width: 815px) {
        #register .content table tr td:last-child {
            width: 70%;
        }
    }

    #register .content table tr:nth-child(odd) td {
        background-color: #f5f5f5;
    }

    #register .content .form-row {
        flex: 1;
        display: flex;
        flex-direction: row;
    }

    #register .content .form-row:empty {
        display: none;
    }

    #register .content .form-row .button {
        margin: 0 10px 20px 0;
    }

    #register .content .form-row .button:last-child {
        margin: 0 0 20px 0;
    }

    #register .content .form-row .form-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 10px 10px 10px;
    }

    #register .content .form-row .form-group:first-child {
        margin: 0 10px 10px 0;
    }

    #register .content .form-row .form-group:last-child {
        margin: 0 0 10px 10px;
    }

    #register .content .form-row .form-group:only-child {
        margin: 0 0 10px 0;
    }

    #register .message {
        display: flex;
        flex-direction: column;
        margin: 0 auto;
        background: #b6cfd0;
        color: #202c40;
        border-radius: 5px;
        padding: 20px 40px;
        font-size: 20px;
    }

    #register .message .registration {
        font-size: 35px;
        margin: 20px 0 0 0;
        color: #db2927;
    }

    #register .message .error {
        font-size: 14px;
        margin: 20px 0 0 0;
        color: #db2927;
    }

    #register .message .address {
        font-size: 10px;
        margin: 20px 0 0 0;
        opacity: 0.5;
    }
    
</style>