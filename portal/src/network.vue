<template>
    <div class="network">
        <signal :quality="network.quality" :secure="network.security.mode && network.security.mode !== '' && network.security.mode !== 'none'" />
        <div class="ssid">{{ network.ssid }}</div>
    </div>
</template>

<script>
    import signal from "./signal.vue";

    export default {
        name: "network",

        components: {
            signal,
        },

        props: {
            network: {
                type: Object,
                required: true,
            },
        },
    };
</script>

<style lang="scss" scoped>
    .network {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 20px 10px;
        user-select: none;
        cursor: pointer;
        opacity: 0.9;

        .ssid {
            flex: 1;
            color: #000;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            @media (min-width: 300px) and (max-width: 815px) {
                font-size: 15px;
            }
        }

        &:hover {
            opacity: 1;
        }
    }
</style>
