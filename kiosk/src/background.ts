import { app, protocol, BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
// import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";

const isDevelopment = process.env.NODE_ENV === "development";

protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { secure: true, standard: true } }]);

async function createWindow() {
    const window = new BrowserWindow({
        title: "Block One Cast",
        fullscreen: !isDevelopment,
        frame: isDevelopment,
        darkTheme: true,
        backgroundColor: "#000",
        webPreferences: {
            // nodeIntegration: (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
            nodeIntegration: true,
            // enableRemoteModule: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: true,
            // nativeWindowOpen: true
        },
    });

    window.setTitle("Block One Cast");

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        await window.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
        // await window.loadURL("data:text/html;charset=utf-8,<h1>Hello, Electron!</h1>");

        if (!process.env.IS_TEST) window.webContents.openDevTools({ mode: "detach" });
    } else {
        createProtocol("app");

        window.loadURL("app://./index.html");
    }
}

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-rasterization');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch("disable-site-isolation-trials");

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("ready", () => {
    if (isDevelopment && !process.env.IS_TEST) {
        try {
            // await installExtension(VUEJS_DEVTOOLS);
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
