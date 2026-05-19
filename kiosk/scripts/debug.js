const { join } = require("path");
const { spawnSync } = require("child_process");

const cwd = join(__dirname, "..");
const isWindows = process.platform === "win32";

const run = isWindows
    ? spawnSync(process.execPath, [join(__dirname, "debug-win.js")], {
        cwd,
        stdio: "inherit",
        env: process.env,
    })
    : spawnSync("bash", [join(cwd, "project"), "debug"], {
        cwd,
        stdio: "inherit",
        env: process.env,
    });

process.exit(run.status == null ? 1 : run.status);
