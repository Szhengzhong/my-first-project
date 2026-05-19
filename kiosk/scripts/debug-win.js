const { join } = require("path");
const { spawnSync } = require("child_process");

const cwd = join(__dirname, "..");
const cliPath = join(cwd, "node_modules", "@vue", "cli-service", "bin", "vue-cli-service.js");

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const run = spawnSync(process.execPath, [
    cliPath,
    "electron:serve",
    "--no-sandbox",
    "--skip-plugins",
    "@vue/cli-plugin-eslint",
], {
    cwd,
    env,
    stdio: "inherit",
});

process.exit(run.status || 0);
