const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petAPI', {
  moveWindow: (dx, dy) => ipcRenderer.send('move-window', { dx, dy }),
  setPosition: (x, y) => ipcRenderer.send('set-position', { x, y }),
  getBounds: () => ipcRenderer.invoke('get-bounds'),
  onAction: (callback) => ipcRenderer.on('action', (_, action) => callback(action)),
  getActivePet: () => ipcRenderer.invoke('get-active-pet'),
  onConfigChanged: (callback) => ipcRenderer.on('config-changed', (_, cfg) => callback(cfg)),
  quitApp: () => ipcRenderer.send('quit-app'),
  openSettings: () => ipcRenderer.send('open-settings'),
  setIgnoreMouseEvents: (ignore, opts) => ipcRenderer.send('set-ignore-mouse', ignore, opts),
  onInputEvent: (callback) => ipcRenderer.on('input-event', (_, type) => callback(type)),
  getScreenSize: () => ipcRenderer.invoke('get-screen-size'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  claudeChat: (msg) => ipcRenderer.invoke('claude-chat', msg),
  claudeClearHistory: () => ipcRenderer.send('claude-clear-history'),
});
