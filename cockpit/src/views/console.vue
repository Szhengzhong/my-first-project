<template>
    <div id="console">
        <navigation />
        <div ref="layout" class="layout">
            <div class="screen" v-if="!rebooting">
                <sections v-on:show="show" :value="section" />
                <div v-if="system && section === 'system'" class="content">
                    <h2>System Information</h2>
                    <p>
                        Here you will find information about the player hardware and firmware.
                    </p>
                    <h3>Hardware</h3>
                    <div class="fieldset">
                        <table cellpassing="0" cellspacing="0" border="0">
                            <tr v-for="(value, index) in keys(system.system)" :key="`system_${index}`">
                                <td>{{ value }}</td>
                                <td>{{ system.system[value] }}</td>
                            </tr>
                        </table>
                        <div class="form-row">
                            <div class="button-group">
                                <div v-on:click="setCount()" class="button button-primary">Reboot</div>
                            </div>
                        </div>
                    </div>
                    <h3>Operating System</h3>
                    <div class="fieldset">
                        <table cellpassing="0" cellspacing="0" border="0">
                            <tr v-for="(value, index) in keys(system.operating_system)" :key="`os_${index}`">
                                <td>{{ value }}</td>
                                <td>{{ system.operating_system[value] }}</td>
                            </tr>
                        </table>
                    </div>
                    <h3>Processor</h3>
                    <div class="fieldset">
                        <table cellpassing="0" cellspacing="0" border="0">
                            <tr v-for="(value, index) in keys(system.information)" :key="`os_${index}`">
                                <td>{{ value }}</td>
                                <td>{{ system.information[value] }}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div v-if="memory && section === 'memory'" class="content">
                    <h2>Memory Information</h2>
                    <p>
                        Useful information for keeping track of the player's memory.
                    </p>
                    <h3>Memory Load</h3>
                    <div class="fieldset">
                        <table cellpassing="0" cellspacing="0" border="0">
                            <tr v-for="(value, index) in keys(memory.load)" :key="`memory_${index}`">
                                <td>{{ value }}</td>
                                <td>{{ memory.load[value] }}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div v-if="filesystem && section === 'filesystem'" class="content">
                    <h2>Filesystem Information</h2>
                    <p>
                        SD Card use information.
                    </p>
                    <div v-for="(drive, index) in filesystem" :key="`drive_${index}`">
                        <h3>{{ drive.fs }}</h3>
                        <div class="fieldset">
                            <table cellpassing="0" cellspacing="0" border="0">
                                <tr>
                                    <td>type</td>
                                    <td>{{ drive.type }}</td>
                                </tr>
                                <tr>
                                    <td>size</td>
                                    <td>{{ drive.size }}</td>
                                </tr>
                                <tr>
                                    <td>used</td>
                                    <td>{{ drive.used }}</td>
                                </tr>
                                <tr>
                                    <td>use</td>
                                    <td>{{ drive.use }}</td>
                                </tr>
                                <tr>
                                    <td>mount</td>
                                    <td>{{ drive.mount }}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
                <div v-if="rebootSec >= 0 && section === 'reboot'" class="content">
                    <h2>Rebooting the system...</h2>
                    <p>Reboot will occur in {{ rebootSec }} seconds.</p>
                </div>
            </div>
            <div class="screen" v-else>
                <div class="content">
                    <h2>Rebooting now</h2>
                    <p>IP address <strong>may change</strong> after reboot.<br/><br/>If you cannot access the console after a refresh of your browser, please access the Encompass Cast dashboard from inside your Encompass system to open the console again.</p>
                </div>     
            </div>
        </div>
    </div>
</template>

