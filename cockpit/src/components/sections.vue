<template>
    <div id="sections">
        <div class="sticky">
            <a v-on:click="$emit('show', 'system')" :class="`${value === 'system' ? 'active' : ''}`">
                <span class="icon">settings</span>
                System
            </a>
            <a v-on:click="$emit('show', 'memory')" :class="`${value === 'memory' ? 'active' : ''}`">
                <span class="icon">memory</span>
                Memory
            </a>
            <a v-on:click="$emit('show', 'filesystem')" :class="`${value === 'filesystem' ? 'active' : ''}`">
                <span class="icon">data_usage</span>
                File System
            </a>
        </div>
    </div>
</template>

<script>
    export default {
        name: "sections",
        props: { value: Number },
    };
</script>

<style scoped>
    #sections {
        width: 280px;
        padding: 0 20px;
        box-sizing: border-box;
        -ms-overflow-style: none;
    }

    #sections::-webkit-scrollbar {
        display: none;
    }

    @media (max-width: 815px) {
        #sections {
            width: unset;
            padding: 10px 0 0 0;
            overflow-y: auto;
        }
    }

    #sections .sticky {
        padding: 14px 0;
        position: -webkit-sticky;
        position: sticky;
        top: 0;
    }

    @media (max-width: 815px) {
        #sections .sticky {
            padding: 0;
            position: unset;
            display: flex;
            flex-direction: row;
        }
    }

    #sections a,
    #sections a:link,
    #sections a:active,
    #sections a:visited {
        display: flex;
        flex-direction: row;
        align-content: center;
        align-items: center;
        text-decoration: none;
        font-size: 14px;
        padding: 14px 10px;
        border-bottom: 1px #e5e5e5 solid;
        color: #3d3d3d;
        cursor: pointer;
        user-select: none;
    }

    #sections a:last-child {
        border-bottom: 0 none;
    }

    #sections a:hover {
        text-decoration: none;
        font-weight: bold;
    }

    #sections a .icon {
        margin: 0 7px 0 0;
        font-size: 20px;
    }

    @media (max-width: 815px) {
        #sections a,
        #sections a:link,
        #sections a:active,
        #sections a:visited {
            flex: 1;
            display: unset;
            font-size: 12px;
            white-space: nowrap;
            text-align: center;
            padding: 10px;
        }

        #sections a:last-child {
            border-bottom: 1px #e5e5e5 solid;
        }

        #sections a .icon {
            display: none;
        }
    }

    #sections .active,
    #sections .active:link,
    #sections .active:active,
    #sections .active:visited {
        font-weight: bold;
        color: #000;
    }

    @media (max-width: 815px) {
        #sections .active,
        #sections .active:link,
        #sections .active:active,
        #sections .active:visited {
            color: unset;
            border-bottom: 2px #202c40 solid;
        }
    }
</style>
