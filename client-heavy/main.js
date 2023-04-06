const { app, BrowserWindow } = require('electron');
const pathLinker = require('path');
let appWindow;
let popup;

function initWindow() {
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

    
    appWindow.on('closed', function() {
        if(popup){
            popup.removeAllListeners('closed');
            popup.close();
        }
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
ipcMain.on('open-chat', () => {
    createWindow();
});

const createWindow = () => {
    popup = new BrowserWindow({
        width: 1400,
        height: 810,
        webPreferences: {
            nodeIntegration: true,
            preload: pathLinker.join(__dirname, 'preload-popup.js'),
            contextIsolation: false
        }
    });
    
    const path = `file://${__dirname}/dist/client/index.html#/chat`;
    popup.loadURL(path);
    popup.setMenuBarVisibility(false)
    popup.on('closed', function() {
        appWindow.webContents.send('close-chat');
        ipcMain.removeAllListeners('update-theme');
        ipcMain.removeAllListeners('update-language');
        ipcMain.removeAllListeners('update-game-chat');
        popup = null;
    });

    ipcMain.on('update-theme', () => {
        popup.webContents.send('update-theme');
    });
    
    ipcMain.on('update-language', () => {
        popup.webContents.send('update-language');
    });

    ipcMain.on('update-game-chat', () => {
        popup.webContents.send('update-game-chat');
    });
}

