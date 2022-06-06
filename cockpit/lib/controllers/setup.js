const log = require("../logger");

module.exports = (app) => {
    app.use((request, _response, next) => {
        log.info(request.method, request.url);

        next();
    });
};
