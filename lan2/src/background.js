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

class User {
  constructor() {
    this.username = null
    this.github = null
    this.lans = []
    this.settings = null
  }
}

class Lan {
  constructor(name, location) {
    this.name = name
    this.location = location
    this.showing =  'board'
    this.concepts =  []
    this.relations =  []
    this.categories =  []
    this.statements = []
    this.conditions =  []
    this.actions =  []
    this.selectingArea =  false
    this.drawer =  false
    this.loaded =  false
    this.contents =  []
    this.zoomVal =  1
    this.objectType =  null
    this.contentType =  null
  }
}

let win
let currentLan

function generateTreeData(dirPath) {
  function readDirectoryRecursively(currentPath, parentDirectories = []) {
    const files = fs.readdirSync(currentPath);

    const treeNodes = files.map((file) => {
      if (file === '.DS_Store' || file.endsWith('.json') || file.endsWith('.obsidian')) {
        return null;
      }

      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      const isDirectory = stat.isDirectory();
      const fileName = path.parse(file).name;

      const ancestors = [...parentDirectories];

      return {
        id: filePath,
        name: fileName,
        children: isDirectory ? readDirectoryRecursively(filePath, [...parentDirectories, fileName]) : [],
        open: false,
        isDirectory,
        ancestors,
      };
    });

    // Filter out the null values and sort the nodes.
    const sortedTreeNodes = treeNodes.filter((node) => node !== null)
      .sort((a, b) => {
        // Files come first, then directories.
        if (a.isDirectory === b.isDirectory) {
          return 0;
        } else if (a.isDirectory) {
          return -1; // 'a' is a directory, it should come after 'b'.
        } else {
          return 1; // 'a' is a file, it should come before 'b'.
        }
      });

    return sortedTreeNodes;
  }

  return readDirectoryRecursively(dirPath);
}

function createHomeWindow(devPath) {
  let win = new BrowserWindow({
    width: 700,
    height: 700,
    backgroundColor: '#ffffff',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 11, y: 12 },
    frame: false,
    //hasShadow: false,
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

function createLanWindow(devPath) {
  let win = new BrowserWindow({
    width: 1025,
    height: 800,
    titleBarStyle: 'hidden',
    backgroundColor: '#ffffff',
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
  if (BrowserWindow.getAllWindows().length === 0) { 
    win = createHomeWindow('home.html')
  }
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

  win = createHomeWindow('home.html')

  // ----------------------------------------------------------------------- //
  // -------------------------------- Both --------------------------------- //
  // ----------------------------------------------------------------------- //

  ipcMain.on('open-file-browser', (event, type) => {
    let filters;
    let options;

    if (type === 'image') {
      filters = [{ name: 'Images', extensions: ['jpg', 'png'] }];
      options = {
        filters: filters,
      }
    } 
    else if (type === 'text') {
      filters = [{ name: 'Markdown, Text, JSON', extensions: ['md', 'txt', 'json'] }];
      options = {
        filters: filters,
      }
    }
    else if (type === 'dir') {
      options = {
        properties: ['openDirectory'],
      };
    } 
    else {
      // Default to open any file type if type is not specified or recognized.
      filters = [];
      options = {
        filters: filters,
      }
    }

  
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

  // ----------------------------------------------------------------------- //
  // ----------------------------- Home Window ----------------------------- //
  // ----------------------------------------------------------------------- //

  ipcMain.on('get-user-data', () => {
    const filePath = path.join(__dirname, '../src/assets', '.data.json');
    fs.readFile(filePath, 'utf-8', (err, data) => {
      const message = JSON.parse(data);

      if (Object.keys(message).length === 0) {
        let user = new User()
        let data = JSON.stringify(user)

        fs.writeFile(filePath, data, ()=>{});
        win.webContents.send('get-user-data-response', user);
      }
      else {

        win.webContents.send('get-user-data-response', message);
      }
    });
  });

  ipcMain.on('open-lan', (event, data) => {
    win.close()
    win = createLanWindow('lan.html')

    currentLan = data

    //win.webContents.send(data)
  })

  ipcMain.on('create-lan', (event, data) => {
    try {
      const lanPath = path.join(data.location, data.name);

      fs.mkdirSync(lanPath);

      const jsonFilePath = path.join(lanPath, '.lan.json');
      const newLan = new Lan(data.name, data.location)
      fs.writeFileSync(jsonFilePath, JSON.stringify(newLan), 'utf-8');

      win.webContents.send('lan-creation-response', true)
    }
    catch {
      win.webContents.send('lan-creation-response', false)
    }
  })

  ipcMain.on('save-user-data', (event, data) => {
    const filePath = path.join(__dirname, '../src/assets', '.data.json');
    fs.writeFile(filePath, JSON.stringify(data), ()=>{});
  });

  // ----------------------------------------------------------------------- //
  // ----------------------------- Lan Window ------------------------------ //
  // ----------------------------------------------------------------------- //

  ipcMain.on('save-data', (event, data) => {
    const filePath = path.join(currentLan.location, currentLan.name,'.lan.json');
    fs.writeFile(filePath, JSON.stringify(data), ()=>{});
  });

  ipcMain.on('get-data', () => {
    const filePath = path.join(currentLan.location, currentLan.name,'.lan.json');
    fs.readFile(filePath, 'utf-8', (err, data) => {
      const message = JSON.parse(data);
      win.webContents.send('get-data-response', message);
    });
  });

  ipcMain.on('get-folder-structure', (event) => {
    let target = path.join(currentLan.location, currentLan.name)
    win.webContents.send('get-folder-structure-response', generateTreeData(target))
  })

  //Move file from origin to destiny
  ipcMain.on('move-file-request', (event, origin, destiny) => {
    console.log('Moving file requested!')
    const originFilePath = path.resolve(origin);
    const destinyFilePath = path.resolve(destiny);

    if (fs.existsSync(originFilePath)) {
      if (fs.existsSync(destinyFilePath) && fs.statSync(destinyFilePath).isDirectory()) {
        const fileName = path.basename(originFilePath);

        const newFilePath = path.join(destinyFilePath, fileName);

        fs.rename(originFilePath, newFilePath, () => {});
      }
    }
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
