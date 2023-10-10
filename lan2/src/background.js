'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const path = require('path');
const fs = require('fs');
const isDevelopment = process.env.NODE_ENV !== 'production'

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let win

async function createWindow() {
  const preloadFilePath = path.join(__dirname, '../src', 'preload.js')

  win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    roundedCorners: false,
    hasShadow: false,
    backgroundColor: '#121212',
    webPreferences: {
      preload: preloadFilePath,
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async () => {
  protocol.registerFileProtocol('safe-protocol', (request, callback) => {
    const pathname = decodeURI(request.url.replace('safe-protocol://', ''));
    return callback(decodeURIComponent(pathname));
  });

  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
  ipcMain.on('save-data', (event, data) => {
    const filePath = path.join(__dirname, '../src/assets', 'data.json');
    fs.writeFile(filePath, JSON.stringify(data), ()=>{});
  });
  ipcMain.on('get-data', (event, data) => {
    const filePath = path.join(__dirname, '../src/assets', 'data.json');
    fs.readFile(filePath, 'utf-8', (err, data) => {
      const message = JSON.parse(data);
      win.webContents.send('get-data-response', message);
    });
  });
  ipcMain.on('open-file-browser', (event, type) => {
    let filters;

    if (type === 'image') {
      filters = [{ name: 'Images', extensions: ['jpg', 'png'] }];
    } 
    else if (type === 'text') {
      filters = [{ name: 'Markdown, Text, JSON', extensions: ['md', 'txt', 'json'] }];
    } else {
      // Default to open any file type if type is not specified or recognized.
      filters = [];
    }

    const options = {
      filters: filters,
    };
  
    dialog.showOpenDialog(win, options).then(result => {
      if (!result.canceled && result.filePaths.length > 0) {
        const selectedDocument = result.filePaths[0];
        if (type === 'text') {
          fs.readFile(selectedDocument, 'utf-8', (err, data) => {
            win.webContents.send('open-file-browser-response', data);
          });
        }
        else {
          win.webContents.send('open-file-browser-response', selectedDocument);
        }
      }
      else {
        win.webContents.send('open-file-browser-response' , null)
      }
    });
  });
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
