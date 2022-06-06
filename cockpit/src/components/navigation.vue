<template>
    <div id="navigation">
        <logo :width="152" :height="25" />
        <div class="actions"></div>
    </div>
</template>

<script>
    export default { name: "navigation" };
</script>

<style scoped>
    #navigation {
        width: 100%;
        height: 59px;
        min-height: 58px;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 300;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        padding: 0 20px;
        background-color: #202c40;
        color: #fff;
    }

    #navigation .actions {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        align-content: center;
        align-items: center;
    }

    #navigation .actions a,
    #navigation .actions a:link,
    #navigation .actions a:visited,
    #navigation .actions a:active,
    #navigation .action {
        padding: 4px 20px 4px 0;
        color: #fff;
        text-decoration: none;
        cursor: pointer;
        opacity: 0.8;
    }

    #navigation .actions a:hover,
    #navigation .action:hover {
        opacity: 1;
    }
</style>
