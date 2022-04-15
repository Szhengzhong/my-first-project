module.exports = {
    debug: false,

    info(...args) {
        if (this.debug) {
            if (args.length > 1) {
                console.log(`${new Date().toLocaleString()} [${(args[0] || "").split("/").pop().toLowerCase()}] ${args[1]}`);
            } else if (args.length > 0) {
                console.log(args[0]);
            }
        }
    },

    error(...args) {
        console.error(args[0]);
    },
};
