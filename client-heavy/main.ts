const { app, BrowserWindow } = require('electron');

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (window === null) createWindow();
});

function createWindow() {
    let windowElectron = new BrowserWindow({
        width: 800,
        height: 800,
        backgroundColor: '#ffffff',
    });
    windowElectron.loadFile('dist/client/index.html');

    windowElectron.on('closed', function () {
        windowElectron = null;
    });
}
