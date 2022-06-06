const cors = require("cors");
const http = require("http");
const express = require("express");
const parser = require("body-parser");
const log = require("./lib/logger");

module.exports = async (port) => {
    const app = express();

    app.use(cors({ origin: "*" }));
    app.use(parser.json());

    require("./lib/controllers/setup")(app);
    require("./lib/controllers/system")(app);
    require("./lib/controllers/default")(app);

    http.createServer(app).listen(port || 8080, () => {
        log.info(`Listening on port ${port || 8080}`);
    });
};
