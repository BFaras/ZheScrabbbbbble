const { app, BrowserWindow } = require('electron');
console.warn("main process");
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "awesome app",
    webPreferences: {
      nodeIntegration: true
    }
  })
  let child = new BrowserWindow({parent:win});
  child.loadFile('chat-page/chat-page.component.html');
  child.show();
  win.loadFile("navigation-bar/navigation-bar.component.html");
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);