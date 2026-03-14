const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('settingsAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (cfg) => ipcRenderer.send('save-config', cfg),
  addPetImage: () => ipcRenderer.invoke('add-pet-image'),
  deletePet: (id) => ipcRenderer.send('delete-pet', id),
  saveCartoonPet: (name, dataUrl) => ipcRenderer.invoke('save-cartoon-pet', name, dataUrl),
});