<script>
    import Navigation from "../components/navigation.vue";
    import Sections from "../components/sections.vue";

    export default {
        name: "console",
        components: { "navigation": Navigation, "sections": Sections },

        data() {
            return {
                id: null,
                mac: null,
                player: null,
                section: "system",
                system: null,
                memory: null,
                filesystem: null,
                rebootSec: null,
                rebooting: false,
            };
        },

        watch: {
            section() {
                this.load();
            },
        },

        mounted() {
            this.load();
        },

        methods: {
            async load() {
                switch (this.section) {
                    case "system":
                        this.system = { ...(await this.api.get("/system")).results, ...(await this.api.get("/system/cpu")).results };

                        delete this.system.information.cache;
                        break;

                    case "memory":
                        this.memory = (await this.api.get("/system/memory")).results;
                        break;

                    case "filesystem":
                        this.filesystem = (await this.api.get("/system/filesystem")).results;
                        break;
                }
            },

            keys(value) {
                return Object.keys(value);
            },

            show(section) {
                this.section = section;
            },

            setCount() {
                this.system = null;
                this.section = "reboot";
                this.rebootSec = 3;
                setTimeout(() => this.countDown(), 1000);
                
                // 
            },

            countDown() {                
                if (this.rebootSec === 0) {
                    this.reboot();
                    return;
                } 

                this.rebootSec -= 1;

                setTimeout(() => this.countDown(), 1000);
            },

            async reboot() {
                this.section = null;
                this.rebootSec = null;
                this.rebooting = true;

                await this.api.put("/system/reboot");

                setTimeout(() => window.location.refresh, 500);
            }
        },
    };
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

    #console {
        height: 100%;
        display: flex;
        flex-direction: column;
        font-family: "Montserrat", sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #3d3d3d;
        overflow: hidden;
    }

    #console .button,
    #console .button:link,
    #console .button:active,
    #console .button:visited {
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

    #console .button:hover {
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.14),
            0 2px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.2);
    }

    #console .button:focus {
        outline: 0 none;
    }

    #console .button-primary,
    #console .button-primary:link,
    #console .button-primary:active,
    #console .button-primary:visited {
        background: #202c40;
        color: #fff !important;
        border: 1px #202c40 solid;
    }

    #console .layout {
        flex: 1;
        display: flex;
        position: relative;
        min-height: 100vh;
        padding: 59px 0 0 0;
        overflow: scroll;
        box-sizing: border-box;
    }

    #console .screen {
        margin: 0 auto;
        width: 100%;
        max-width: 1280px;
        display: flex;
        flex-direction: row;
        position: relative;
    }

    @media (max-width: 815px) {
        #console .screen {
            flex-direction: column;
        }
    }

    #console .content {
        flex: 1;
        padding: 20px;
        box-sizing: border-box;
    }

    #console .content .fieldset {
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
        #console .content .fieldset {
            border-top: 1px #e5e5e5 solid;
            border-right: 0 none;
            border-bottom: 0 none;
            border-left: 0 none;
            border-radius: unset;
        }
    }

    #console .content h2 {
        font-size: 17px;
        font-weight: bold;
        margin: 0 0 4px 0;
        padding: 0;
        cursor: default;
        user-select: none;
    }

    @media (max-width: 815px) {
        #console .content h2 {
            font-size: 15px;
        }
    }

    #console .content h3 {
        font-size: 14px;
        font-weight: bold;
        margin: 0 0 14px 0;
        padding: 0;
    }

    #console .content p {
        font-size: 13px;
        margin: 0 0 20px 0;
        cursor: default;
        user-select: none;
    }

    @media (max-width: 815px) {
        #console .content p {
            font-size: 13px;
        }
    }

    #console .content table {
        width: 100%;
        max-width: 100%;
        margin: 0 0 20px 0;
    }

    #console .content table tr td {
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
        #console .content table tr td {
            width: unset;
            min-width: unset;
        }
    }

    #console .content table tr td:last-child {
        width: 100%;
    }

    @media (max-width: 815px) {
        #console .content table tr td:last-child {
            width: 70%;
        }
    }

    #console .content table tr:nth-child(odd) td {
        background-color: #f5f5f5;
    }

    #console .content .form-row {
        flex: 1;
        display: flex;
        flex-direction: row;
    }

    #console .content .form-row:empty {
        display: none;
    }

    #console .content .form-row .button {
        margin: 0 10px 20px 0;
    }

    #console .content .form-row .button:last-child {
        margin: 0 0 20px 0;
    }

    #console .content .form-row .form-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 10px 10px 10px;
    }

    #console .content .form-row .form-group:first-child {
        margin: 0 10px 10px 0;
    }

    #console .content .form-row .form-group:last-child {
        margin: 0 0 10px 10px;
    }

    #console .content .form-row .form-group:only-child {
        margin: 0 0 10px 0;
    }
</style>
