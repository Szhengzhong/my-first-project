const network = require("@hoobs/network");
const program = require("commander");
const pjson = require("./package.json");
const log = require("./lib/logger")();
const server = require("./lib")(log);

function test(port, attempts) {
    if (network.connected) {
        process.exit();
    } else if (attempts >= 20) {
        server.start(port);
    } else {
        setTimeout(() => {
            test(port, attempts + 1);
        }, 1000);
    }
}

function daemon() {
    program.version(pjson.version, "-v, --version", "output the current version");
    program.option("-d, --debug", "turn on debug level logging", () => { log.debugging = true; });

    program.command("start", { isDefault: true })
        .description("start the portal service")
        .option("-p, --port <port>", "change the port the portal runs on")
        .action((command) => test(command.port, 0));

    program.parse(process.argv);
}

function teardown() {
    if (server) server.stop();
}

process.on("exit", teardown);
process.on("SIGINT", teardown);
process.on("SIGTERM", teardown);
process.on("SIGUSR1", teardown);
process.on("SIGUSR2", teardown);

module.exports = daemon;
