const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    response: (channel, listener) => {
        const onceListener = (event, ...args) => {
          ipcRenderer.removeListener(channel, onceListener);
          listener(...args);
        };
        
        ipcRenderer.on(channel, onceListener);
    },
    saveData: (data) => ipcRenderer.send('save-data', data),
    saveUserData: (data) => ipcRenderer.send('save-user-data', data),
    getData: () => ipcRenderer.send('get-data'),
    openFileBrowser: (type) => ipcRenderer.send('open-file-browser', type),

    getUserData: () => ipcRenderer.send('get-user-data'),
    createLan: (lan) => ipcRenderer.send('create-lan', lan),
    openLan: (lan) => ipcRenderer.send('open-lan', lan),
    getFolderStructure: () => ipcRenderer.send('get-folder-structure'),
    moveFileRequest: (filepath, destinypath) => ipcRenderer.send('move-file-request', filepath, destinypath),
})