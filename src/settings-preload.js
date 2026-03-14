const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('settingsAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (cfg) => ipcRenderer.send('save-config', cfg),
  addPetImage: () => ipcRenderer.invoke('add-pet-image'),
  deletePet: (id) => ipcRenderer.send('delete-pet', id),
  saveCartoonPet: (name, dataUrl) => ipcRenderer.invoke('save-cartoon-pet', name, dataUrl),
  getGrowth: () => ipcRenderer.invoke('get-growth'),
  addCompanion: (breedId) => ipcRenderer.invoke('add-companion', breedId),
  removeCompanion: (breedId) => ipcRenderer.send('remove-companion', breedId),
  getCompanions: () => ipcRenderer.invoke('get-companions'),
});
