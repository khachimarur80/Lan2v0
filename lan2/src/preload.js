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
})