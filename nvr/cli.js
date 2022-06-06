const program = require("commander");
const log = require("./lib/logger");

module.exports = () => {
    program.command("start")
        .option("-d, --debug", "turn on debug mode")
        .option("-p, --port [port]", "set the server port")
        .action((command) => {
            log.debug = command.debug;

            require("./api")(command.port ? parseInt(command.port, 10) : undefined);
        });

    process.on("unhandledRejection", (_reason, promise) => {
        promise.catch((error) => {
            log.error(error);
        });
    });

    process.once("uncaughtException", (error) => {
        log.error(error);

        process.exit(1);
    });

    program.parse(process.argv);
};
