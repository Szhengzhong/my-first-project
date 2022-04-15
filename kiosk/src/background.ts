import { app, protocol, BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";

const isDevelopment = process.env.NODE_ENV === "development";

protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { secure: true, standard: true } }]);

async function createWindow() {
    const window = new BrowserWindow({
        title: "Encompass Cast",
        fullscreen: !isDevelopment,
        frame: isDevelopment,
        darkTheme: true,
        backgroundColor: "#000",
        webPreferences: {
            nodeIntegration: (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
            enableRemoteModule: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: true,
        },
    });

    window.setTitle("Encompass Cast");

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        await window.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);

        if (!process.env.IS_TEST) window.webContents.openDevTools({ mode: "detach" });
    } else {
        createProtocol("app");

        window.loadURL("app://./index.html");
    }
}

app.commandLine.appendSwitch("disable-site-isolation-trials");

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("ready", async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        try {
            await installExtension(VUEJS_DEVTOOLS);
        } catch (error: any) {
            console.error("Vue Devtools failed to install:", error.toString());
        }
    }

    createWindow();
});

if (isDevelopment) {
    if (process.platform === "win32") {
        process.on("message", (data) => {
            if (data === "graceful-exit") app.quit();
        });
    } else {
        process.on("SIGTERM", () => app.quit());
    }
}
