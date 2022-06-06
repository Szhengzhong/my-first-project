<template>
    <div id="pages">
        <div class="sticky">
            <a v-on:click="$emit('show', 'home')" :class="`${value === 'home' ? 'active' : ''}`">
                <span class="icon">home</span>
                Home
            </a>
            <a v-on:click="$emit('show', 'register')" :class="`${value === 'register' ? 'active' : ''}`">
                <span class="icon">developer_mode</span>
                Register
            </a>
            <a v-on:click="$emit('show', 'config')" :class="`${value === 'config' ? 'active' : ''}`">
                <span class="icon">edit</span>
                Configure
            </a>
        </div>
    </div>
</template>

<script>
    export default {
        name: "pages",
        props: { value: Number },
    };
</script>

<style scoped>
    #pages {
        width: 280px;
        padding: 0 20px;
        box-sizing: border-box;
        -ms-overflow-style: none;
    }

    #pages::-webkit-scrollbar {
        display: none;
    }

    @media (max-width: 815px) {
        #pages {
            width: unset;
            padding: 10px 0 0 0;
            overflow-y: auto;
        }
    }

    #pages .sticky {
        padding: 14px 0;
        position: -webkit-sticky;
        position: sticky;
        top: 0;
    }

    @media (max-width: 815px) {
        #pages .sticky {
            padding: 0;
            position: unset;
            display: flex;
            flex-direction: row;
        }
    }

    #pages a,
    #pages a:link,
    #pages a:active,
    #pages a:visited {
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

    #pages a:last-child {
        border-bottom: 0 none;
    }

    #pages a:hover {
        text-decoration: none;
        font-weight: bold;
    }

    #pages a .icon {
        margin: 0 7px 0 0;
        font-size: 20px;
    }

    @media (max-width: 815px) {
        #pages a,
        #pages a:link,
        #pages a:active,
        #pages a:visited {
            flex: 1;
            display: unset;
            font-size: 12px;
            white-space: nowrap;
            text-align: center;
            padding: 10px;
        }

        #pages a:last-child {
            border-bottom: 1px #e5e5e5 solid;
        }

        #pages a .icon {
            display: none;
        }
    }

    #pages .active,
    #pages .active:link,
    #pages .active:active,
    #pages .active:visited {
        font-weight: bold;
        color: #000;
    }

    @media (max-width: 815px) {
        #pages .active,
        #pages .active:link,
        #pages .active:active,
        #pages .active:visited {
            color: unset;
            border-bottom: 2px #202c40 solid;
        }
    }
</style>
