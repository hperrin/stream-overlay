const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onFocus: (callback) => ipcRenderer.on('focus', callback),
  onBlur: (callback) => ipcRenderer.on('blur', callback),
  config: (callback) => ipcRenderer.on('config', callback),
  configFile: (callback) => ipcRenderer.on('configFile', callback),
  requestFocusEvent: () => ipcRenderer.invoke('requestFocusEvent'),
  requestConfig: () => ipcRenderer.invoke('requestConfig'),
  requestClose: () => ipcRenderer.invoke('requestClose'),
  requestConfigFile: () => ipcRenderer.invoke('requestConfigFile'),
  requestHelp: () => ipcRenderer.invoke('requestHelp'),
});
