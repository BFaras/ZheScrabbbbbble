const { app, BrowserWindow } = require('electron');
const pathLinker = require('path');
let appWindow;

function initWindow() {
    console.log("TEST 0");
    console.log(pathLinker.join(__dirname, 'preload.js'));
    appWindow = new BrowserWindow({
        // fullscreen: true,
        name: "Scrabble",
        height: 1600,
        width: 2000,
        webPreferences: {
            // plugins: true, 
            preload: pathLinker.join(__dirname, 'preload.js'),
            nodeIntegration: true, 
            contextIsolation: false,
            enableRemoteModule: true, 
            // backgroundThrottling: false,
            // webSecurity: false 
        },
        icon: "./assets/images/logo.png",
    });

    // Electron Build Path
    const path = `file://${__dirname}/dist/client/index.html`;
    appWindow.loadURL(path);

    appWindow.setMenuBarVisibility(false)

    // Initialize the DevTools.
    // appWindow.webContents.openDevTools()

    appWindow.on('closed', function () {
        appWindow = null;
    });
}

app.on('ready', initWindow);

// Close when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (appWindow === null) {
        initWindow();
    }
});

//ipc
const { ipcMain } = require('electron')
ipcMain.on('asynchronous-message', (event, arg) => {
    createWindow(arg);
})

const createWindow = (args) => {
    const win = new BrowserWindow({
        width: 1400,
        height: 810,
    });

    const path = `file://${__dirname}/dist/client/index.html#/chat`;
    win.loadURL(path);
    win.on('closed', function() {
        appWindow.webContents.send('reactivate-chatbox', '');
    })
}
