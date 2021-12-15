const { app, BrowserWindow, Menu, ipcMain } = require("electron");

function createWindow () {
    const win = new BrowserWindow({
        minWidth: 800,
        show: false,
        frame: false,
        icon: "src/images/logo.png",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false // If not present, require statements will lead to errors
        }
    });

    ipcMain.on("dev-tools", () => {
        win.toggleDevTools();
    });

    ipcMain.on("minimize", () => {
        win.minimize();
    });

    ipcMain.on("close", () => {
        win.close();
    });

    Menu.setApplicationMenu(null);
    
    win.loadFile("templates/index.html");
    win.maximize();
    win.show();
}

app.whenReady().then(() => {
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform != "darwin") {
        app.quit();
    }
});