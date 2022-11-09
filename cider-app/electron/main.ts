import {app, BrowserWindow, screen, systemPreferences } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  const defaultSize : {width: number, height: number} = {width: 1000, height: 800};
  const screenSize = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: screenSize.width / 2 - defaultSize.width / 2,
    y: screenSize.height / 2 - defaultSize.height / 2,
    width: defaultSize.width,
    height: defaultSize.height,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    trafficLightPosition: { x: 20, y: 22 },
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve),
      contextIsolation: false
    }
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    // Path when running electron in local folder
    if (fs.existsSync(path.join(__dirname, '../../dist/cider/index.html'))) {
      pathIndex = '../../dist/cider/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    const window = createWindow();
    Object.defineProperty(window, "isElectron", { get: () => true });

    // If on mac, push the menu icon over for the traffic lights to fit in title bar
    if (process.platform === 'darwin') {
      var css = ".site-wrapper .logo-image { margin-left: 80px; }"
      win.webContents.insertCSS(css, {
        cssOrigin: 'author'
      });
    }

    // Enable double click on titlebar maximize/minimize
    win.webContents.on("ipc-message", (event: Event, channel: string) => {
      if (channel === "window.titlebar-double-clicked") {
        const action: string =
          systemPreferences.getUserDefault("AppleActionOnDoubleClick", "string") || "Maximize";
        if (action === "Minimize") {
          win.minimize();
        } else {
          win.isMaximized() ? win.unmaximize() : win.maximize();
        }
      }
    });
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}