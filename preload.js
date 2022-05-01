const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onFocus: (callback) => ipcRenderer.on('focus', callback),
  onBlur: (callback) => ipcRenderer.on('blur', callback),
  url: (callback) => ipcRenderer.on('url', callback),
  requestUrl: () => ipcRenderer.invoke('requestUrl'),
  requestClose: () => ipcRenderer.invoke('requestClose'),
});
