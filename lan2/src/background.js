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

function createWindow(devPath) {
  let win = new BrowserWindow({
    width: 700,
    height: 700,
    backgroundColor: '#262626',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 11, y: 12 },
    frame: false,
    hasShadow: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, '../src/preload.js')
    }
  })
  win.setMaximizable(false);
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + devPath)
  }
  else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }

  return win
}

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow('home.html')
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
  createWindow('home.html')
  ipcMain.on('save-data', (event, data) => {
    const filePath = path.join(__dirname, '../src/assets', 'data.json');
    fs.writeFile(filePath, JSON.stringify(data), ()=>{});
  });
  ipcMain.on('get-data', () => {
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
