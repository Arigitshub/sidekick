const { contextBridge, ipcRenderer, clipboard } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getClipboardItems: () => {
    // For now, just return a simple list or the current one
    return clipboard.readText();
  },
  onClipboardUpdate: (callback) => {
    // This requires polling or a main-process watcher
  },
  platform: process.platform,
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});
