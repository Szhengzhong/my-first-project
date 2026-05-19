const { rmSync } = require("fs");
const { join } = require("path");
const { spawnSync } = require("child_process");

const cwd = join(__dirname, "..");
const cliPath = join(cwd, "node_modules", "@vue", "cli-service", "bin", "vue-cli-service.js");

const env = {
    ...process.env,
    NODE_OPTIONS: `${process.env.NODE_OPTIONS ? `${process.env.NODE_OPTIONS} ` : ""}--openssl-legacy-provider`,
};

rmSync(join(cwd, "interface"), { recursive: true, force: true });

const build = spawnSync(process.execPath, [cliPath, "build", "--modern"], {
    cwd,
    env,
    stdio: "inherit",
});

if (build.status !== 0) {
    process.exit(build.status || 1);
}

const log = require("../lib/logger")();
const server = require("../lib")(log);
const port = Number.parseInt(process.env.PORT || "5001", 10);

server.start(port);
