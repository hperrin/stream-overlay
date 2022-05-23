const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onFocus: (callback) => ipcRenderer.on('focus', callback),
  onBlur: (callback) => ipcRenderer.on('blur', callback),
  config: (callback) => ipcRenderer.on('config', callback),
  requestConfig: () => ipcRenderer.invoke('requestConfig'),
  requestClose: () => ipcRenderer.invoke('requestClose'),
});
