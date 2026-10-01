const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onFocus: (callback) => ipcRenderer.on('focus', callback),
  onBlur: (callback) => ipcRenderer.on('blur', callback),
  config: (callback) => ipcRenderer.on('config', callback),
  configFile: (callback) => ipcRenderer.on('configFile', callback),
  saved: (callback) => ipcRenderer.on('saved', callback),
  settings: (data) => ipcRenderer.on('settings', data),
  requestFocusEvent: () => ipcRenderer.invoke('requestFocusEvent'),
  requestConfig: () => ipcRenderer.invoke('requestConfig'),
  requestClose: () => ipcRenderer.invoke('requestClose'),
  requestConfigFile: () => ipcRenderer.invoke('requestConfigFile'),
  requestHelp: () => ipcRenderer.invoke('requestHelp'),
  requestSave: (data) => ipcRenderer.invoke('requestSave', data),
  requestSaveAs: (data) => ipcRenderer.invoke('requestSaveAs', data),
  requestLaunch: (data) => ipcRenderer.invoke('requestLaunch', data),
  getSettings: () => ipcRenderer.invoke('getSettings'),
  saveSettings: (data) => ipcRenderer.invoke('saveSettings', data),
});
