const macaddress = require("macaddress");

module.exports = {
    name: null,
    code: null,
    registration: null,
    player: null,
    url: null,

    mac() {
        return new Promise((resolve) => {
            macaddress.one((error, address) => {
                if (!error) {
                    resolve(address);
                } else {
                    resolve(null);
                }
            });
        });
    },

    uuid() {
        const chars = "023456789ABCDEFGHIJKLMNPQRSTUVWXYZ";

        let result = "";

        for (let i = 6; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }

        return result;
    },
};
